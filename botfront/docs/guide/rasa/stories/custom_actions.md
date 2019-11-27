---
meta:
  - name: description
    content: 'Botfront: writing Rasa custom actions'
  - name: keywords
    content: botfront stories nlu rasa slots
permalink: /rasa/:slug
---

# Custom actions

## Development

Botfront makes Rasa custom actions. Writing and using custom actions is very easy.

In your project you should have the following folders:


| Folder | Description |
| ------ | ------------- |
| `.botfront` |  Project configuration files, docker-compose files |
| `actions` |  Custom actions for the actions server |
| `botfront-db`      |  MongoDB persisted files |
| `models`  |  Persisted models |

You probably figured it out: `actions` is our folder of interest.

#### Launch the watcher
The first thing to do is to launch the watcher. Symply run `botfront watch` from the root of your project. Any change in the `actions` folder will rebuild and restart the actions server so you can test the actions in Botfront

#### Write custom actions

All actions in the `actions` folder will be found by the watcher. You can add actions to the default `my_actions.py` file or add new files.

#### Verify that your actions are registered

Run `botfront logs` and verify that your actions are correctly imported. You should see something like `
INFO:rasa_sdk.executor:Registered function for 'action_guests'.` for each action in the folder.


#### Add your action to the conversation
From the [conversation builder guide](/rasa/conversation-builder/#actions), add your action to the conversation.

## Deployment
You can build your action server Docker image with the `Dockerfile.production` found in your project folder.

