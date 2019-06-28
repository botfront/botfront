
# Developers guide

## Develop


#### Install

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies
```bash
git clone https://github.com/botfront/botfront
cd botfront/botfront
meteor npm install
```

#### Run

- With default settings: `meteor npm start`


#### Documentation
- Run the documentation locally: `npm run docs:dev`
- Build the documentation : `npm run docs:build`

The docs are built with [Vuepress](https://vuepress.vuejs.org)


#### Running and writing tests
You can run our integration test suite with `npx cypress run` or interactively with `npx cypress open`

::: danger
The test suite starts by testing the setup process **and will wipe the database**. 
:::

## Production deployment

A few things you should pay attention to when deploying Botfront.

### MongoDB database
When you run Botfront in developer mode, Meteor will spin up a MongoDB database accessible on port `3001`. However, when running in production or with `docker-compose` a MongoDB uri needs to be provided with the environment variable `MONGO_URL`. It is also highly recommended (but optional) to provide an oplog url with `MONGO_OPLOG_URL`. 

::: warning Choosing a database name
We strongly recommend using a very short database name (e.g `bf`) and not too long response names to [avoid hitting the limits](https://docs.mongodb.com/manual/reference/limits/#namespaces).
:::

### Required environment variables

- `ROOT_URL`: the end user URL (e.g. https://your.doma.in)
- `MONGO_URL`: to MongoDB connection string
- `MAIL_URL`: An SMTP url if you want to use the password reset feature

### Technical requirements

Those are the miminal requirements:

| Service  | RAM   | CPU  |
|---|---:|---:|
| botfront |  1 Gb | 1  | 
| botfront-api  |  512 Mb | 0.5  |
| duckling  |  512 Mb | 0.5  |
| rasa-nlu  | 1 Gb  |  1 |
| rasa-core  |  512 Mb | 1  |

### Developing with Docker Compose

1. Set the `MODELS_PATH_ENVIRONMENT` variable in your shell with for example `export MODELS_LOCAL_PATH=~/botfront-projects/s`
2. Start Botfront locally with `meteor npm start`. Botfront will be available at [http://localhost:3000](http://localhost:3000)
3. In settings > endpoints: change domain names to `localhost`. Don't change ports
4. In settings > more settings > docker-compose change API host to `http://host.docker.internal:8080`
5. Create a Botfront projet with `botfront init`. Don't start it
6. In `.botfront/botfront.yml`,  set the `bf_project_id` with the project ID of the locally running Botfront
7. In `.botfront/botfront.yml`, set the `mongo_url` to `mongodb://host.docker.internal:3001/meteor`
8. Start the Botfront project with `botfront up`