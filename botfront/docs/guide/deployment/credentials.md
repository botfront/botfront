# Channels and credentials

The credentials screen contains all the information Rasa Core needs to connect to various channels.

![](../../images/project_settings_credentials.jpg)

::: warning
Botfront has specific features that are not natively supported by Rasa Core. It is multilingual, and bot responses support sequences of messages. For this reasons, native Rasa Core channels may not work. Botfront currently provides 1 channel to be used with the [Rasa Webchat](https://github.com/mrbot-ai/rasa-webchat) and Facebook Messenger is on the way. 
:::

## Webchat

The Webchat channel connects Rasa to the [Rasa Webchat](https://github.com/mrbot-ai/rasa-webchat)

There isn't much to configure here, you can just set the `session_persistent` param to `false` if you prefer create a new session each time the user reloads the page containing the widget

```yaml
rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: http://localhost:5005
  socket_path: '/socket.io/'
```

<!-- ## Facebook

::: warning
The Facebook channel will be ready very soon
:::

<!-- 
This channel inherits from the [Rasa Core Facebook channel](https://rasa.com/docs/core/connectors/#facebook-setup). Besides supporting multilingual and sequence of messages features, it provides a better support for Messenger specific templates features.

```yaml
bot.facebook.MultiFacebookInput:
  verify: <verify phrase>
  secret: <facebook app secret>
  page-access-token: <facebook page token>
  fields:
  - first_name
  - last_name
  - ...
```

Only the `fields` field is specific to Botfront. You can retrieve user profile information in bot responses using the following template format: `{user_<field>}`. For example:

![](../../images/project_settings_credentials_facebook.jpg)

You need special permissions to access profile info (except first and last name). The `fields` fields let you specify the fields the channel is allowed to query from the Facebook Profile API.


::: warning IMPORTANT
You must restart Rasa Core for your changes to take effect. If you are running Botfront with **docker-compose** you can run `docker-compose restart core`
::: -->
