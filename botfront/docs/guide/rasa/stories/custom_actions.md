---
meta:
  - name: description
    content: 'Botfront: writing Rasa custom actions'
  - name: keywords
    content: botfront stories nlu rasa slots
permalink: /rasa/:slug
---

# Custom actions

Let's have a quick look at your project folder structure:

```
awesome-project
|- .botfront
|- actions
|- botfront-db
|- models
```

| Folder | Description |
| ------ | ------------- |
| `.botfront` |  Project configuration files, docker-compose files |
| `actions` |  Custom actions for the actions server |
| `botfront-db`      |  MongoDB persisted files |
| `models`  |  Persisted models |


You probably figured it out: `actions` is our folder of interest.


::: tip TLDR;
If you already know about Rasa and custom actions:
- Add your actions in the `actions/my_actions.py` file.
- Run `botfront watch` from the root of your project folder to automatically rebuild your action server on file changes.
:::


## Tutorial

Let's build a conversation like this:

```
- User: We want to book a room for 2 adults and 2 kids
- Bot: You are 4 in total and that is an even number
```

But let's start with a simpler version:
```
- User: We want to book a room for 2 adults and 2 kids
- Bot: Ok
```

While taking baby steps...

### 1. Add a story

In a new story group, add the following story and click **Train everything**

```{5,6,7}
* inform_guests
  - utter_ok
```

You can verify that the story works by typing `/inform_guests` in the chat window

::: tip
Note that we prefixed the intent with `/`. Since there is no training data for that intent, we can't use natural language yet. The `/` allows us to invoke the intent directly.
:::

The bot should reply with `utter_ok`.

<!-- <video autoplay muted loop width="740" controls>
  <source src="../../videos/core_simple_story.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>  -->


### 2. Add training data to `inform_guests`

Add the following examples to the `inform_guests` intent of your NLU model **and re-train it**:

```
We need a room for 2 adults and 2 children
A room tonight for 2 adults and 3 kids
A room for 2 adults
```

::: warning Add more intents
You need at least two different intents to train an NLU model. You can add more intents by importing from the **Chit Chat** tab.
:::

<video autoplay muted loop width="740" controls>
  <source src="../../../videos/nlu_insert_many.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 3. Add a bot response

Finally, let's create a bot response for the `utter_ok` template we just put in the story:

<video autoplay muted loop width="740" controls>
  <source src="../../../videos/core_bot_response.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

::: tip
You just created a sequence of messages. The bot will utter 2 messages even if your story only had one action following `* inform_guests`
:::

Let's just remind ourselves of our end goal:

```
- User: We want to book a room for 2 adults and 2 kids
- Bot: You are 4 in total and that is an even number
```

We need the following changes:
1. Add Duckling to our NLU pipeline to extract the numbers
2. Create a custom action to sum all the numbers found in the utterance and tell if it's an odd or even number.

### 4. Add Duckling to the NLU pipeline

[Duckling](https://github.com/facebook/duckling) is an open source package by Facebook to extract structured entities such as numbers, dates, amounts of money, weights, volumes, and so on.

Duckling is integrated in your project as a container (see the `docker-compose.yml` file in the project's root folder).

_Adding Duckling to the NLU pipeline_ means that we are going to use Duckling to extract numbers from user utterances ("2 adults and 2 kids").

```
- name: "rasa_addons.nlu.compoments.duckling_http_extractor.DucklingHTTPExtractor"
  url: "http://duckling:8000"
  dimensions:
  - "number"
```

::: tip NOTE
`rasa_addons.nlu.compoments.duckling_http_extractor.DucklingHTTPExtractor` provides the same functionality as `ner_http_duckling` and adds the possiblity to append the user `timezone` and `reftime` to the query string for better personalization of the user experience. More in the **Training Data > API** tab.
:::

<video autoplay muted loop width="740" controls>
  <source src="../../../videos/add_duckling.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 5. Start the watcher

From your project folder, run `botfront watch` to automatically rebuild your actions server when your actions files change.

### 6. Create a custom action

Open the `actions` folder and add a new file called `my_actions.py` and paste the following content:

```python
import logging
from functools import reduce
from rasa_core_sdk import Action
from rasa_core_sdk.events import SlotSet, ReminderScheduled

logging.basicConfig(level="DEBUG")
logger = logging.getLogger()

class GuestsAction(Action):

    def name(self):
        return 'action_guests'

    def run(self, dispatcher, tracker, domain):
        entities = tracker.latest_message.get('entities', [])
        
        # Only keep 'number' entities
        numbers = list(filter(lambda e: e.get('entity') == 'number', entities))

        # Stop here if no numbers found
        if not len(numbers):
            dispatcher.utter_message("How many are you?")
            return []
        
        # Compute the sum of all 'number' entity values
        number_of_guests = reduce(lambda x, y: x + y, map(lambda e:e.get('value'), numbers))

        is_even = number_of_guests % 2 == 0 

        message = 'You are {number_of_guests} in total and that is an {is_even} number'.format(
            number_of_guests=number_of_guests, 
            is_even='even' if is_even else 'odd')
        
        dispatcher.utter_message(message)
        return []
```

Save your file. The `actions` service should be rebuilding and you should see this in the terminal window showing logs (`botfront logs`):

```
INFO:rasa_sdk.executor:Registered function for 'action_guests'.
```

### 7. Update your story

Now let's change the story we created earlier: replace the bot response `utter_ok` with `action_guests`


```{2}
* inform_guests
  - action_guests

```
::: tip
The action name `action_guests` comes from the `name()` method of the `GuestsAction` class.
:::



### 8. Retrain and test your bot

Then you can see the result:

<video autoplay muted loop width="740" controls>
  <source src="../../../videos/dev_custom_action_bot.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 9. Shutting down

You can safely shut down your project with `botfront down` to free all resources. Your data is kept in the `botfront-db` folder and will be accessible from Botfront the next time you turn it on.

## Next steps

Congratulations, you've learned how to use Rasa with Botfront! Everything you see on official [Rasa documentation](https://rasa.com/docs]) should apply with a few exceptions such as voice and messaging platforms.

Feel free to give your feedback and ask questions on the [Spectrum community](https://spectrum.chat/botfront)



