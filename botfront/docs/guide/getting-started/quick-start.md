# Quick Start

This tutorial will guide you through the installation and the development of your first chatbot with Botfront/Rasa. You will run Botfront with `docker-compose` which makes running all the applications needed for your project (Botfront, Rasa, Mongo) very easy.

## 1. Install Docker

- [Install Docker for Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac)
- [Install Docker for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows) 

If you already have Docker installed, make sure it's up to date.

## 2. Install Botfront

Open your terminal 
::: tip Beginner tip
On a Mac, press `Cmd+Space`, look up **_terminal_** and select **_Terminal.app_**
:::

Copy the following lines, paste them in your terminal window and type `Enter`.

```bash
git clone https://github.com/botfront/botfront-project
cd botfront-project
docker-compose up
```

First, it's going to download all the Docker images required (it's going to take a while, be patient). Then it's going to start all the services. You will see some errors. Ignore them for now. 

## 3. Start Botfront

Open [http://localhost:8888](http://localhost:8888) and follow the steps to create your first project

::: tip If you're following the tutorial
Name your project "My First Project" and choose the English language if you want to follow the rest of this tutorial
:::

<video autoplay muted loop width="740" controls>
  <source src="../../videos/setup.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

Congratulations, Botfront is installed. In the next section we'll create and train a simple NLU model.

## 4. Create your first NLU model

Let's just teach our NLU model to recognize simple things like "Hi", "Thanks", "Bye". We'll do more advanced stuff later in this tutorial

<video autoplay muted loop width="740" controls>
  <source src="../../videos/nlu_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 

## 5. Create your first Bot response

Now that our bot can understand a few things, let's see how we can get it to respond.

<video autoplay muted loop width="740" controls>
  <source src="../../videos/bot_responses_quickstart.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video> 


## 6. Chat with your bot

## What you learned and what's next
You learned:

1. How to setup Botfront on your machine
2. How to add data and train your first NLU mode,
3. How to create a simple Q&A bot without coding.

There's a lot you can do with this already, but there's way more. You could read the NLU guide and build a more advanced NLU model

If you are a developer (or a very techsavvy person), see how to write your first Rasa Core story



## 7. Create your first Rasa Core story



