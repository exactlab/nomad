# Copyright 2018 Markus Scheidgen
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an"AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

'''
This module provides function to establish connections to the database, searchengine, etc.
infrastructure services. Usually everything is setup at once with :func:`setup`. This
is run once for each *api* and *worker* process. Individual functions for partial setups
exist to facilitate testing, aspects of :py:mod:`nomad.cli`, etc.
'''

import os.path
import os
import shutil
from elasticsearch.exceptions import RequestError
from elasticsearch_dsl import connections
from mongoengine import connect, disconnect
from mongoengine.connection import ConnectionFailure
import smtplib
from email.mime.text import MIMEText
from keycloak import KeycloakOpenID, KeycloakAdmin
from keycloak.exceptions import KeycloakAuthenticationError, KeycloakGetError
import json
import jwt
from flask import g, request
import basicauth
from datetime import datetime
import re
import unidecode

from nomad import config, utils

logger = utils.get_logger(__name__)

elastic_client = None
''' The elastic search client. '''

mongo_client = None
''' The pymongo mongodb client. '''


def setup():
    '''
    Uses the current configuration (nomad/config.py and environment) to setup all the
    infrastructure services (repository db, mongo, elastic search) and logging.
    Will create client instances for the databases and has to be called before they
    can be used.
    '''
    setup_files()
    setup_mongo()
    setup_elastic()


def setup_files():
    for directory in [config.fs.public, config.fs.staging, config.fs.tmp]:
        if not os.path.exists(directory):
            os.makedirs(directory)


def setup_mongo(client=False):
    ''' Creates connection to mongodb. '''
    global mongo_client
    try:
        mongo_client = connect(db=config.mongo.db_name, host=config.mongo.host, port=config.mongo.port)
    except ConnectionFailure:
        disconnect()
        mongo_client = connect(db=config.mongo.db_name, host=config.mongo.host, port=config.mongo.port)

    logger.info('setup mongo connection')
    return mongo_client


def setup_elastic():
    ''' Creates connection to elastic search. '''
    global elastic_client
    elastic_client = connections.create_connection(
        hosts=['%s:%d' % (config.elastic.host, config.elastic.port)],
        timeout=60, max_retries=10, retry_on_timeout=True)
    logger.info('setup elastic connection')

    try:
        from nomad.search import entry_document
        entry_document.init(index=config.elastic.index_name)
    except RequestError as e:
        if e.status_code == 400 and 'resource_already_exists_exception' in e.error:
            # happens if two services try this at the same time
            pass
        else:
            raise e

    entry_document._index._name = config.elastic.index_name
    logger.info('initialized elastic index', index_name=config.elastic.index_name)

    return elastic_client


class Keycloak():
    '''
    A class that encapsulates all keycloak related functions for easier mocking and
    configuration
    '''
    def __init__(self):
        self.__oidc_client = None
        self.__admin_client = None
        self.__public_keys = None

    @property
    def _oidc_client(self):
        if self.__oidc_client is None:
            self.__oidc_client = KeycloakOpenID(
                server_url=config.keycloak.server_url,
                client_id=config.keycloak.client_id,
                realm_name=config.keycloak.realm_name,
                client_secret_key=config.keycloak.client_secret)

        return self.__oidc_client

    @property
    def _public_keys(self):
        if self.__public_keys is None:
            try:
                jwks = self._oidc_client.certs()
                self.__public_keys = {}
                for jwk in jwks['keys']:
                    kid = jwk['kid']
                    self.__public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(
                        json.dumps(jwk))
            except Exception as e:
                self.__public_keys = None
                raise e

        return self.__public_keys

    def authorize_flask(self, basic: bool = True) -> str:
        '''
        Authorizes the current flask request with keycloak. Uses either Bearer or Basic
        authentication, depending on available headers in the request. Bearer auth is
        basically offline (besides retrieving and caching keycloaks public key for signature
        validation). Basic auth causes authentication agains keycloak with each request.

        Will set ``g.user``, either with None or user data from the respective OIDC token.

        Returns: An error message or None
        '''
        g.oidc_access_token = None
        if 'Authorization' in request.headers and request.headers['Authorization'].startswith('Bearer '):
            g.oidc_access_token = request.headers['Authorization'].split(None, 1)[1].strip()
        elif 'Authorization' in request.headers and request.headers['Authorization'].startswith('Basic '):
            if not basic:
                return 'Basic authentication not allowed, use Bearer token instead'

            try:
                auth = request.headers['Authorization'].split(None, 1)[1].strip()
                username, password = basicauth.decode(auth)
                token_info = self._oidc_client.token(username=username, password=password)
                g.oidc_access_token = token_info['access_token']
            except KeycloakAuthenticationError:
                return 'Could not authenticate, wrong credentials'
            except Exception as e:
                logger.error('Could not authenticate Basic auth', exc_info=e)
                return 'Could not authenticate Basic auth: %s' % str(e)

        if g.oidc_access_token is not None:
            auth_error: str = None
            try:
                kid = jwt.get_unverified_header(g.oidc_access_token)['kid']
                key = self._public_keys.get(kid)
                if key is None:
                    logger.error('The user provided keycloak public key does not exist. Does the UI use the right realm?')
                    auth_error = 'Could not verify JWT token: public key does not exist'
                else:
                    options = dict(verify_aud=False, verify_exp=True, verify_iss=True)
                    payload = jwt.decode(
                        g.oidc_access_token, key=key, algorithms=['RS256'], options=options,
                        issuer='%s/realms/%s' % (config.keycloak.server_url.rstrip('/'), config.keycloak.realm_name))

            except jwt.InvalidTokenError as e:
                auth_error = str(e)
            except Exception as e:
                logger.error('Could not verify JWT token', exc_info=e)
                raise e

            if auth_error is not None:
                g.user = None
                return auth_error

            else:
                from nomad import datamodel
                g.user = datamodel.User(
                    user_id=payload.get('sub', None),
                    email=payload.get('email', None),
                    first_name=payload.get('given_name', None),
                    last_name=payload.get('family_name', None))

                return None

        else:
            g.user = None
            # Do not return an error. This is the case were there are no credentials
            return None

    def __create_username(self, user):
        if user.first_name is not None and user.last_name is not None:
            user.username = '%s%s' % (user.first_name[:1], user.last_name)
        elif user.last_name is not None:
            user.username = user.last_name
        elif '@' in user.username:
            user.username = user.username.split('@')[0]

        user.username = unidecode.unidecode(user.username.lower())
        user.username = re.sub(r'[^0-9a-zA-Z_\-\.]+', '', user.username)

        index = 1
        try:
            while self.get_user(username=user.username):
                user.username += '%d' % index
                index += 1
        except KeyError:
            pass

    def add_user(self, user, bcrypt_password=None, invite=False):
        '''
        Adds the given :class:`nomad.datamodel.User` instance to the configured keycloak
        realm using the keycloak admin API.
        '''
        from nomad import datamodel
        if not isinstance(user, datamodel.User):
            if 'user_id' not in user:
                user['user_id'] = 'not set'

            if 'password' in user:
                bcrypt_password = user.pop('password')

            created = user.get('created', None)
            if created is not None and not isinstance(created, datetime):
                user['created'] = datetime.fromtimestamp(created / 1000)

            user = datamodel.User(**user)

        if user.username is None or not re.match(r'^[a-zA-Z0-9_\-\.]+$', user.username):
            self.__create_username(user)

        keycloak_user = dict(
            id=user.user_id if user.user_id != 'not set' else None,
            email=user.email,
            username=user.username,
            firstName=user.first_name,
            lastName=user.last_name,
            attributes=dict(
                repo_user_id=user.repo_user_id,
                affiliation=user.affiliation if user.affiliation is not None else '',
                affiliation_address=user.affiliation_address if user.affiliation_address is not None else ''),
            createdTimestamp=user.created.timestamp() * 1000 if user.created is not None else None,
            enabled=True,
            emailVerified=True)

        if invite:
            keycloak_user['requiredActions'] = [
                'UPDATE_PASSWORD', 'UPDATE_PROFILE', 'VERIFY_EMAIL']

        if bcrypt_password is not None:
            keycloak_user['credentials'] = [dict(
                type='password',
                hashedSaltedValue=bcrypt_password,
                algorithm='bcrypt')]

        keycloak_user = {
            key: value for key, value in keycloak_user.items()
            if value is not None}

        if user.user_id != 'not_set':
            try:
                self._admin_client.get_user(user.user_id)
                return 'User %s with given id already exists' % user.email
            except KeycloakGetError:
                pass

        if self._admin_client.get_user_id(user.email) is not None:
            return 'User with email %s already exists' % user.email

        try:
            self._admin_client.create_user(keycloak_user)
        except Exception as e:
            return str(e)

        if invite:
            try:
                user = self.get_user(username=user.username)
                self._admin_client.send_verify_email(user_id=user.user_id)
            except Exception as e:
                logger.error('could not send verify email', exc_info=e)

        return None

    def __user_from_keycloak_user(self, keycloak_user):
        from nomad import datamodel

        kwargs = {key: value[0] for key, value in keycloak_user.get('attributes', {}).items()}
        return datamodel.User(
            user_id=keycloak_user['id'],
            email=keycloak_user.get('email'),
            username=keycloak_user.get('username'),
            first_name=keycloak_user.get('firstName'),
            last_name=keycloak_user.get('lastName'),
            created=datetime.fromtimestamp(keycloak_user['createdTimestamp'] / 1000),
            **kwargs)

    def search_user(self, query: str = None, max=1000, **kwargs):
        if query is not None:
            kwargs['query'] = dict(search=query, max=max)
        else:
            kwargs['query'] = dict(max=max)
        try:
            keycloak_results = self._admin_client.get_users(**kwargs)
        except Exception as e:
            logger.error('Could not retrieve users from keycloak', exc_info=e)
            raise e

        return [
            self.__user_from_keycloak_user(keycloak_user)
            for keycloak_user in keycloak_results]

    def get_user(self, user_id: str = None, username: str = None, user=None) -> object:
        '''
        Retrives all available information about a user from the keycloak admin
        interface. This must be used to retrieve complete user information, because
        the info solely gathered from tokens (i.e. for the authenticated user ``g.user``)
        is generally incomplete.
        '''

        if user is not None and user_id is None:
            user_id = user.user_id

        if username is not None and user_id is None:
            with utils.lnr(logger, 'Could not use keycloak admin client'):
                user_id = self._admin_client.get_user_id(username)

            if user_id is None:
                raise KeyError('User with username %s does not exist' % username)

        assert user_id is not None, 'Could not determine user from given kwargs'

        try:
            keycloak_user = self._admin_client.get_user(user_id)

        except Exception as e:
            if str(getattr(e, 'response_code', 404)) == '404':
                raise KeyError('User does not exist')

            logger.error('Could not retrieve user from keycloak', exc_info=e)
            raise e

        return self.__user_from_keycloak_user(keycloak_user)

    @property
    def _admin_client(self):
        if True:  # TODO (self.__admin_client is None:), client becomes unusable after 60s
            self.__admin_client = KeycloakAdmin(
                server_url=config.keycloak.server_url,
                username=config.keycloak.username,
                password=config.keycloak.password,
                realm_name=config.keycloak.realm_name,
                verify=True)
            self.__admin_client.realm_name = config.keycloak.realm_name

        return self.__admin_client

    @property
    def access_token(self):
        return getattr(g, 'oidc_access_token', None)


keycloak = Keycloak()


def reset(remove: bool):
    '''
    Resets the databases mongo, elastic/calcs, and all files. Be careful.
    In contrast to :func:`remove`, it will only remove the contents of dbs and indicies.
    This function just attempts to remove everything, there is no exception handling
    or any warranty it will succeed.

    Args:
        remove: Do not try to recreate empty databases, remove entirely.
    '''
    try:
        if not mongo_client:
            setup_mongo()
        mongo_client.drop_database(config.mongo.db_name)
        logger.info('mongodb resetted')
    except Exception as e:
        logger.error('exception reset mongodb', exc_info=e)

    try:
        if not elastic_client:
            setup_elastic()
        elastic_client.indices.delete(index=config.elastic.index_name)
        from nomad.search import entry_document
        if not remove:
            entry_document.init(index=config.elastic.index_name)
        logger.info('elastic index resetted')
    except Exception as e:
        logger.error('exception resetting elastic', exc_info=e)

    try:
        shutil.rmtree(config.fs.staging, ignore_errors=True)
        shutil.rmtree(config.fs.public, ignore_errors=True)

        # delete tmp without the folder
        if os.path.isdir(config.fs.tmp):
            for sub_path in os.listdir(config.fs.tmp):
                path = os.path.join(config.fs.tmp, sub_path)
                try:
                    if os.path.isfile(path):
                        os.unlink(path)
                    elif os.path.isdir(path): shutil.rmtree(path, ignore_errors=True)
                except Exception:
                    pass

        logger.info('files resetted')
    except Exception as e:
        logger.error('exception deleting files', exc_info=e)


def send_mail(name: str, email: str, message: str, subject: str):
    """Used to programmatically send mails.

    Args:
        name: The email recipient name.
        email: The email recipient address.
        messsage: The email body.
        subject: The subject line.
    """
    if not config.mail.enabled:
        return

    logger = utils.get_logger(__name__)
    server = smtplib.SMTP(config.mail.host, config.mail.port)

    if config.mail.port == 995:
        try:
            server.starttls()
        except Exception as e:
            logger.warning('Could not use TTS', exc_info=e)

    if config.mail.with_login:
        try:
            server.login(config.mail.user, config.mail.password)
        except Exception as e:
            logger.warning('Could not log into mail server', exc_info=e)

    msg = MIMEText(message)
    msg['Subject'] = subject
    msg['To'] = name
    to_addrs = [email]

    if config.mail.cc_address is not None:
        msg['Cc'] = 'The nomad team <%s>' % config.mail.cc_address
        to_addrs.append(config.mail.cc_address)

    try:
        server.send_message(msg, from_addr=config.mail.from_address, to_addrs=to_addrs)
    except Exception as e:
        logger.error('Could not send email', exc_info=e)

    server.quit()
