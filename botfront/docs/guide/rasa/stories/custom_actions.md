---
meta:
  - name: description
    content: 'Botfront: writing Rasa custom actions'
  - name: keywords
    content: botfront stories nlu rasa slots
permalink: /rasa/:slug
---

# Custom actions

Botfront supports Rasa custom actions out of the box.

In your project you should have the following folders:


| Folder | Description |
| ------ | ------------- |
| `.botfront` |  Project configuration files, docker-compose files |
| `actions` |  Custom actions for the actions server |
| `botfront-db`      |  MongoDB persisted files |
| `models`  |  Persisted models |

You probably figured it out: `actions` is our folder of interest.

Adding custom actions is fairly easy:

1. Run `botfront watch` from the root of your project folder to automatically rebuild your action server on file changes.

2. Add your actions to the `actions/my_actions.py` file.

3. Run `botfront logs` and verify that your actions are correctly imported. You should see something like `
INFO:rasa_sdk.executor:Registered function for 'action_guests'.`

4. From the [conversation builder guide](/rasa/conversation-builder/#actions), add your action to the conversation.

