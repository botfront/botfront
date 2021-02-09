---
name: Migration guide
title: Migration guide
route: /docs/installation/migration-guide
menu: Installation
meta:
  - name: description
    content: "Migration instructions for Rasa assistants made with Botfront"

---

# Migration guide

This sections indicates how to migrate your assistant to a new Botfront version.

As we haven't reached 1.x minor versions are considered major and could have breaking changes.

<Important type='tip' title="Botfront and Rasa versions compatibility">
Botfront and Rasa versions are tightly coupled. To avoid compatibility issues when installing or upgrading, use the <a target='_blank' href='https://npmjs.com/botfront'>CLI</a> and <a target='_blank' href='https://github.com/botfront/botfront-helm'>Helm charts</a> enforce compatibility.
</Important>

## Minor versions

Minor upgrades are generally seamless.

### With the CLI

You can run `botfront upgrade` in your terminal.

### With Kubernetes

You can upgrade our [Helm Charts](https://github.com/botfront/botfront-helm).

<Important type='tip' title="Make sure you install the same chart versions">
Although we offer seperate charts for the Botfront framework and Rasa itself, they both have the same version. Installing the same chart version for both Botfront and Rasa ensures that Rasa and Botfront versions are compatible.
</Important>


## Major versions

When upgrading to a major version, always flush locally build images as follows:
```
docker rmi <folder_name>_rasa # e.g. docker rmi my_project_rasa
docker rmi <folder_name>_actions
```

Then process with the following steps:

1. Upgrade the botfront CLI: `npm install -g botfront`
2. Create a new project with `botfront init`.
3. Copy the `botfront-db` folder from your old project to the newly created project. Make sure to copy and not move your db so you can always recover it from your existing project. Your existing project should remain unchanged.
4. If you have custom actions, copy them to the `actions` folder in the new project.
5. Run your project with `botfront up`. At this point, you should be able to log in.

Check below if specific instructions apply to the version you are migrating to.

### 0.25.x -> 0.26.x

The migration should be straightforward, however because there are significant database changes, make sure:
- your Mongo instance has enough memory (especially if running on low-cost VMs) if you have a big NLU dataset
- to keep a copy of your DB before the migration, just in case.

### 0.25.x -> 0.26.x

### 0.24.x -> 0.25.x

### 0.23.x -> 0.24.x

### 0.22.x -> 0.23.x

### 0.21.x -> 0.22.x

#### Tracker store definitions
In Settings > Endpoints, replace:
```yaml
tracker_store:
  store_type: rasa_addons.core.tracker_stores.AnalyticsTrackerStore
  url: 'http://botfront-api:8080'
  project_id: 'bf'
```

with:

```yaml
tracker_store:
  store_type:  'rasa_addons.core.tracker_stores.botfront.BotfrontTrackerStore'
  url: 'http://botfront:3000/graphql' # Or the appropriate custom URL
```

### 0.20.x -> 0.21.x

### 0.19.x -> 0.20.x

### 0.18.x -> 0.19.x

#### Breaking changes

We significantly changed (and improved) how bot responses work. Only three types remain:

- Text
- Text with buttons
- Image
- Custom

If you were using other response types (mostly facebook related such as Templates, Lists, ...) they will be lost. **You need to make a copy before upgrading.**



```yaml
nlg:
  url: "http://botfront-api:8080/project/bf/nlg"
```

with:

```yaml
nlg:
  type: "rasa_addons.core.nlg.GraphQLNaturalLanguageGenerator"
  url: "http://botfront:3000/graphql" # This should be the same host as the Botfront app
```

6. Restart Rasa with `botfront restart rasa`
7. Train
8. You're done, have fun :)

## Manual upgrades

Always check that the Botfront and Rasa versions you install are compatible.
You can check this file to find out which version of Rasa corresponds to the Botfront version you are upgrading to: `https://github.com/botfront/botfront/blob/vX.X.X/cli/project-template/.botfront/botfront.yml` (replace `vX.X.X` with your version, e.g: `v0.24.0`)
