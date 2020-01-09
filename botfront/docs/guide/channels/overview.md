---
meta:
  - name: description
    content: 'Botfront: deploy your Rasa with Botfront on Facebook Messenger'
  - name: keywords
    content: botfront stories nlu rasa slots deployment facebook channels
permalink: /channels
---

# Deploying your bot on several channels

Botfront uses a [fork of Rasa](https://github.com/botfront/rasa-for-botfront) customized to support multilingual bots.


## If your bot is multilingual

We currently provide two channels

- [Chat widget on your website](/guide/channels/webchat)
- [Facebook Messenger](/guide/channels/messenger)


#### Implementing other channels:

Using other channels is actually fairly easy. All you have to do is subclass an existing channel and override the `get_metadata` method. Here is an illustrative example of a channel subclassing the `rest` channel:

```python
class MyRestInput(RestInput):
    def get_metadata(self, request: Request) -> Optional[Dict[Text, Any]]:
        language = ... # do something to retrieve the user current language
        return {'language': language}
```

The `language` will be added to the message metadata and Botfront will do the rest. If you don't specify a language Botfront will use the default language defined in your project settings.

::: tip Using your channel
See the [Extending Rasa](/guide/developers-guide/extending-rasa) section to see how to add this channel to your current project.
:::

## If your bot has only one language

Then [ALL Rasa channels](https://rasa.com/docs/rasa/user-guide/messaging-and-voice-channels/) are supported and will work out of the box.

::: tip
For [your website](/guide/channels/webchat) and [Facebook Messenger](/guide/channels/messenger), we still recommend using our channels are they support Botfront specific features
:::

### Adding a channel:

1. Go to **Settings -> Credentials**
2. Add the channel specific configuration following the instructions in the [Rasa documentation](https://rasa.com/docs/rasa/user-guide/messaging-and-voice-channels/)

