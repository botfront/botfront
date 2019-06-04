# Quick Start

## Add NLU training data

Let's just teach our NLU model to recognize simple things like "Hi", "Thanks", "Bye". We'll do more advanced stuff later.

Botfront comes with pre-trained intents for general conversation (Chit Chat). We'll just use those for now. The video shows how to:
1. Import Chit Chat intents to your model
2. train and test your model

<video autoplay muted loop width="740" controls>
  <source src="../../videos/nlu_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 


## Create a Bot response

Now that our bot can understand a few things, let's see how we can get it to respond. The following video shows how to apply create a bot response and to assign it to an intent.

::: tip Botfront adds a special behaviour to intents prefixed with <code>chitchat.</code> or <code>faq.</code>
This allows to map a response without having to retrain Rasa on stories. We are using this feature here. \
For more information, see [Q&A and FAQ Bots](/guide/bot-responses/#q-a-faq-bots) or [Rules](/guide/users/rules.html)
:::

<video autoplay muted loop width="740" controls>
  <source src="../../videos/bot_responses_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

This example is minimal, but you can do more advanced assignments such as combinations of intent and entities.

::: tip How is this different from the Rasa <code>MappingPolicy</code>?
- The `MappingPolicy` lets you map one intent to one action. The Botfront behaviour lets you map any combination of intent and entities to a bot response.
- Adding/changing questions doesn't require training, as all Q&A are handled with a single story. 
- A nice corollary is that you can use this single story to handle all chitchat or Q&A inside your contextual stories.
:::


## Monitor and improve

You can follow the conversations from the `conversations` menu item, and monitor NLU from the `Activity` tab in your NLU model. 
**Make sure to check _Log utterances to activity_** in your `NLU > Model > Settings > Pipeline`.
Also note that if you are running Botfront on a system other than your localhost, you must change the core instance hostname under `Settings > Instances > Core Default`.

## What's next
You learned:

1. How to setup Botfront on your machine
2. How to add data and train your first NLU mode,
3. How to create a simple Q&A bot without coding.

There's a lot you can do with this already, but there's way more. You could read the NLU guide and build a more advanced NLU model