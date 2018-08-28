import { apiBase, objectsBase } from './config'

const networkError = () => {
  throw 'Network related error, cannot reach API or object storage.'
}
const handleResponseErrors = (response) => {
  if (!response.ok) {
    throw `API/object storage error (${response.statusCode}): ${response.statusText}`
  }
  return response
}

class Upload {
  constructor(json) {
    console.debug('Created local upload for ' + json.upload_id)
    Object.assign(this, json)
  }

  uploadFile(file) {
    console.assert(this.presigned_url)
    console.debug(`Upload ${file} to ${this.presigned_url}.`)
    const url = this.presigned_url.replace('https://localhost:9000', objectsBase)
    return fetch(this.presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/gzip'
      },
      body: file
    })
    .then(handleResponseErrors)
    .then(() => this)
    .catch(networkError)
  }

  update() {
    return fetch(`${apiBase}/uploads/${this.upload_id}`)
      .then(handleResponseErrors)
      .then(response => response.json())
      .then(uploadJson => {
        Object.assign(this, uploadJson)
        return this
      }).catch(networkError)
  }
}

function createUpload(name) {
  console.debug('Request new upload.')
  const fetchData = {
    method: 'POST',
    body: JSON.stringify({
      name: name
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return fetch(`${apiBase}/uploads`, fetchData)
    .then(handleResponseErrors)
    .then(response => response.json())
    .then(uploadJson => new Upload(uploadJson))
    .catch(networkError)
}

function getUploads() {
  return fetch(`${apiBase}/uploads`)
    .then(handleResponseErrors)
    .then(response => response.json())
    .then(uploadsJson => uploadsJson.map(uploadJson => new Upload(uploadJson)))
    .catch(networkError)
}

function archive(uploadHash, calcHash) {
  return fetch(`${apiBase}/archive/${uploadHash}/${calcHash}`)
    .then(handleResponseErrors)
    .then(response => response.json())
    .catch(networkError)
}

function repo(uploadHash, calcHash) {
  return fetch(`${apiBase}/repo/${uploadHash}/${calcHash}`)
    .then(handleResponseErrors)
    .then(response => response.json())
    .catch(networkError)
}

function repoAll(page, perPage) {
  return fetch(`${apiBase}/repo?page=${page}&per_page=${perPage}`)
    .then(handleResponseErrors)
    .then(response => response.json())
    .catch(networkError)
}

const api = {
  createUpload: createUpload,
  getUploads: getUploads,
  archive: archive,
  repo: repo,
  repoAll: repoAll,
};

export default api;