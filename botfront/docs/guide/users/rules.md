# Rules

Botfront integrates the [Rasa Addons](https://github.com/mrbot-ai/rasa-addons) library. 
Rules allow to deal quickly with common problems without having to retrain policies.

- **Input validation**: if you expect Yes or No, make sure your users answer Yes or No and provide an error message
- **Disambiguation and fallback**: automatically display dismabiguation options to users based on custom triggers
- **Intent Substitution**: avoid random intents when users enter data without semantic consistency (names, brands, time,...)
- **Filter entities**: define entities allowed for each intent

::: tip
Changes to rules will be automatically applied to your current Core server in the next 60 seconds. Rules are not enforced by machine learning and are not related to your Rasa Core policy, so you don't need to retrain.
:::

::: warning
Because Rules intercepts messages before they are actually handled by the policy, some interactions (e.g. disambiguation messages) may not appear in the conversation history
:::

## Validate user input

The following rule will utter the `error_template` if the user does not reply to `utter_when_do_you_want_a_wake_up_call` with either `/cancel` OR `/speak_to_human` OR `/enter_time{"time":"..."}`

```yaml
input_validation:
  - after: utter_when_do_you_want_a_wake_up_call
    # !!WARNING!! If regex is set true then the validation will trigger for
    #             all actions which includes the above text. It is encouraged
    #             to set regex to false for matching the validation to a
    #             specific action.
    regex: false # optional (default: True)
    expected:
      - intents:
        - cancel
      - intents:
        - skeak_to_human
      - intents:
        - enter_time
        entities:
        - time
    error_template: utter_please_provide_time
```

Rules are enforced at the tracker level, so there is no need to retrain when changing them.

## Disambiguate user input and fallback

### Disambiguation policy

Help your users when your NLU struggles to identify the right intent. Instead of just going with the highest scoring intent or just going with a fallback
you can ask the user to confirm the question or to pick from a list of likely intents.

#### Suggestions

One way to disambiguate is to provide the user with buttons, each button corresponding to one intent. 
In the example below, the disambiguation is triggered when the score of the highest scoring intent is below twice the score of the second highest scoring intent.

The bot will utter:
1. An intro message (if the optional field `intro_template` is present)
2. A text with buttons (or quick replies) message where:
 - the text is the template defined as `text_template`,
 - the button titles will be the concatenation of "utter_disamb" and the intent name. For example, `utter_disamb_greet`."
 - the buttons payloads will be the corresponding intents (e.g. `/greet`). Entities found in `parse_data` are passed on.
3. A fallback button to go along with disambiguation buttons (if the optional field `fallback_button` is present)

It's also possible to exclude certain intents from being displayed as a disambiguation option by using optional `exclude` list field. In the example below, all intents that match regex `chitchat\..*` and `basics\..*`, as well as intent `cancel` will not be displayed as an option. The next highest scoring intents will be displayed in place of excluded ones.

```yaml
disambiguation_policy:
  trigger: $0 < 2 * $1
  type: suggest
  max_suggestions: 2
  slot_name: parse_data # optional slot name to store the parse data originating a disambiguation
  display:
    intro_template: utter_disamb_intro # optional: will not be rendered if not set
    text_template: utter_disamb_text
    button_title_template_prefix: utter_disamb
    fallback_button:
      title: utter_fallback_yes
      payload: /fallback
    exclude:
      - chitchat\..*
      - basics\..*
      - cancel
```

**Notes:**
- `trigger`: `$0` corresponds to `parse_data['intent_ranking'][0]["confidence"]`. You can set any rule based on intent ranking. Intent scores are checked against the trigger before any intent is excluded with `exclude`.
- `slot_name`: you need to set the slot in the Core domain to get it from the tracker. E.g. `tracker.get_slot(slot_name)`You may want to make the bot go straight to suggesting fallback (e.g when the top intent ranking is low).

The bot will utter:
1. An intro message `utter_fallback_intro`
2. Optional buttons (if `buttons` list with at least one item - a pair of `title` and `payload` - is defined).

### Rephrasing
Another way to disambiguate is to rephrase. When triggered, the bot asks "Did you mean [something related to the intent]"? followed by two buttons (titles in `yes_template` and `no_template`).
`no_payload` is the payload to trigger when the user clicks the no button.

```yaml
disambiguation_policy:
  trigger: $0 < 2 * $1
  type: rephrase
  display:
    rephrase_template: utter_rephrase
    yes_template: utter_yes
    no_template: utter_no
    no_payload: /fallback
    exclude:
      - chitchat\..*
      - basics\..*
      - cancel
```
      
### Fallback policy
In the example below, fallback is triggered when the top scoring intent's confidence is below 0.5.

```yaml
fallback_policy:
  trigger: $0 < 0.5
  slot_name: parse_data # optional slot name to store the parse data originating a disambiguation
  display:
    text: utter_fallback_intro
    buttons:
      - title: utter_fallback_yes
        payload: /fallback
      - title: utter_fallback_no
        payload: /restart
```

There is no limit on the number of buttons you can define for fallback. If no buttons are defined, this
policy will simply make the bot utter some default message (e.g `utter_fallback_intro`) when the top intent confidence is lower than the trigger.


### Using both disambiguation and fallback policies

It's easy to combine both disambiguation and fallback policies. It can be done by filling in policy definitions from two previous examples as follows:

```yaml
disambiguation_policy:
      (...disambiguation policy definition...)

fallback_policy:
      (...fallback policy definition...)
```

In cases when intent confidence scores in parsed data are such that would cause both policies to trigger, only fallback policy is trigerred. In other words, **fallback policy has precedence over disambiguation policy**.

## Substitute intents
Some intents are hard to catch. For example when the user is asked to fill arbitrary data such as a date or a proper noun.
The following rule swaps any intent caught after `utter_when_do_you_want_a_wake_up_call` with `enter_data` unless...

```yaml
intent_substitutions:
  - after: utter_when_do_you_want_a_wake_up_call
    intent: enter_data
    unless: frustration|cancel|speak_to_human
```

## Filter entities

Sometimes Rasa NLU CRF extractor will return unexpected entities and those can perturbate your Rasa Core dialogue model
because it has never seen this particular combination of intent and entity.

This helper lets you define precisely the entities allowed for every intent in a yaml file. Entities not in the list for a given intent will be cleared. It will only remove entities for intents specifically listed in this section:

```yaml
allowed_entities:
  book: # intent
    - origin # entity
    - destination
  buy:
    - color
    - product
```
