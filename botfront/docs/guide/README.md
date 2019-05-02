# Understanding intents and entities

::: tip
Technology plays a role, but the most significant performance gains are obtained by developping a deep understanding of the fundamental NLU concepts. 
:::

## Intents

An intent captures the general meaning of a sentence (or an utterance in the chatbots lingo). For example, the sentences below convey the intent of being hungry, let's call it `i_am_hungry`:
- I am hungry
- I need to eat something
- I am starving
- My kingdom for a pizza

How do we teach our model that those utterances convey the `i_am_hungry` intent? We train it to distinguish those sentences from sentences with other meanings. We create a _dataset_ containing examples for different intents.

Here is a sample of a dataset in Botfront. You can see examples for 2 different intents. This project has more than 150.

![](../images/intents_sample.png)

We said that intents carry the meaning of a sentence. How does a progam understand meaning? Let's just say there's a way to express the meaning of words with numbers (or vectors). The long explanation is [here](https://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/) if your interested

::: tip
Rasa's Tensorflow Pipeline (only pipeline currently supported) only look at those vectors to determine the meaning of words and sentences. Entites present in an utterance won't influence intent classification. It is not necessary to tag entity to help the model pick up the correct intent
:::

Usually, an intent carries an action or an expectation. 

## Entities

Entities are positional elements in an utterance. In the following examples, we're trying to build a currency exchange assistant. To provide a rate, we need the know which currency the user wants to buy, and which currency she wants to sell.

![](../images/nlu_entities_1.png)

We have thus 2 entities: `currency_buy` and `currency_sell`. 

::: tip BEST PRACTICE 
We have thus 2 entities: `currency_buy` and `currency_sell`, and they can have any currency as value. It is important to keep the entity name as generic as possible.
:::

::: danger NOT GOOD 
A common mistake is to choose the entity value as the name like this:
![](../images/nlu_entities_2.png)
:::

