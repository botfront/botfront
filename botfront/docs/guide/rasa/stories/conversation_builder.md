---
meta:
  - name: description
    content: 'Conversation builder'
  - name: keywords
    content: botfront stories nlu rasa slots
permalink: /rasa/:slug
---

# Conversation Builder

With the Botfront Conversation Builder, you can visually create stories (_real conversation examples_) for your virtual assistant, with an experience very similar to a regular chat. You can create your flows, branch them, link conversations to each other (or even with themselves depending on the situation). 

You can annotate user utterances and add them to your training data, saving a lot of time while developing your model. Bot responses will also be automatically created and saved, taking away the need of filling them up with content elsewhere.

Using the visual/Markdown toggle, you can access the legacy Markdown editor if needed.

## Sample conversation flow

This is the initial screen when you create a new story in the conversation builder. Depending on the flow you want, it gives all the options to start from.

![COB initial](../../../images/cob_1.png)

### User utterance

A story almost always starts with a user utterance (unless you are creating a [destination story for linking](/rasa/stories/#linking-stories)).

![COB user: text](../../../images/cob_2.png)

Here we select the text option, payload will be shown in a later step:

![COB user: text input empty](../../../images/cob_3.png)

The user says **Hi there**.

![COB user: text input](../../../images/cob_4.png)

If you have a model (usually the case), the input would be parsed through and your model will annotate the utterance accordingly (as it would happen in New utterances in Incoming). If you don't have a model yet, an intent won't be attained and you would need to select/create one in order to save.

![COB user: text parsed](../../../images/cob_5.png)

We can see existing intents to select from or create a new intent by clicking on the intent label.

![COB user: intents](../../../images/cob_6.png)

We can make as many changes as we want for intents, annotate entities (if applicable) and save the user utterance.

![COB user: saved](../../../images/cob_6_2.png)

::: warning Note

You cannot edit a user utterance after you save it. If you want to change something, you will need to delete it and add a new one in the same place.

When you save a user utterance, it is also added to your training data to easily develop and enhance your model. If you delete it in the conversation builder, it will still remain in your training data. If you completely want to remove a user utterance from everywhere, you will need to manually delete it from your training data as well.

:::

### Bot responses

In our sample flow, we will continue with a bot response. Depending on your conversational needs, a slot or an action might come here as well. There cannot be two consecutive user utterances.

Here we continue with a text response:

![COB bot: responses](../../../images/cob_7.png)

We can type a simple text response in the bubble, just like chatting. The field would work with Markdown syntax as well.

![COB bot: text response](../../../images/cob_8.png)

We continue with a quick reply response this time.

![COB bot: quick reply](../../../images/cob_9.png)

![COB bot: quick reply](../../../images/cob_10.png)

Here we can set as many buttons as we want, which would be presented as clickable options to the user in the chat. They can have two types: postback and Web URL. Postback would post the button payload back to the chat, as if the user "said" it. Web URL will open the URL put in the button settings.

![COB bot: quick reply](../../../images/cob_11.png)

![COB bot: quick reply](../../../images/cob_12.png)

![COB bot: quick reply](../../../images/cob_13.png)

### Branching

Given that we are presenting two options to the user, it would be good to branch the conversation here and continue with two separate flows.

![COB branch](../../../images/cob_14.png)

Here we continue with the payload option, in order to exactly match the payload we set for the button:

![COB user: good payload](../../../images/cob_15.png)

We can either create a new intent, or select an existing one.

![COB user: good payload](../../../images/cob_16.png)

We select the `chitchat.i_am_good` intent.

![COB user: chitchat.i_am_good](../../../images/cob_17.png)

::: tip

Even though the **payload** option is selected, you might see content from an example that exists in your model, with the exact same payload. This will not affect the performance of the story or anything related with the buttons.

:::

We do the same thing for the **Sad** branch.

![COB user: chitchat.i_am_sad](../../../images/cob_18.png)

![COB user: chitchat.i_am_sad](../../../images/cob_19.png)

And voilà! We have created a simple yet powerful story with branches. Now it's time to train your model and try it out!

### Annotating with entities

Here you can see an example of how you can use entities while annotating in the conversation builder:

![Entity annotation flow](../../../images/annotation_entity_flow_cob_1.png)

::: tip

Simply highlight the part (entity value) you want to annotate. From the popup, you may create a new entity, or select from an existing one in your model.

:::

### Slots and actions

#### Slots

Depending on your conversation flow, you can use slots. Slots can be used in the beginning of branches. Here is a simple example:

![COB slot](../../../images/cob_slot_1.png)

![COB slot](../../../images/cob_slot_2.png)

#### Actions

If you have [custom actions](/rasa/custom-actions/), you can use them in your conversation as follows:

![COB action](../../../images/cob_action_1.png)

![COB action](../../../images/cob_action_2.png)

Now it's time to head to the [Conversation development guide](/rasa/stories/) and see best practices in developing conversations for your virtual assistant.
