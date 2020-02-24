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
| `nlu-data:x`       | Can train a model.                                                                                                                                                                    | `[projectId]` |
| `responses:r`       | Can read bot responses.                                                                                                                                                               | `[projectId]` |
| `responses:w`       | Can create, delete and edit bot responses. Extends `responses:r`.                                                                                                                     | `[projectId]` |
| `stories:r`         | Can read story content. Extends `nlu-data:r`, `nlu-data:r`, `responses:r`.                                                                                                           | `[projectId]` |
| `stories:w`         | Can read story content. Extends `stories:r`.                                                                                                                                          | `[projectId]` |
| `triggers:r`        | Can access story triggers. Extends `stories:r`.                                                                                                                                       | `[projectId]` |
| `triggers:w`        | Can add, edit, or delete story triggers. Extends `triggers:r`.                                                                                                                        | `[projectId]` |
| `incoming:r`        | Can read incoming data. Extends `stories:r`.                                                                                                                                          | `[projectId]` |
| `incoming:w`        | Can process incoming data. Extends `stories:r`, `nlu-data:w`, `incoming:r`.                                                                                                           | `[projectId]` |
| `analyics:r`        | Can view and download analytics data. Extends `incoming:r`.                                                                                                                           | `[projectId]` |
| `projects:r`        | Can access project settings.                                                                                                                                                          | `[projectId]` |
| `projects:w`        | Can edit project meta information and settings. Extends `projects:r`. If no `projectId` constraint is specified this permission allows adding, editing, and removing projects.        | `[projectId]` |
| `users:r`           | Can access user information. Extends `roles:r`                                                                                                                                        | `[projectId]` |
| `users:w`           | Can add, edit, or remove user details and roles. Extends `users:r`.                                                                                                                   | `[projectId]` |
| `global-settings:r` | Can access global settings.                                                                                                                                                           |               |
| `global-settings:w` | Can edit global settings. Extends `global-settings:r`.                                                                                                                                |               |
| `roles:r`           | Can view roles.                                                                                                                                                                       |               |
| `roles:w`           | Can add, edit, or remove roles.                                                                                                                                                       |               |


> If no `projectId` constraint is specified the permission applies to al projects.


### Built-in roles

| Role            | Description                                                                                             | constraint    |
|-----------------|---------------------------------------------------------------------------------------------------------|---------------|
| `project-admin` | Can access and edit all resources of a project. Extends `projects:w`,`stories:w`,`incoming:w`,`users:w` | `[projectId]` |
| `global-admin`  | Can read NLU data.                                                                                      |               |


### Creating new roles

TODO
