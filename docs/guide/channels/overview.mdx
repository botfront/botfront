---
name: Overview
title: Deploy your assistant on many channels
route: /docs/channels/
menu: Configuring channels
meta:
  - name: description
    content: Deploy your Rasa assistant on your website, on Messenger, Telegram any other channels.
  - name: keywords
    content: rasa deployment facebook channels
permalink: /channels
---

# Deploying your Rasa assistant on several channels

Botfront uses a [fork of Rasa](https://github.com/botfront/rasa-for-botfront) customized to support multilingual bots.

## If your bot is multilingual

We currently provide two channels

- [Chat widget on your website](/docs/channels/webchat)
- [Facebook Messenger](/docs/channels/messenger)

#### Implementing other channels:

Using other channels is actually fairly easy. All you have to do is subclass an existing channel and override the `get_metadata` method. Here is an illustrative example of a channel subclassing the `rest` channel:

```python
class MyRestInput(RestInput):
    def get_metadata(self, request: Request) -> Optional[Dict[Text, Any]]:
        language = ... # do something to retrieve the user current language
        return {'language': language}
```

The `language` will be added to the message metadata and Botfront will do the rest. If you don't specify a language Botfront will use the default language defined in your project settings.

<Important title="Using your channel">

See the [Extending Rasa](/docs/extending-rasa) section to see how to add this channel to your current project.

</Important>

## If your bot has only one language

Then [ALL Rasa channels](https://rasa.com/docs/rasa/user-guide/messaging-and-voice-channels/) are supported and will work out of the box.

<Important type="tip">

For [your website](/docs/channels/webchat) and [Facebook Messenger](/docs/channels/messenger), we still recommend using our channels are they support Botfront specific features

</Important>

### Adding a channel:

1. Go to **Settings -> Credentials**
2. Add the channel specific configuration following the instructions in the [Rasa documentation](https://rasa.com/docs/rasa/user-guide/messaging-and-voice-channels/)
