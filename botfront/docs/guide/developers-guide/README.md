
# Developers guide

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

Until we provide a better way...

1. Set the `MODELS_LOCAL_PATH` environment variable in your shell with for example `export MODELS_LOCAL_PATH=~/botfront-projects/s`
2. Start Botfront locally with `meteor npm start`. Botfront will be available at [http://localhost:3000](http://localhost:3000)
3. In settings > endpoints: change domain names to `localhost`. Don't change ports
4. In settings > more settings > docker-compose change API host to `http://host.docker.internal:8080`
5. Create a Botfront projet with `botfront init`. Don't start it
6. In `.botfront/botfront.yml`,  set the `bf_project_id` with the project ID of the locally running Botfront
7. In `.botfront/botfront.yml`, set the `mongo_url` to `mongodb://host.docker.internal:3001/meteor`
8. Start the Botfront project with `botfront up`