---
meta:
  - name: description
    content: 'Botfront tutorial: write and train Rasa stories in Botfront'
  - name: keywords
    content: botfront stories nlu rasa
permalink: /users-guide/:slug
---

# Quick Start

In this guide you will learn:

- How to write and train a **story** 📖
- How to create and train a simple **NLU** model 🤓
- How to add a bot response


## Introduction to Rasa stories

Stories are the building blocks of conversation flows. It's a symbolic language used to describe conversations a user can have with a bot.
In their simplest form, stories are made of user messages, starting with a `*`, and bot responses, starting with a `-`. 

```
* chitchat.greet
  - utter_hi_there
```

```
* chitchat.bye
  - utter_bye
```

As you can see this is not real natural language: the user message is expressed in the form of an **_intent_**, and the bot response with a **_response name_**. The content of this intent (the many ways to say *hi*) and of the bot response (something like *Hello my human friend*) will be defined later

::: tip
This has an important implication: **stories are language agnostic**. The stories you write will work in any language.
:::

## Stories and context

The context of a conversation is the knowledge of all the passed events of this conversation.

In the story above (previous section), if you say **_Hi_** three times to the bot it will reply three times the same thing. Consider this one:

```
* chitchat.greet
  - utter_hi_there
* chitchat.greet
  - utter_hi_again
* chitchat.greet
  - utter_hmm_really
```

## Train and try your stories

Select **stories** in the sidebar, create a new group, paste the content of 2 stories above (starting with `chitchat.greet` and `chitchat.bye`) in two dictinct stories, and train.

Then open the chat window. Since we haven't trained our bot to understand natural language, we'll talk with intents. It can be done by prepending a `/` to the intent name. So you can start the conversation with `/chitchat.greet`. You should be able to reproduce the conversation above: if you say `/chitchat.greet` three times, you should get 3 different answers.

## Add natural language

Select NLU from the side bar and go the **Chitchat** tab. Select `chitchat.greet` and `chitchat.bye`, import and train.

## Add a bot response

Select **Bot responses** in the sidebar, then create 4 bot responses. The names of the bot responses are those used in stories:
- `utter_hi_there`
- `utter_hi_again`
- `utter_hmm_really`
- `utter_bye`

Congrats, now you can finally have a real (!) conversation with our bot!

## Adding languages

You can easily add a new language to your project. Go to the project settings, and add a language. Once you save, your new language will be available in the top left selector.

Let's add our training data and retrain (since we added French we have ready to use data here as well).

And voilà, our bot speaks French! 

## Next steps

You can dive in the official Rasa [docs](https://rasa.com/docs) or simply follow the rest of the tutorial.


