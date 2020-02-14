# Users

## Roles and permissions

Botfront uses a hierarchical persmissions system. Internally there is no difference between a role and a persmission as the system is based on inheritance.

The difference resides in the naming convention. A permission has a `[resource]:[action]` syntax (e.g `nlu-data:x`), while the role has no constraint. 

While you can create arbitrary roles and permissions in the UI, you can only assign roles to users.



### Built-in permissions

| Permission          | Description                                                                                                                                                                           | Constraint    |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `nlu-data:r`        | Can read NLU data.                                                                                                                                                                    | `[projectId]` |
| `nlu-data:w`        | Can write NLU data. Extends `nlu-data:r`.                                                                                                                                             | `[projectId]` |
| `nlu-model:r`       | Can read NLU model data and meta information (language). Extends `nlu-data:r`.                                                                                                        | `[projectId]` |
| `nlu-model:w`       | Can add, edit and remove NLU data and models (add or remove languages to a project). Extends `nlu-model:r`, `nlu-data:w`.                                                             | `[projectId]` |
| `nlu-model:x`       | Can train a model.                                                                                                                                                                    | `[projectId]` |
| `responses:r`       | Create read bot responses.                                                                                                                                                            | `[projectId]` |
| `responses:w`       | Create create, delete and edit bot responses. Extends `responses:r`.                                                                                                                  | `[projectId]` |
| `stories:r`         | Can read story content. Extends `nlu-data:r`, `nlu-model:r`, `responses:r`.                                                                                                           | `[projectId]` |
| `stories:w`         | Can read story content. Extends `stories:r`.                                                                                                                                          | `[projectId]` |
| `triggers:r`        | Can access story triggers. Extends `stories:r`.                                                                                                                                       | `[projectId]` |
| `triggers:w`        | Can add, edit, or delete story triggers. Extends `triggers:r`.                                                                                                                        | `[projectId]` |
| `incoming:r`        | Can read incoming data. Extends `stories:r`.                                                                                                                                          | `[projectId]` |
| `incoming:w`        | Can process incoming data. Extends `stories:r`, `nlu-data:w`.                                                                                                                         | `[projectId]` |
| `projects:r`        | Can access project settings.                                                                                                                                                          | `[projectId]` |
| `projects:w`        | Can edit project meta information andsettings. Extends `project-settings:r`. If no `projectId` constraint is specified this permission allows adding, editing, and removing projects. | `[projectId]` |
| `users:r`           | Can access user information.                                                                                                                                                          | `[projectId]` |
| `users:w`           | Can add, edit, or remove user details and roles. Extends `users:r`.                                                                                                                   | `[projectId]` |
| `global-settings:r` | Can access global settings.                                                                                                                                                           |               |
| `global-settings:w` | Can edit global settings. Extends `global-settings:r`.                                                                                                                                |               |

> If no `projectId` constraint is specified the permission applies to al projects.


### Built-in roles

| Role            | Description                                                                                             | constraint    |
|-----------------|---------------------------------------------------------------------------------------------------------|---------------|
| `project-admin` | Can access and edit all resources of a project. Extends `projects:w`,`stories:w`,`incoming:w`,`users:w` | `[projectId]` |
| `global-admin`  | Can read NLU data.                                                                                      |               |


### Creating new roles

TODO
