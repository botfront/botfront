# Quick Start

This tutorial will guide you through the installation and the development of your first chatbot with Botfront/Rasa. You will run Botfront with `docker-compose` which makes running all the applications needed for your project (Botfront, Rasa, Mongo) very easy.

## Install Docker

- [Install Docker for Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac)
- [Install Docker for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows) 

If you already have Docker installed, make sure it's up to date.

## Install Botfront

Open your terminal 
::: tip Beginner tip
On a Mac, press `Cmd+Space`, look up **_terminal_** and select **_Terminal.app_**
:::

Copy the following lines, paste them in your terminal window and type `Enter`.

```bash
git clone https://github.com/botfront/botfront-starter
cd botfront-starter
docker-compose up
```

First, it's going to download all the Docker images required (it's going to take a while, be patient). Then it's going to start all the services. You will see some errors. Ignore them for now. 

## Start Botfront

Open [http://localhost:8888](http://localhost:8888) and follow the steps to create your first project

::: tip If you're following the tutorial
Name your project "My First Project" and choose the English language if you want to follow the rest of this tutorial
:::

<video autoplay muted loop width="740" controls>
  <source src="../../videos/setup.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

Congratulations, Botfront is installed. You should see a screen with your _First NLU Model_.

## Add data to your NLU model

Let's just teach our NLU model to recognize simple things like "Hi", "Thanks", "Bye". We'll do more advanced stuff later.
Botfront comes with pre-trained intents for general conversation (Chit Chat). The following video shows how to:
1. Import Chit Chat intents to your model
2. train and test your model

<video autoplay muted loop width="740" controls>
  <source src="../../videos/nlu_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 


## Create your first Bot response

Now that our bot can understand a few things, let's see how we can get it to respond. The following video shows how to apply create a bot response and to assign it to an intent.

<video autoplay muted loop width="740" controls>
  <source src="../../videos/bot_responses_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

This example is minimal, but you can do more advanced assignments such as combinations of intent and entities.

::: tip Note
You might be wondering why you didn't have to write stories or train Rasa Core. Botfront adds a special behaviour to intents prefixed with `chitchat.` or `faq.` allowing to map a response without having to retrain the whole model.
For more information, see [Q&A and FAQ Bots](/guide/bot-responses/#q-a-faq-bots) or [Rules](/guide/users/rules.html)
:::

## What you learned and what's next
You learned:

1. How to setup Botfront on your machine
2. How to add data and train your first NLU mode,
3. How to create a simple Q&A bot without coding.

There's a lot you can do with this already, but there's way more. You could read the NLU guide and build a more advanced NLU model







