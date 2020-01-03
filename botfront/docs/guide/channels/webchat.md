---
meta:
  - name: description
    content: 'Botfront: expose your Rasa assistant with the Rasa Webchat'
  - name: keywords
    content: botfront stories nlu rasa slots deployment
permalink: /channels/:slug
---

# Chat widget on your website

## Frontend: configure the widget

Install the [Rasa Webchat](https://github.com/botfront/rasa-webchat) on your website. You will find installation instructions by following the link.
It is very important to set the language you want to use, even if you only have one:

```javascript
<div id="webchat"/>
<script src="https://storage.googleapis.com/mrbot-cdn/webchat-0.X.X.js"></script>
<script>
  WebChat.default.init({
    selector: "#webchat",
    initPayload: "/get_started",
    ...
    customData: { language: 'en' }, // can be any language code
    ...
  })
</script>
```

### Page specific intro message

You can also specify different intros/welcome messages depending on the page the conversation starts at. For example, if a user opens the bot on a pricing page, you can set a different intro than the homepage in the `initPayload`:

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

## Backend: configure the channel

The channel configuration can be found in **settings > credentials**. This channel is configure by default, the only thing my might need to change is the `base_url` if you install Botfront on a server. In that case, `base_url` should be the public url where the Rasa container can be reached.

```yaml
rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: https://your.rasa.host:5005 # set this to the Rasa service host
  socket_path: '/socket.io/'
```
