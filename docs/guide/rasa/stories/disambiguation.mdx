---
name: Disambiguate user input
title: Disambiguate user input
route: /docs/rasa/disambiguation/
menu: Authoring conversations
meta:
    - name: description
      content: Disambiguate user input by providing options.
    - name: keywords
      content: rasa disambiguation fallback
permalink: /rasa/:slug
---

# Disambiguating user input

When your virtual assistant receives a user utterance and cannot identify the intent with a sufficient level of certainty, it can offer a simple disambiguation system with options related to most likely intents.
This options will be presented as quick replies and clicking one of them will resume the conversation with the selected intent.

In this section will show how to set up disambiguation for your project by following those steps.

1. Setting up policies and pipelines.
2. Setting canonical values.
3. Creating a fallback story and a disambiguation response.

Finally we will address more advanced configuration options.


## Setup policies and pipelines

The disambiguation requires NLU pipelines and policies to be configured.

Add the following component to ALL (every language) your **NLU pipelines** (NLU -> Settings). The position doesn't matter.

```yaml
pipeline:
  ...
  - name: rasa_addons.nlu.components.intent_ranking_canonical_example_injector.IntentRankingCanonicalExampleInjector
  ...
```

Then add the following policy to your **policies** (from the Stories screen).

```yaml
policies:
---
- name: rasa_addons.core.policies.BotfrontDisambiguationPolicy
  fallback_trigger: 0.30
  disambiguation_trigger: '$0 < 2 * $1'
  n_suggestions: 2 # default value
  excluded_intents:
      - ^chitchat\..* # default value
      - ^basics\..*
```

<Important type='warning' title='Do not use with Rasa FallbackPolicy'>
    The FallbackPolicy may conflict with the BotfrontDisambiguationPolicy. You
    can configure a fallback in the BotfrontDisambiguationPolicy that will take
    precedence on the disambiguation.
</Important>

## Select a canonical values for each intent

In the following video we create two stories with two new intents: `order_food` and `order_drinks`.
When adding a few examples to each intent, notice how we mark the most generic one as **canonical**.
Canonical examples are displayed in stories and used for disambiguation.

<video muted width='100%' controls>
    <source src='../../../videos/disamb_tuto_canonical.m4v' type='video/mp4' />
    Your browser does not support the video tag.
</video>

## Disambiguation response and fallback story

When a disambiguation is triggered, the bot will present options to the user in the form of quick replies.
Each button will be labeled with the canonical example and will trigger the corresponding intent when clicked.

You can also provide other options, such as a button the user can click if none of the suggestions are relevant.

The following video shows how you can create such a response. We start by creating the fallback story, then we create the disambiguation response (which must be named `utter_disambiguation`) with a fallback button.

<video muted width='100%' controls>
    <source src='../../../videos/disamb_tuto_response.m4v' type='video/mp4' />
    Your browser does not support the video tag.
</video>
<Important type='tip' title='You can add more options'>
    In the example we only added a fallback option, but you can add more. The
    disambiguation options will just be added to the quick replies you define
    here.
</Important>

If you don't want to provide additional options such as a fallback you can use a **Text** response instead of a **Text with buttons** one.
Note that **Text** responses with sequences will not work.

## Disambiguation at work

Finally we can train and see our disambiguation at work by asking something ambiguous:

<video muted width='100%' controls>
    <source src='../../../videos/disamb_tuto_result.m4v' type='video/mp4' />
    Your browser does not support the video tag.
</video>

## Adjusting the disambiguation threshold

Although the `disambiguation_trigger` lets you create fancy formulas, the default is generally a good start.
Here are a few recipes to adjust the threshold:

-   **If the disambiguation fires too often**, you can adjust it in the following direction: `$0 < 1.5 * $1`.
    This will reduce the confidence scores difference between the two higest ranking intents required to trigger a disambiguation.

-   **If the disambiguation should be triggered more often**, go in the other direction: `$0 < 3 * $1`.
    This will increase the confidence scores difference between the two higest ranking intents required to trigger a disambiguation.

-   **If you want to force a disambiguation:** `$0 < 1.1`

-   **If you want to disable disambiguation:** `$0 > 1.1`

## Fallback

Disambiguation uses differences between confidence scores. But sometimes, confidence is so low that disambiguating does not even makes sense.
You can define this _so low_ with the `fallback_trigger` parameter.
It is set by default to `0.30`, which means that if the highest ranking intent has a confidence score below `0.30`, il will just utter `utter_fallback`

## Exclusions

You generally want limit the possible intents to suggest. For example, having _"Saying hi"_ or _"yes"_ as disambiguation options is generally irrelevant.
You can exclude such intents with the `exclude_intents` parameter in your policy.

You can use plain names or regular expressions. For example `^chitchat\..*` is equivalent to:

```yaml
excluded_intents:
    - chitchat.greet
    - chitchat.bye
    - chitchat.whatever
    - ...
```

<Important type='info'>
    If all potential suggestions are excluded, the fallback will be triggered.
</Important>

## Policy options

Here is the list of all parameters available in the policy

| Parameter                 | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | type     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `fallback_trigger`        | if confidence of top-ranking intent is below this threshold, fallback is triggered. The `action_botfront_fallback` will be executed. It will utter `utter_fallback` and return to the previous conversation state.                                                                                                                                                                                                                                                                                                                                                                                                                       | `string` |
| `disambiguation_trigger`  | e.g.: `'$0 < 2 * $1'`): if this expression holds, disambiguation is triggered. (If it has already been triggered on the previous turn, fallback is triggered instead.) Here this expression resolves to "the score of the top-ranking intent is below twice the score of the second-ranking intent". Disambiguation is an action that lets the user to choose from the top-ranking intents using a button prompt.<br/><br/>In addition, an 'Other' option is shown with payload defined in `deny_suggestions` param is shown. It is up to the conversation designer to implement a story to handle the continuation of this interaction. | `string` |
| `n_suggestions`           | The number of suggestions to display                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `string` |
| `disambiguation_template` | The name of the disambiguation response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `string` |
| `excluded_intents`        | Any intent (exactly) matching one of these regular expressions will not be shown as a suggestion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `string` |
