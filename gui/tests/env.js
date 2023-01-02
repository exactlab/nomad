window.nomadEnv = {
  "appBase": "http://localhost:8000/fairdi/nomad/latest",
  "northBase": "http://localhost:9000/fairdi/nomad/latest/north",
  "keycloakBase": "https://nomad-lab.eu/fairdi/keycloak/auth/",
  "keycloakRealm": "fairdi_nomad_test",
  "keycloakClientId": "nomad_public",
  "debug": false,
  "encyclopediaBase": "https://nomad-lab.eu/prod/rae/encyclopedia/#",
  "aitoolkitEnabled": false,
  "oasis": false,
  "version": {},
  "globalLoginRequired": false,
  "servicesUploadLimit": 10,
  "ui": {
    "entry_context": {
      "overview": {
        "include": [
          "sections",
          "definitions",
          "nexus",
          "material",
          "electronic",
          "optoelectronic",
          "vibrational",
          "mechanical",
          "thermodynamic",
          "structural",
          "dynamical",
          "geometry_optimization",
          "spectroscopy",
          "references"
        ],
        "exclude": [],
        "options": {
          "sections": {
            "error": "Could not render section card."
          },
          "definitions": {
            "error": "Could not render definitions card."
          },
          "nexus": {
            "error": "Could not render NeXus card."
          },
          "material": {
            "error": "Could not render material card."
          },
          "electronic": {
            "error": "Could not render electronic properties."
          },
          "optoelectronic": {
            "error": "Could not render optoelectronic properties."
          },
          "vibrational": {
            "error": "Could not render vibrational properties."
          },
          "mechanical": {
            "error": "Could not render mechanical properties."
          },
          "thermodynamic": {
            "error": "Could not render thermodynamic properties."
          },
          "structural": {
            "error": "Could not render structural properties."
          },
          "dynamical": {
            "error": "Could not render dynamical properties."
          },
          "geometry_optimization": {
            "error": "Could not render geometry optimization."
          },
          "spectroscopy": {
            "error": "Could not render spectroscopic properties."
          },
          "references": {
            "error": "Could not render references card."
          },
          "relatedResources": {
            "error": "Could not render related resources card."
          }
        }
      }
    },
    "search_contexts": {
      "include": [
        "entries",
        "eln",
        "materials",
        "solar_cells"
      ],
      "exclude": [],
      "options": {
        "entries": {
          "label": "Entries",
          "path": "entries",
          "resource": "entries",
          "breadcrumb": "Entries search",
          "description": "Search individual entries",
          "help": {
            "title": "Entries search",
            "content": "This page allows you to **search entries** within NOMAD. Entries represent\nindividual calculations or experiments that have bee uploaded into NOMAD.\n\nThe search page consists of three main elements: the filter panel, the search\nbar, and the result list.\n\nThe filter panel on the left allows you to graphically explore and enter\ndifferent search filters. It also gives a visual indication of the currently\nactive search filters for each category. This is a good place to start exploring\nthe available search filters and their meaning.\n\nThe search bar allows you to specify filters by typing them in and pressing\nenter. You can also start by simply typing keywords of interest, which will\ntoggle a list of suggestions. For numerical data you can also use range queries,\ne.g. \\`0.0 < band_gap <= 0.1\\`.\n\nNotice that the units used in the filter panel and in the queries can be changed\nusing the **units** button on the top right corner. When using the search bar,\nyou can also specify a unit by typing the unit abbreviations, e.g. \\`band_gap >=\n0.1 Ha\\`\n\nThe result list on the right is automatically updated according to the filters\nyou have specified. You can browse through the results by scrolling through the\navailable items and loading more results as you go. Here you can also change the\nsorting of the results, modify the displayed columns, access individual entries\nor even download the raw data or the archive document by selecting individual\nentries and pressing the download button that appears. The ellipsis button shown\nfor each entry will navigate you to that entry's page. This entry page will show\nmore metadata, raw files, the entry's archive, and processing logs."
          },
          "pagination": {
            "order_by": "upload_create_time",
            "order": "desc",
            "page_size": 20
          },
          "columns": {
            "enable": [
              "entry_name",
              "results.material.chemical_formula_hill",
              "entry_type",
              "upload_create_time",
              "authors"
            ],
            "include": [
              "entry_name",
              "results.material.chemical_formula_hill",
              "entry_type",
              "results.method.method_name",
              "results.method.simulation.program_name",
              "results.method.simulation.dft.basis_set_name",
              "results.method.simulation.dft.xc_functional_type",
              "results.material.structural_type",
              "results.material.symmetry.crystal_system",
              "results.material.symmetry.space_group_symbol",
              "results.material.symmetry.space_group_number",
              "results.eln.lab_ids",
              "results.eln.sections",
              "results.eln.methods",
              "results.eln.tags",
              "results.eln.instruments",
              "mainfile",
              "upload_create_time",
              "authors",
              "comment",
              "references",
              "datasets",
              "published"
            ],
            "exclude": [],
            "options": {
              "entry_name": {
                "label": "Name",
                "align": "left"
              },
              "results.material.chemical_formula_hill": {
                "label": "Formula",
                "align": "left"
              },
              "entry_type": {
                "label": "Entry type",
                "align": "left"
              },
              "results.method.method_name": {
                "label": "Method name"
              },
              "results.method.simulation.program_name": {
                "label": "Program name"
              },
              "results.method.simulation.dft.basis_set_name": {
                "label": "Basis set name"
              },
              "results.method.simulation.dft.xc_functional_type": {
                "label": "XC functional type"
              },
              "results.material.structural_type": {
                "label": "Structural type"
              },
              "results.material.symmetry.crystal_system": {
                "label": "Crystal system"
              },
              "results.material.symmetry.space_group_symbol": {
                "label": "Space group symbol"
              },
              "results.material.symmetry.space_group_number": {
                "label": "Space group number"
              },
              "results.eln.lab_ids": {
                "label": "Lab IDs"
              },
              "results.eln.sections": {
                "label": "Sections"
              },
              "results.eln.methods": {
                "label": "Methods"
              },
              "results.eln.tags": {
                "label": "Tags"
              },
              "results.eln.instruments": {
                "label": "Instruments"
              },
              "mainfile": {
                "label": "Mainfile",
                "align": "left"
              },
              "upload_create_time": {
                "label": "Upload time",
                "align": "left"
              },
              "authors": {
                "label": "Authors",
                "align": "left"
              },
              "comment": {
                "label": "Comment",
                "align": "left"
              },
              "references": {
                "label": "References",
                "align": "left"
              },
              "datasets": {
                "label": "Datasets",
                "align": "left"
              },
              "published": {
                "label": "Access"
              }
            }
          },
          "rows": {
            "actions": {
              "enable": true
            },
            "details": {
              "enable": true
            },
            "selection": {
              "enable": true
            }
          },
          "filter_menus": {
            "include": [
              "material",
              "elements",
              "symmetry",
              "method",
              "simulation",
              "dft",
              "gw",
              "projection",
              "experiment",
              "eels",
              "properties",
              "electronic",
              "optoelectronic",
              "vibrational",
              "mechanical",
              "spectroscopy",
              "thermodynamic",
              "geometry_optimization",
              "eln",
              "author",
              "dataset",
              "access",
              "ids",
              "processed_data_quantities",
              "optimade"
            ],
            "exclude": [],
            "options": {
              "material": {
                "label": "Material",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "elements": {
                "label": "Elements / Formula",
                "level": 1,
                "size": "large",
                "menu_items": {}
              },
              "symmetry": {
                "label": "Symmetry",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "method": {
                "label": "Method",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "simulation": {
                "label": "Simulation",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "dft": {
                "label": "DFT",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "gw": {
                "label": "GW",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "projection": {
                "label": "Projection",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "experiment": {
                "label": "Experiment",
                "level": 1,
                "size": "small"
              },
              "eels": {
                "label": "EELS",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "properties": {
                "label": "Properties",
                "level": 0,
                "size": "small"
              },
              "electronic": {
                "label": "Electronic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "optoelectronic": {
                "label": "Optoelectronic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "vibrational": {
                "label": "Vibrational",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "mechanical": {
                "label": "Mechanical",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "spectroscopy": {
                "label": "Spectroscopy",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "thermodynamic": {
                "label": "Thermodynamic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "geometry_optimization": {
                "label": "Geometry Optimization",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "eln": {
                "label": "Electronic Lab Notebook",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "author": {
                "label": "Author / Origin",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "dataset": {
                "label": "Dataset",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "access": {
                "label": "Access",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "ids": {
                "label": "IDs",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "processed_data_quantities": {
                "label": "Processed Data Quantities",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "optimade": {
                "label": "Optimade",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              }
            }
          },
          "filters": {
            "exclude": [
              "mainfile",
              "entry_name",
              "combine"
            ]
          }
        },
        "eln": {
          "label": "ELN",
          "path": "eln",
          "resource": "entries",
          "breadcrumb": "ELN entries search",
          "description": "Search individual ELN entries",
          "help": {
            "title": "ELN entries search",
            "content": "This page allows you to specifically **search ELN entries** within NOMAD.\nIt is very similar to the *Entries search*, but with a reduced\nfilter set and specialized arrangement of default columns."
          },
          "pagination": {
            "order_by": "upload_create_time",
            "order": "desc",
            "page_size": 20
          },
          "columns": {
            "enable": [
              "entry_name",
              "entry_type",
              "upload_create_time",
              "authors"
            ],
            "include": [
              "entry_name",
              "results.material.chemical_formula_hill",
              "entry_type",
              "results.method.method_name",
              "results.method.simulation.program_name",
              "results.method.simulation.dft.basis_set_name",
              "results.method.simulation.dft.xc_functional_type",
              "results.material.structural_type",
              "results.material.symmetry.crystal_system",
              "results.material.symmetry.space_group_symbol",
              "results.material.symmetry.space_group_number",
              "results.eln.lab_ids",
              "results.eln.sections",
              "results.eln.methods",
              "results.eln.tags",
              "results.eln.instruments",
              "mainfile",
              "upload_create_time",
              "authors",
              "comment",
              "references",
              "datasets",
              "published"
            ],
            "exclude": [],
            "options": {
              "entry_name": {
                "label": "Name",
                "align": "left"
              },
              "results.material.chemical_formula_hill": {
                "label": "Formula",
                "align": "left"
              },
              "entry_type": {
                "label": "Entry type",
                "align": "left"
              },
              "results.method.method_name": {
                "label": "Method name"
              },
              "results.method.simulation.program_name": {
                "label": "Program name"
              },
              "results.method.simulation.dft.basis_set_name": {
                "label": "Basis set name"
              },
              "results.method.simulation.dft.xc_functional_type": {
                "label": "XC functional type"
              },
              "results.material.structural_type": {
                "label": "Structural type"
              },
              "results.material.symmetry.crystal_system": {
                "label": "Crystal system"
              },
              "results.material.symmetry.space_group_symbol": {
                "label": "Space group symbol"
              },
              "results.material.symmetry.space_group_number": {
                "label": "Space group number"
              },
              "results.eln.lab_ids": {
                "label": "Lab IDs"
              },
              "results.eln.sections": {
                "label": "Sections"
              },
              "results.eln.methods": {
                "label": "Methods"
              },
              "results.eln.tags": {
                "label": "Tags"
              },
              "results.eln.instruments": {
                "label": "Instruments"
              },
              "mainfile": {
                "label": "Mainfile",
                "align": "left"
              },
              "upload_create_time": {
                "label": "Upload time",
                "align": "left"
              },
              "authors": {
                "label": "Authors",
                "align": "left"
              },
              "comment": {
                "label": "Comment",
                "align": "left"
              },
              "references": {
                "label": "References",
                "align": "left"
              },
              "datasets": {
                "label": "Datasets",
                "align": "left"
              },
              "published": {
                "label": "Access"
              }
            }
          },
          "rows": {
            "actions": {
              "enable": true
            },
            "details": {
              "enable": true
            },
            "selection": {
              "enable": true
            }
          },
          "filter_menus": {
            "include": [
              "material",
              "elements",
              "eln",
              "custom_quantities",
              "author",
              "dataset",
              "access",
              "ids",
              "processed_data_quantities",
              "optimade"
            ],
            "exclude": [],
            "options": {
              "material": {
                "label": "Material",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "elements": {
                "label": "Elements / Formula",
                "level": 1,
                "size": "large",
                "menu_items": {}
              },
              "eln": {
                "label": "Electronic Lab Notebook",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "custom_quantities": {
                "label": "Custom quantities",
                "level": 0,
                "size": "large",
                "menu_items": {}
              },
              "author": {
                "label": "Author / Origin",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "dataset": {
                "label": "Dataset",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "access": {
                "label": "Access",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "ids": {
                "label": "IDs",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "processed_data_quantities": {
                "label": "Processed Data Quantities",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "optimade": {
                "label": "Optimade",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              }
            }
          },
          "filters": {
            "exclude": [
              "mainfile",
              "entry_name",
              "combine"
            ]
          }
        },
        "materials": {
          "label": "Materials",
          "path": "materials",
          "resource": "materials",
          "breadcrumb": "Materials search",
          "description": "Search materials that are identified from the entries",
          "help": {
            "title": "Materials search",
            "content": "This page allows you to **search materials** within NOMAD. NOMAD can\nautomatically detect the material from individual entries and can then group the\ndata by using these detected materials. This allows you to search individual\nmaterials which have properties that are aggregated from several entries.\n\nThe search page consists of three main elements: the filter panel, the search\nbar, and the result list.\n\nThe filter panel on the left allows you to graphically explore and enter\ndifferent search filters. It also gives a visual indication of the currently\nactive search filters for each category. This is a good place to start exploring\nthe available search filters and their meaning.\n\nThe search bar allows you to specify filters by typing them in and pressing\nenter. You can also start by simply typing keywords of interest, which will\ntoggle a list of suggestions. For numerical data you can also use range queries,\ne.g. \\`0.0 < band_gap <= 0.1\\`.\n\nThe units used in the filter panel and in the queries can be changed\nusing the **units** button on the top right corner. When using the search bar,\nyou can also specify a unit by typing the unit abbreviations, e.g. \\`band_gap >=\n0.1 Ha\\`.\n\nNotice that by default the properties that you search can be combined from\nseveral different entries. If instead you wish to search for a material with an\nindividual entry fullfilling your search criteria, uncheck the **combine results\nfrom several entries**-checkbox.\n\nThe result list on the right is automatically updated according to the filters\nyou have specified. You can scroll through the available items and load more\nresults as you go. Here you can also change the sorting of the results, modify\nthe displayed columns and access individual materials. The ellipsis button shown\nfor each material will navigate you into the material overview page within the\nNOMAD Encyclopedia. This page will show a more detailed overview for that\nspecific material."
          },
          "pagination": {
            "order_by": "chemical_formula_hill",
            "order": "asc"
          },
          "columns": {
            "enable": [
              "chemical_formula_hill",
              "structural_type",
              "symmetry.structure_name",
              "symmetry.space_group_number",
              "symmetry.crystal_system"
            ],
            "include": [
              "chemical_formula_hill",
              "structural_type",
              "symmetry.structure_name",
              "symmetry.crystal_system",
              "symmetry.space_group_symbol",
              "symmetry.space_group_number",
              "material_id"
            ],
            "exclude": [],
            "options": {
              "chemical_formula_hill": {
                "label": "Formula",
                "align": "left"
              },
              "structural_type": {
                "label": "Structural type"
              },
              "symmetry.structure_name": {
                "label": "Structure name"
              },
              "symmetry.crystal_system": {
                "label": "Crystal system"
              },
              "symmetry.space_group_symbol": {
                "label": "Space group symbol"
              },
              "symmetry.space_group_number": {
                "label": "Space group number"
              },
              "material_id": {
                "label": "Material ID"
              }
            }
          },
          "rows": {
            "actions": {
              "enable": true
            },
            "details": {
              "enable": false
            },
            "selection": {
              "enable": false
            }
          },
          "filter_menus": {
            "include": [
              "material",
              "elements",
              "symmetry",
              "method",
              "simulation",
              "dft",
              "gw",
              "projection",
              "experiment",
              "eels",
              "properties",
              "electronic",
              "optoelectronic",
              "vibrational",
              "mechanical",
              "spectroscopy",
              "thermodynamic",
              "geometry_optimization",
              "eln",
              "author",
              "dataset",
              "access",
              "ids",
              "processed_data_quantities",
              "optimade",
              "combine"
            ],
            "exclude": [],
            "options": {
              "material": {
                "label": "Material",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "elements": {
                "label": "Elements / Formula",
                "level": 1,
                "size": "large",
                "menu_items": {}
              },
              "symmetry": {
                "label": "Symmetry",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "method": {
                "label": "Method",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "simulation": {
                "label": "Simulation",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "dft": {
                "label": "DFT",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "gw": {
                "label": "GW",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "projection": {
                "label": "Projection",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "experiment": {
                "label": "Experiment",
                "level": 1,
                "size": "small"
              },
              "eels": {
                "label": "EELS",
                "level": 2,
                "size": "small",
                "menu_items": {}
              },
              "properties": {
                "label": "Properties",
                "level": 0,
                "size": "small"
              },
              "electronic": {
                "label": "Electronic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "optoelectronic": {
                "label": "Optoelectronic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "vibrational": {
                "label": "Vibrational",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "mechanical": {
                "label": "Mechanical",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "spectroscopy": {
                "label": "Spectroscopy",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "thermodynamic": {
                "label": "Thermodynamic",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "geometry_optimization": {
                "label": "Geometry Optimization",
                "level": 1,
                "size": "small",
                "menu_items": {}
              },
              "eln": {
                "label": "Electronic Lab Notebook",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "author": {
                "label": "Author / Origin",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "dataset": {
                "label": "Dataset",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "access": {
                "label": "Access",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "ids": {
                "label": "IDs",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "processed_data_quantities": {
                "label": "Processed Data Quantities",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "optimade": {
                "label": "Optimade",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "combine": {
                "actions": {
                  "include": [
                    "combine"
                  ],
                  "options": {
                    "combine": {
                      "type": "checkbox",
                      "label": "Combine results from several entries",
                      "quantity": "combine"
                    }
                  }
                }
              }
            }
          },
          "filters": {
            "exclude": [
              "mainfile",
              "entry_name"
            ]
          }
        },
        "solar_cells": {
          "label": "Solar Cells",
          "path": "solar-cells",
          "resource": "entries",
          "breadcrumb": "Solar cells search",
          "description": "Search solar cells in NOMAD",
          "help": {
            "title": "Solar cells search",
            "content": "This page allows you to **search solar cells** within NOMAD.\nYou can search for solar cells by their properties, by the chemistry of the absorber layer,\npreparation method, or their origin.\n\nThe search page consists of three main elements: the filter panel, the search\nbar, and the result list.\n\nThe filter panel on the left allows you to graphically explore and enter\ndifferent search filters. It also gives a visual indication of the currently\nactive search filters for each category. This is a good place to start exploring\nthe available search filters and their meaning. But clikcing in the \"+\" button\nyou could add the filter widgets to the central part of the page and combine them.\nTry adding the periodic table widget to the main pannel and select some elements\ncontained in the absorber layer.\n\nThe search bar allows you to specify filters by typing them in and pressing\nenter. You can also start by simply typing keywords of interest, which will\ntoggle a list of suggestions. For numerical data you can also use range queries,\ne.g. \\`0.0 < efficiency <= 20.1\\`.\n\nThe units used in the filter panel and in the queries can be changed\nusing the **units** button on the top right corner. When using the search bar,\nyou can also specify a unit by typing the unit abbreviations, e.g. \\`band_gap >=\n0.1 Ha\\`.\n\nThe result list on the right is automatically updated according to the filters\nyou have specified. You can browse through the results by scrolling through the\navailable items and loading more results as you go. Here you can also change the\nsorting of the results, modify the displayed columns, download the raw data\nor the archive document by selecting individual entries and pressing the download\ncloud button that appears.\n\nThe ellipsis button (three dots) shown for each entry will navigate\nyou to that entry's page. This entry page will show more metadata,\nraw files, the entry's archive, and processing logs."
          },
          "pagination": {
            "order_by": "results.properties.optoelectronic.solar_cell.efficiency",
            "order": "desc",
            "page_size": 20
          },
          "dashboard": {
            "widgets": [
              {
                "type": "periodictable",
                "scale": "linear",
                "quantity": "results.material.elements",
                "layout": {
                  "xxl": {
                    "minH": 8,
                    "minW": 12,
                    "h": 8,
                    "w": 13,
                    "y": 0,
                    "x": 0
                  },
                  "xl": {
                    "minH": 8,
                    "minW": 12,
                    "h": 8,
                    "w": 12,
                    "y": 0,
                    "x": 0
                  },
                  "lg": {
                    "minH": 8,
                    "minW": 12,
                    "h": 8,
                    "w": 12,
                    "y": 0,
                    "x": 0
                  },
                  "md": {
                    "minH": 8,
                    "minW": 12,
                    "h": 8,
                    "w": 12,
                    "y": 0,
                    "x": 0
                  },
                  "sm": {
                    "minH": 8,
                    "minW": 12,
                    "h": 8,
                    "w": 12,
                    "y": 16,
                    "x": 0
                  }
                }
              },
              {
                "type": "scatterplot",
                "autorange": true,
                "size": 1000,
                "color": "results.properties.optoelectronic.solar_cell.short_circuit_current_density",
                "y": "results.properties.optoelectronic.solar_cell.efficiency",
                "x": "results.properties.optoelectronic.solar_cell.open_circuit_voltage",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 8,
                    "w": 12,
                    "y": 0,
                    "x": 24
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 8,
                    "w": 9,
                    "y": 0,
                    "x": 12
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 12,
                    "y": 8,
                    "x": 0
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 9,
                    "y": 8,
                    "x": 0
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 5,
                    "w": 6,
                    "y": 0,
                    "x": 0
                  }
                }
              },
              {
                "type": "scatterplot",
                "autorange": true,
                "size": 1000,
                "color": "results.properties.optoelectronic.solar_cell.device_architecture",
                "y": "results.properties.optoelectronic.solar_cell.efficiency",
                "x": "results.properties.optoelectronic.solar_cell.open_circuit_voltage",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 8,
                    "w": 11,
                    "y": 0,
                    "x": 13
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 8,
                    "w": 9,
                    "y": 0,
                    "x": 21
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 12,
                    "y": 14,
                    "x": 0
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 9,
                    "y": 8,
                    "x": 9
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 5,
                    "w": 6,
                    "y": 0,
                    "x": 6
                  }
                }
              },
              {
                "type": "terms",
                "inputfields": true,
                "scale": "linear",
                "quantity": "results.properties.optoelectronic.solar_cell.device_stack",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 14
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 14
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 0,
                    "x": 12
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 4,
                    "w": 6,
                    "y": 4,
                    "x": 12
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 4,
                    "y": 10,
                    "x": 0
                  }
                }
              },
              {
                "type": "histogram",
                "autorange": true,
                "nbins": 30,
                "scale": "1/4",
                "quantity": "results.properties.optoelectronic.solar_cell.illumination_intensity",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 3,
                    "w": 8,
                    "y": 8,
                    "x": 0
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 3,
                    "w": 8,
                    "y": 11,
                    "x": 0
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 4,
                    "w": 12,
                    "y": 12,
                    "x": 12
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 3,
                    "w": 8,
                    "y": 17,
                    "x": 10
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 3,
                    "w": 8,
                    "y": 13,
                    "x": 4
                  }
                }
              },
              {
                "type": "terms",
                "inputfields": true,
                "scale": "linear",
                "quantity": "results.properties.optoelectronic.solar_cell.absorber_fabrication",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 8
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 8
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 0,
                    "x": 18
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 4,
                    "w": 6,
                    "y": 0,
                    "x": 12
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 5,
                    "w": 4,
                    "y": 5,
                    "x": 0
                  }
                }
              },
              {
                "type": "histogram",
                "inputfields": false,
                "autorange": false,
                "nbins": 30,
                "scale": "1/4",
                "quantity": "results.properties.optoelectronic.band_gap_optical.value",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 8,
                    "h": 3,
                    "w": 8,
                    "y": 11,
                    "x": 0
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 8,
                    "h": 3,
                    "w": 8,
                    "y": 8,
                    "x": 0
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 8,
                    "h": 4,
                    "w": 12,
                    "y": 16,
                    "x": 12
                  },
                  "md": {
                    "minH": 3,
                    "minW": 8,
                    "h": 3,
                    "w": 8,
                    "y": 14,
                    "x": 10
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 8,
                    "h": 3,
                    "w": 8,
                    "y": 10,
                    "x": 4
                  }
                }
              },
              {
                "type": "terms",
                "inputfields": true,
                "scale": "linear",
                "quantity": "results.properties.optoelectronic.solar_cell.electron_transport_layer",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 20
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 5,
                    "y": 8,
                    "x": 25
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 6,
                    "x": 18
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 5,
                    "y": 14,
                    "x": 0
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 5,
                    "w": 4,
                    "y": 5,
                    "x": 4
                  }
                }
              },
              {
                "type": "terms",
                "inputfields": true,
                "scale": "linear",
                "quantity": "results.properties.optoelectronic.solar_cell.hole_transport_layer",
                "layout": {
                  "xxl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 8,
                    "x": 26
                  },
                  "xl": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 5,
                    "y": 8,
                    "x": 20
                  },
                  "lg": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 6,
                    "y": 6,
                    "x": 12
                  },
                  "md": {
                    "minH": 3,
                    "minW": 3,
                    "h": 6,
                    "w": 5,
                    "y": 14,
                    "x": 5
                  },
                  "sm": {
                    "minH": 3,
                    "minW": 3,
                    "h": 5,
                    "w": 4,
                    "y": 5,
                    "x": 8
                  }
                }
              }
            ]
          },
          "filters_locked": {
            "results.material.functional_type": "solar cell"
          },
          "columns": {
            "enable": [
              "results.material.chemical_formula_descriptive",
              "results.properties.optoelectronic.solar_cell.efficiency",
              "results.properties.optoelectronic.solar_cell.open_circuit_voltage",
              "results.properties.optoelectronic.solar_cell.short_circuit_current_density",
              "results.properties.optoelectronic.solar_cell.fill_factor",
              "references"
            ],
            "include": [
              "entry_name",
              "results.material.chemical_formula_hill",
              "results.material.chemical_formula_descriptive",
              "results.properties.optoelectronic.solar_cell.efficiency",
              "results.properties.optoelectronic.solar_cell.open_circuit_voltage",
              "results.properties.optoelectronic.solar_cell.short_circuit_current_density",
              "results.properties.optoelectronic.solar_cell.fill_factor",
              "results.properties.optoelectronic.solar_cell.device_stack",
              "results.properties.optoelectronic.solar_cell.device_architecture",
              "results.properties.optoelectronic.solar_cell.illumination_intensity",
              "results.properties.optoelectronic.solar_cell.absorber_fabrication",
              "entry_type",
              "results.material.structural_type",
              "results.eln.lab_ids",
              "results.eln.sections",
              "results.eln.methods",
              "results.eln.tags",
              "results.eln.instruments",
              "mainfile",
              "upload_create_time",
              "authors",
              "comment",
              "references",
              "datasets",
              "published"
            ],
            "exclude": [],
            "options": {
              "entry_name": {
                "label": "Name",
                "align": "left"
              },
              "results.material.chemical_formula_hill": {
                "label": "Formula",
                "align": "left"
              },
              "results.material.chemical_formula_descriptive": {
                "label": "Descriptive Formula",
                "align": "left"
              },
              "entry_type": {
                "label": "Entry type",
                "align": "left"
              },
              "results.material.structural_type": {
                "label": "Structural type"
              },
              "results.properties.optoelectronic.solar_cell.efficiency": {
                "label": "Efficiency (%)",
                "format": {
                  "decimals": 2,
                  "mode": "standard"
                }
              },
              "results.properties.optoelectronic.solar_cell.open_circuit_voltage": {
                "label": "Open circuit voltage",
                "unit": "V",
                "format": {
                  "decimals": 3,
                  "mode": "standard"
                }
              },
              "results.properties.optoelectronic.solar_cell.short_circuit_current_density": {
                "label": "Short circuit current density",
                "unit": "A/m**2",
                "format": {
                  "decimals": 3,
                  "mode": "standard"
                }
              },
              "results.properties.optoelectronic.solar_cell.fill_factor": {
                "label": "Fill factor",
                "format": {
                  "decimals": 3,
                  "mode": "standard"
                }
              },
              "results.properties.optoelectronic.solar_cell.illumination_intensity": {
                "label": "Illum. intensity",
                "unit": "W/m**2",
                "format": {
                  "decimals": 3,
                  "mode": "standard"
                }
              },
              "results.eln.lab_ids": {
                "label": "Lab IDs"
              },
              "results.eln.sections": {
                "label": "Sections"
              },
              "results.eln.methods": {
                "label": "Methods"
              },
              "results.eln.tags": {
                "label": "Tags"
              },
              "results.eln.instruments": {
                "label": "Instruments"
              },
              "mainfile": {
                "label": "Mainfile",
                "align": "left"
              },
              "upload_create_time": {
                "label": "Upload time",
                "align": "left"
              },
              "authors": {
                "label": "Authors",
                "align": "left"
              },
              "comment": {
                "label": "Comment",
                "align": "left"
              },
              "references": {
                "label": "References",
                "align": "left"
              },
              "datasets": {
                "label": "Datasets",
                "align": "left"
              },
              "published": {
                "label": "Access"
              }
            }
          },
          "rows": {
            "actions": {
              "enable": true
            },
            "details": {
              "enable": true
            },
            "selection": {
              "enable": true
            }
          },
          "filter_menus": {
            "include": [
              "material",
              "elements",
              "properties",
              "optoelectronic",
              "eln",
              "author",
              "dataset",
              "access",
              "ids",
              "processed_data_quantities",
              "optimade"
            ],
            "exclude": [],
            "options": {
              "material": {
                "label": "Material",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "elements": {
                "label": "Elements / Formula",
                "level": 0,
                "size": "large",
                "menu_items": {}
              },
              "properties": {
                "label": "Properties",
                "level": 0,
                "size": "small"
              },
              "optoelectronic": {
                "label": "Solar Cell Properties",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "eln": {
                "label": "Electronic Lab Notebook",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "author": {
                "label": "Author / Origin",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "dataset": {
                "label": "Dataset",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "access": {
                "label": "Access",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "ids": {
                "label": "IDs",
                "level": 0,
                "size": "small",
                "menu_items": {}
              },
              "processed_data_quantities": {
                "label": "Processed Data Quantities",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              },
              "optimade": {
                "label": "Optimade",
                "level": 0,
                "size": "medium",
                "menu_items": {}
              }
            }
          },
          "filters": {
            "exclude": [
              "mainfile",
              "entry_name",
              "combine"
            ]
          }
        }
      }
    },
    "default_unit_system": "Custom"
  }
}
