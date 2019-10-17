
# Developer's guide

## Install

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies
```bash
git clone https://github.com/botfront/botfront
cd botfront/botfront
meteor npm install
```

::: tip
Meteor comes with its own Node.js and NPM. When installing dependencies, it is better to use the Meteor NPM by running `meteor npm install` than using your local one (`npm install`)
:::

## Run

- With default settings: `meteor npm start`


## Documentation
- Run the documentation locally: `npm run docs:dev`
- Build the documentation : `npm run docs:build`

The docs are built with [Vuepress](https://vuepress.vuejs.org)


## Running and writing tests
You can run our integration test suite with `npx cypress run` or interactively with `npx cypress open`

::: warning Don't run tests if you have valuable data in your DB
The test suite starts by testing the setup process **and will wipe the database**.
:::


## Developing with Docker Compose

Follow these instructions to develop Botfront while interacting with all the services exposed by `docker-compose`:

1. Create a Botfront projet with `botfront init`
2. Start your project with `botfront up -e botfront`. This will run all services except the Botfront app, since you are going to run it with Meteor locallyé
3. Reset meteor from Botfront root folder with `meteor reset` (**this will wipe the database**).
4. Run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000)
