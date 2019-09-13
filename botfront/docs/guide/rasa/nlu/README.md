---
meta:
  - name: description
    content: 'Botfront: undestanding intents and entities with Rasa'
  - name: keywords
    content: botfront stories nlu rasa
permalink: /rasa/:slug
---

# Understanding intents and entities

::: tip
Technology plays certainly a role, but the most significant performance gains are obtained by developing a good understanding of the fundamental NLU concepts. 
:::

## Intents

An intent captures the general meaning of a sentence (or an utterance in the chatbots lingo). For example, the sentences below convey the intent of being hungry, let's call it `i_am_hungry`:
- I am hungry
- I need to eat something
- I am starving
- My kingdom for a pizza

How do we teach our model that these utterances convey the `i_am_hungry` intent? We train it to distinguish them from sentences with other meanings. We create a _dataset_ containing examples of different intents.

Here is a sample of a dataset in Botfront where you can see examples for 2 different intents. This project has more than 150 in total.

![](../../../images/intents_sample.png)

We said that intents carry the meaning of a sentence. How does a program understand meaning? Let's just say that there's a way to express the meaning of words with numbers (or vectors). The long explanation is [here](https://mrbot.ai/blog/natural-language-processing/understanding-intent-classification/) if you're interested, but the essential idea is that vectors can be compared (a distance can be calculated), and that a small distance indicates the words have similar meaning. 

In Rasa, the **_Spacy_** pipeline comes with ready-to-use _pretrained_ vectors, while the **_Tensorflow_** pipeline will train its own vectors on your dataset. The latter implies that you will need more examples, but your reward is that it will be more accurate on your custom or domain vocabulary, and more resilient to spelling mistakes. 

::: tip
Only the Tensorflow Pipeline is supported in Botfront at this time. 
:::

Usually, an intent carries an action or an expectation. 

## Entities

Entities are positional elements in an utterance. In the following examples, we're trying to build a currency exchange assistant. To provide a rate, we need the know which currency the user wants to buy, and which currency they want to sell.

![](../../../images/nlu_entities_1.png)



::: tip BEST PRACTICE 
We have thus 2 entities: `currency_buy` and `currency_sell`, and they can have any currency as value. It is important to keep the entity name as generic as possible.
:::

::: danger NOT GOOD 
A common mistake is to choose the entity name as the value like this:
![](../../../images/nlu_entities_2.png)
:::

Finally, it should be noted that recognizing the intent and extracting entities are two separate tasks: in other words, having similar entities in utterances will not influence the model when it parses it to recognize the intent.
