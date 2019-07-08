---
meta:
  - name: description
    content: 'Botfront & Rasa tutorial: how to branch conversations with stories'
  - name: keywords
    content: botfront stories nlu rasa slots
permalink: /users-guide/:slug
---

# Branching conversations

Conversations are often designed as tree-like flow charts. Stories are *real* conversations examples. Let's see how you can use stories to branch your flow:.

## Branching with intents

The simplest way to branch a conversation is to use different intents at some point

```md{3}
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_happy
  - utter_awesome
```

```md{3}
* chitchat.greet
  - utter_hi_how_are_you
* chitchat.i_am_sad
  - utter_i_have_a_bad_day_myself
```

::: tip
In other words, to represent a conversation branching in two different scenarios you need two stories.
:::

## Branching with entity values

Another way is to use entity values:

```
## book
* book{"class":"business"}
- utter_business
```

```
## book
* book{"class":"eco"}
- utter_eco
```

```
## book
* book
- utter_which_class
```

::: warning But wait, that doesn't work!
If you train and try those stories, you'll see that if you type `/book` the agent will utter `utter_which_class` as expected, but if you type `book{"class":"business"}` or `book{"class":"eco"}` the response will be 
random. The reason is that if the value of the entity is not stored somewhere, Rasa only differentiates flow looking at ifthe entity `class` exists or not in the user utterance
:::

::: tip Solution: store entity values in slots
If you want the above stories to work, you need **create a slot**. In that case we're going to create a **categorical** slot, and add the categories **business** and **eco**. Then retrain and it should work
:::

## Branching with slots

Once you define a slot with the same name as an entity, any entity value extracted from a user message will be set as the slot value, and this value will persist accross the conversation until it is changed or reset.
It means that if a user said one of the above sentences (`book{"class":"business"}` or `book{"class":"eco"}`) you can still use that information to branch your conversation in other stories. 

**Use case**: a user wants to cancel a booking, but only `business` bookings are cancellable. 

Let's add 2 new stories

```{3}
## cancel booking
* cancel
- slot{"class":"eco"}
- utter_booking_not_cancellable
```

```{3}
## cancel booking
* cancel
- slot{"class":"business"}
- utter_booking_canceled
```

As you can see, the `- slot{"class":"..."}` branch the conversation in different paths.

::: tip What if the class has not been set yet?
You can add a 3rd category **not_set** to the `class` slot, and set the initial value to **not_set**. Then you can handle the case where no class is set gracefully like this:
```{3}
## cancel booking
* cancel
- slot{"class":"not_set"}
- utter_which_class
```
:::

