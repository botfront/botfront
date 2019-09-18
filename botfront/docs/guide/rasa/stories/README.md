---
meta:
  - name: description
    content: 'Botfront: the most efficient way to write Rasa stories'
  - name: keywords
    content: botfront stories nlu rasa
permalink: /rasa/:slug
---

# Develop comversations

Botfront is based on Rasa and provides interfaces to build and edit Rasa stories more efficiently.
The first twi sections explain the basics. If you are already familiar with stories, you can safely skip them.

## Rasa stories
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

In the story above (previous section), if you say **_Hi_** three times to the bot it will reply three times the same thing. To prevent that, consider this example:

```
* chitchat.greet
  - utter_hi_there
* chitchat.greet
  - utter_hi_again
* chitchat.greet
  - utter_hmm_really
```

## Branching conversations

Conversations are often designed as tree-like flow charts. Stories are *real* conversation examples. Simply click on the **Branch Story** button on the story footer:

![](../../../images/branching_1.png)


### Branching with intents

The simplest way to branch a conversation is to use different intents at some point. Consider the following stories. 

```{3}
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_happy
  - utter_awesome
```

```{3}
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_sad
  - utter_i_have_a_bad_day_myself
```

Those stories implement two different paths, one where the user is happy and one where the user is not. Observe that half of the story is duplicated. It may not be a problem here, but when your tree branches on several levels this may become difficult to maintain. That is where the **branch story** option becomes useful:

![](../../../images/branching_6.png)


![](../../../images/branching_7.png)


### Branching with entity values

Another way is to use entity values. Here we want to implement the following use case: a user can ask to book in _eco_ or _business_. The third story covers the case where no class is specified.

```{3}
* chitchat.greet
  - utter_hi_how_are_you
* book{"class":"eco"}
  - utter_eco
```

```{3}
* chitchat.greet
  - utter_hi_how_are_you
* book{"class":"business"}
  - utter_business
```

```{3}
* chitchat.greet
  - utter_hi_how_are_you
* book
  - utter_which_class
```
And this can be done as follows with branches:

![](../../../images/branching_9.png)

![](../../../images/branching_10.png)

![](../../../images/branching_11.png)


::: warning But wait, that doesn't work!
If you train and try those stories, you'll see that if you type `/book` the agent will utter `utter_which_class` as expected, but if you type `book{"class":"eco"}` or `book{"class":"business"}` the response will be.
random. The reason is that if the value of the entity is not stored somewhere, Rasa only differentiates flow looking at if the entity `class` exists or not in the user utterance.

If you want the stories above to work, you need to **create a slot**. In this case we're going to create a **categorical** slot, and add the categories **business** and **eco**. Then retrain and it should work.

![](../../../images/branching_12.png)

:::

### Branching with slots

Once you define a slot with the same name as an entity, any entity value extracted from a user message will be set as the slot value, and this value will persist accross the conversation until it is changed or reset.
It means that if a user said one of the sentences above (`book{"class":"eco"}` or `book{"class":"business"}`), you can still use that information to branch your conversation in other stories.

**Use case**: a user wants to cancel a booking, but only `business` bookings are cancellable.

In plain text file you would have to write the following stories:

```{2}
* cancel.booking
  - slot{"class":"eco"}
  - utter_booking_not_cancellable
```

```{2}
* cancel.booking
  - slot{"class":"business"}
  - utter_booking_canceled
```
You can implement that as follows with branches:

![](../../../images/branching_13.png)

![](../../../images/branching_14.png)


As you can see, the `- slot{"class":"..."}` in the branches guides the conversation into different paths.

::: tip What if the class has not been set yet?
You can add a third category **not_set** to the `class` slot in a new branch, and set the initial value to **not_set**. Then you can gracefully handle the case where no class is set like this:

![](../../../images/branching_15.png)

This is the equivalent of adding this story in a story file.

```{2}
* cancel.booking
  - slot{"class":"not_set"}
  - utter_which_class
```
:::

### How branches are handled

Under the hood, Botfront uses [Rasa checkpoints](https://rasa.com/docs/rasa/core/stories/#checkpoints). When you click **branch story**, the parent and child stories are linked seamlessly with checkpoints, without the need of additional handling on the front end.

### Other branching features

You can easily see which branch you're on by looking at the breadcrumbs on the story footer:

![](../../../images/branching_8.png)

You can rename the branches as desired by clicking on the branch name and add as many as you want using the **+** icon:

![](../../../images/branching_3.png)

You can delete branches by clicking the trash icon while on the selected branch:

![](../../../images/branching_4.png)

::: tip NOTE
Deleting either one of the last two branches would automatically delete the other branch as well. The content in the last remaining branch will be added to the parent story so you don't loose any data:
:::

![](../../../images/branching_5.png)


## Organizing your stories in groups

Stories are grouped in story groups in order to keep them neat and tidy. You can create as many story groups as you want and rename them if necessary. When you delete the last story in a story group, the group is also deleted.

By selecting the **Move** icon as seen below, you may move any story to any story group.

![](../../../images/move-story.png)

### Duplicating stories

You may duplicate stories using the **Duplicate** icon next to the Move icon

### Renaming stories

Stories can be renamed on the story header.

![](../../../images/rename-story.png)

### Collapsing and expanding stories

In order to easily focus on one or a few stories, you can collapse or expand stories using the caret on the left of the story header.

### Special group: Intro stories

The **Intro stories** group contains the initial messages that would be sent to users when they start chatting with your bot. The starting payloads of those stories
will be available in the **bold** menu at the top of the chat widget.

This allows to test different starting workflows, for example if you want the welcome message of your bot to be different on several pages of your website. Note that you will still have to implement that on your frontend. If you are using the Rasa Webchat widget you can do that by customizing the `initPayload` parameter.

The **Intro stories** group is created by default in every new project.

## Optimize training for faster development

By default, the NLU and all stories are trained when you click on **Train everything** on the right side of the header in Botfront.
Depending on the policies you are using and the number of stories, training can take a significant amount of time. To help you iterate faster on subsets of your dialogue, you may focus on one or multiple story group to train the NLU and just the stories they contain.

You may click on the **focus (eye)** icon which appears when you hover besides story group names. Please note that the blue Train everything button will change to a yellow **Partial training** button, and it will have a tooltip stating the number of stories that are going to be trained.

![](../../../images/story_focus_1.png)

![](../../../images/story_focus_2.png)

![](../../../images/story_focus_3.png)
