---
meta:
  - name: description
    content: 'Botfront tutorial: write and train Rasa stories in Botfront'
  - name: keywords
    content: botfront stories nlu rasa
---

# Quick Start

In this guide you will learn:

- How to write and train **stories** 📖
- How to create and train a simple **NLU** model 🤓

Botfront is built on top of the Rasa library and and exposes its essential concepts in an intuitive interface. The official Rasa [docs](https://rasa.com/docs) is an exhaustive source of information, and this guide should provide the necessary information to get started.

::: tip
If you already know Rasa and are familiar with stories, [skip the intro and go directly to the Botfront part.](#write-and-train-stories-in-botfront)
:::

## Understanding Rasa stories

Stories are the building blocks of your conversation flows. It's a symbolic language used to describe conversations a user can have with a bot.
In their simplest form, stories are made of user messages, starting with a `*`, and bot responses, starting with a `-`. 

```md
* chitchat.greet
  - utter_hi_there
```

As you can see this is not real natural language: the user message is expressed in the form of an **_intent_**, and the bot response with a **_response name_**. The content of this intent (the many ways to say *hi*) and of the bot response (something like *Hello my human friend*) will be defined later

::: tip
This has an important implication: **stories are language agnostic**. The stories you write will work in any language.
:::

### Stories and context

The context of a conversation is simply the fact that when the bot decides what to do or say, it decides it based on the whole conversation (or at least a few turns) and not based on the last thing it heard.

In the story above, if you say **_Hi_** three times to the bot it will reply three times the same thing. Consider this one:

```md
* chitchat.greet
  - utter_hi_there
* chitchat.greet
  - utter_hi_again
* chitchat.greet
  - utter_hmm_really
```

In that situation, when you say Hi to the bot for the third time, it knows you're repeating yourself and can answer something different. 

### Stories and conversation paths

Conversations are often designed as tree-like flow charts. Stories are *real* conversations examples. Let's see how you can use stories to branch you flow:

```md
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_happy
  - utter_awesome
```

```md
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_sad
  - utter_i_have_a_bad_day_myself
```
::: tip
In other words, to represent a conversation branching in two different scenarios you need two stories.
:::


## Write and train stories in Botfront

Select **stories** in the sidebar, create a new group, paste the content of the 2 stories above in 2 distinct stories, and train.

Then open the chat window and verify that it works. Since we haven't trained our bot to understand natural language, we'll talk with intents. It can be done by prepending a `/` to the intent name. So you can start the conversation with `/chitchat.greet`, and after the bot responds you can follow up according to your mood of the day.


## Adding natural language

Our bot now has 4 intents:
- `chitchat.greet`
- `chitchat.i_am_happy`
- `chitchat.i_am_sad`

And 3 bot responses:
- `utter_hi_how_are_you`
- `utter_awesome`
- `utter_i_have_a_bad_day_myself`

Let's start with the responses. Select Bot Responses from the sidebar and add them from there. Be sure to keep the response names unchanged. 

A nice feature of bot responses is that they can be a sequence. You can chain several messages in a bot response.

Finally let's add data to our intents. To make it quick we can just use the chitchat data provided with Botfront. It will populate the dataset and our bot will be ready to train.

Then we can finally have a real (!) conversation with our bot...

## Teach your bot other languages

You can easily add a new language to your project. Go to the project settings, and add a language. Once you save, your new language will be available in the top left selector.

Let's add our training data and retrain (since we added French we have ready to use data here as well).

And voilà, our bot speaks French! 

