# Migration guide

As we haven't reached 1.x we consider minor versions as major and they could have breaking changes.

## Minor versions
For example  `0.18.1` -> `0.18.3`
Botfront will offer you to upgrade your project. Part of the process is automated, buty you will still have **ONE thing** to do manually:
Take:
- Take `rasa-for-botfront` image version in `.botfront/botfront.yaml`. In the following it would be `v1.5.1-bf.4` (with the `v`)
- Take `rasa-sdk` image version in `.botfront/botfront.yaml`. In the following it would be `1.3.2` (without the `v`)

```yaml{4,5}
images:
  default:
    ...
    rasa: botfront/rasa-for-botfront:v1.5.1-bf.4
    actions: rasa/rasa-sdk:1.3.2
    ...
```

And apply these versions to:
- `rasa/Dockerfile`
- `actions/Dockerfile`
- `actions/Dockerfile.production`

## Major versions

### 0.18.x -> 0.19.x

The folder project structure has changed. You will need to create another project and copy your data in it:

1. Create a new project with `botfront init`.
2. Copy the `botfront-db` folder from your old project to the newly created project. Make sure to copy and not move your db so you can always recover it from your existing project. Your existing project should remain unchanged.
3. If you have custom actions, copy them to the `actions` folder in the new project.
4. Run your project with `botfront up` and verify that everything works as expected.