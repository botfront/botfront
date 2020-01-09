---
meta:
  - name: description
    content: 'Botfront: expose your Rasa assistant with the Rasa Webchat'
  - name: keywords
    content: botfront stories nlu rasa slots deployment
permalink: /channels/:slug
---

# Chat widget on your website

## Install the widget on your website

Install the [Chat Widget](https://github.com/botfront/rasa-webchat) on your website.
You will find installation instructions by following the link. It can be installed either as a React Component or as a plain javascript snippet.

## Configure the channel

This channel is configured by default when you run Botfront locally with the [CLI](/guide/getting-started/cli).

1. Go to **Settings -> Credentials**
2. If you install Botfront on a remote server. set `base_url` to the public url where the Rasa API can be reached.

```yaml
rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: https://your.rasa.host:5005 # set this to the Rasa service host
  socket_path: '/socket.io/'
```

## Page specific intro message

You can also specify different intros/welcome messages depending on the page the conversation starts at.
For example, if a user opens the bot on a pricing page, you can set a different intro than the homepage in the `initPayload`:

```javascript
WebChat.default.init({
  ...
  initPayload: '/get_started_home',
  ...
})
```

```javascript
WebChat.default.init({
  ...
  initPayload: '/get_started_pricing',
  ...
})
```

All you have to do is create 2 different stories, one starting with `* get_started_home` and another one with `* get_started_pricing`. You can use the [Intro Stories](/) feature to group these stories and easily test them in Botfront


