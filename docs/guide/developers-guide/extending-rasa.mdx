---
name: Extending Rasa
title: Extend Rasa with custom components, policies and channels
route: /docs/extending-rasa/
menu: Developers
meta:
  - name: description
    content: "Extend Rasa with custom pipeline components, policies and channels"
  - name: keywords
    content: rasa custom channel policy nlu pipeline
---

# Extending Rasa

Developing a custom Rasa [NLU component](https://rasa.com/docs/rasa/nlu/components/), [channel](https://rasa.com/docs/rasa/user-guide/connectors/custom-connectors/), or [policy](https://rasa.com/docs/rasa/core/policies/) is straightforward.

In the project you created with `botfront init` you will find a `rasa` folder containing the material needed to build your Rasa image. When you run `botfront up`, the Rasa image used is built from this folder.

## Example: custom NLU component

We provided you with an exemple of custom NLU component. Look for the `ignore_sample_component.py` file in the `rasa` folder.
All this component does is adding a field called `it_works` to the NLU results.
Let's use it:

1. Start your project `botfront up` and run `botfront watch`. This will watch the `rasa` and `actions` folders for changes and rebuild/restart the images when necessary so every change you make will be reloaded automatically.
2. Rename `ignore_sample_component.py` to `sample_component.py` (the watcher ignores files containing `ignore`). Botfront will rebuild and restart the Rasa image with your extensions installed as a pip package.
3. Go to NLU -> Settings -> Pipeline and add you new component:

```yaml
pipeline:
  - name: sample_component.SampleComponent
  - name: WhitespaceTokenizer
  ...
```

4. Train
5. Head to the API tab and observe the result, it_works :)

```javascript
{
  "intent": {
    "name": "chitchat.greet",
    "confidence": 0.9417732358
  },
  "entities": [],
  "language": "en",
  "it_works": true, // It just works
  "intent_ranking": [
    {
      "name": "chitchat.greet",
      "confidence": 0.9417732358
    },
    {
      "name": "chitchat.bye",
      "confidence": 0.0582267493
    }
  ],
  "text": "hello"
}
```

That's it. Creating a custom connector or core policy works exactly the same.
