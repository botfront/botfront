# Using Rasa with Botfront

Botfront has a deep Rasa integration, however not everything happens in Botfront.
This tutorial is primarily for developers.

You will learn:
- How to write and train stories
- How to write custom actions

## Project structure

Go to the `botfront-starter` project you cloned earlier and let's have a quick look at the project structure.

```
botfront-project
|- actions
|- db
|- models
|- project
|- domains
|-- domain.yml
|- stories
|-- stories.md
|- policies.yml
```

| Folder | Description |
| ------ | ------------- |
| `actions` |  Custom actions for the actions server |
| `db`      |  MongoDB persisted files |
| `models`  |  Persisted NLU and Core models |
| `domains` |  Core Domain files. Name must start with `domain` and you can have several files. They will be merged at training) |
| `stories` | Rasa Core stories |
| `policies.yml` | Rasa Core training policies |


## Prepare your environment
- You should have still have the terminal window where you ran `docker-compose up` open. 
- Open another window/tab (`Cmd+T`), install Watchdog (`pip install watchdog`) and run `./watch.sh`. This will take care of restarting/rebuilding containers when when needed.
- Optional: run `docker stats` in a third tab/window to monitor resources usage


## Stories

Our end goal is a conversation like this:

```
- User: We want to book a room for 2 adults and 2 kids
- Bot: You are 4 in total and that is an even number
```

But let's start with a simple version:
```
- User: We want to book a room for 2 adults and 2 kids
- Bot: Ok
```

### 1. Add a story

Open `project/stories/stories.md` in your favorite editor. It already contain a story. Add the second one.

```{5,6,7}
## faq
* faq OR faq{"intent":"any"}
  - action_faq
    
## Inform guests 
* inform_guests
  - utter_ok
```

### 2. Update the domain
Open `project/domains/domain.yml` and add `inform_guests` to the **intents** section and `utter_guests` to the **actions** section.

```yaml{3,9}
intents:
  - faq
  - inform_guests # Declare the intent

...

actions:
  - action_faq
  - utter_ok# Declare the action
```

### 3. Train Core on your story
Open a new tab in your terminal and run `./train_core.sh` from the root project folder.
When Core has restarted after the training (it may take a minute), verify that the story works by typing `/inform_guests`

::: tip
Note that we prefixed the intent with `/`. Since there is no training data for that intent, we can't use natural language yet. The `/` allows us to invoke the intent directly.
:::

The bot should reply with `utter_ok`.

<video autoplay muted loop width="740" controls>
  <source src="../../videos/core_simple_story.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

In the next sections we'll make the interaction more natural.

### 4. Add training data to `inform_guests`

Add the following examples to the `inform_guests` intent of your NLU model **and re-train it**:

```
We need a room for 2 adults and 2 children
A room tonight for 2 adults and 3 kids
A room for 2 adults
```

::: tip Note
We're assuming you still have the training data from the Quick Start guide. If not, make sure you have at least data for 2 intents. You can always add some from the Chit Chat.
:::

<video autoplay muted loop width="740" controls>
  <source src="../../videos/nlu_insert_many.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 5. Add a bot response and test your bot

Finally, let's create a bot response for the `utter_ok` template we put in the story.

<video autoplay muted loop width="740" controls>
  <source src="../../videos/core_bot_response.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

::: tip
You just created a sequence of messages. The bot will utter 2 messages even if your story only had one action following `* inform_guests`
:::

## Custom Actions

Let's just remind ourselves our end goal:

```
- User: We want to book a room for 2 adults and 2 kids
- Bot: You are 4 in total and that is an even number
```

We need the following changes:
1. Add Duckling to our NLU pipeline to extract the numbers
2. Create a custom action to sum all the numbers found in the utterance and tell if it's an odd or even number.

### 1. Add Duckling to the NLU pipeline

[Duckling](https://github.com/facebook/duckling) is an open source package by Facebook to extract structured entities such as numbers, dates, amounts of money, weights, volumes and so on.

Duckling is integrated in your project as a container (see the `docker-compose.yml` file in the project's root folder).

_Adding Duckling to the NLU pipeline_ means that we are going to use Duckling to extract numbers from user utterances ("2 adults and 2 kids").

```
- name: "components.botfront.duckling_http_extractor.DucklingHTTPExtractor"
  url: "http://host.docker.internal:8000"
  dimensions:
  - "number"
```

::: tip NOTE
`components.botfront.duckling_http_extractor.DucklingHTTPExtractor` provides the same functionality as `ner_http_duckling` and adds the possiblity to append the user `timezone` and `reftime` to the query string for better personalization of the user experience. More in the **Training Data > API** tab.
:::

<video autoplay muted loop width="740" controls>
  <source src="../../videos/add_duckling.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 2. Create a custom action

Open the `actions/custom_actions/` and add a new file called `my_actions.py` and paste the following content:

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


Save your file. The `actions` service should be rebuilding and you should see this in the terminal window showing logs:

```
INFO:rasa_core_sdk.executor:Registered function for 'action_faq'.
INFO:rasa_core_sdk.executor:Registered function for 'action_guests'.
```

### 3. Update your story and your domain

Now let's change the story (in `stories.md`) we created just earlier: replace the action `utter_ok` with `action_guests`


```{7}
## faq
* faq OR faq{"intent":"any"}
  - action_faq
    
## Inform guests 
* inform_guests
  - action_guests

```
::: tip
The action name `action_guests` comes from the `name()` method of the `GuestsAction` class.
:::

We also need to replicate that change in the `domain.yml` file: substitute `utter_ok` with `action_guests`

```yaml{9}
intents:
  - faq
  - inform_guests 

...

actions:
  - action_faq
  - action_guests
```

### 4. Retrain your policy and test your bot

Run `./train_core.sh`. The core server will be unavailable for a minute (you'll see the _Waiting for server..._ message in Botfront).
Then you can test the result:

<video autoplay muted loop width="740" controls>
  <source src="../../videos/dev_custom_action_bot.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

### 5. Shutting down

You can safely shut down your project with `Cmd/Ctrl+C` and run `docker-compose down` to free all resources. Your data is still persisted in the `db` folder and will be accessible from Botfront the next time you turn it on.
## Next steps
Congratulations, you've learned how to use Rasa with Botfront. Everything you read on the official [Rasa documentation](https://rasa.com/docs]) should apply with a few exceptions such as voice and messaging platforms.

Feel free to give your feedback and ask questions on the [Spectrum community](https://spectrum.chat/botfront)



