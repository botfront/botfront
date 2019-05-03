# Instances and models

## Assigning instances to models

Instances are the Rasa NLU Endpoints used by NLU models and the Rasa Core endpoints used by the chat.

Creating new instances will only add an entry to the database and won't deploy anything, they're only used to store host values.

They can either be of type `nlu`, `core`, or both.

![](../../images/instances_models_1.png)

::: tip Host value
Here the nlu instance uses `host.docker.internal` because it will be used internally by docker containers.

The core instance uses `localhost` because it will be used by your browser to connect to the chat.

Keep that in mind if you change the values.
:::

To use the nlu instance in your model, you must select it in your model's general settings.

## Publishing models

Because you can have several models per language in a project, you must specify which model must be used by Rasa Core for every supported language. That's the purpose of the `ONLINE`/`OFFLINE` button.

When you set a model `ONLINE`, Core will (after a few seconds) redirects NLU requests to that model. 

![](../../images/instances_models_2.png)