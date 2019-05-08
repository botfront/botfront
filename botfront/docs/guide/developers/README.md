
# Developers guide

## Develop


#### Install


1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies
```bash
git clone https://github.com/botfront/botfront
cd botfront
meteor npm install
```

#### Run

- With default settings: `meteor npm start`
- With `docker-compose` settings: `meteor npm run start:docker-compose`


#### Documentation
- Run the documentation locally: `npm run docs:dev`
- Build the documentation : `npm run docs:build`

The docs are built with [Vuepress](https://vuepress.vuejs.org)


Botfront is built with Meteor, you must install it first. Then:

```bash
git clone https://github.com/botfront/botfront
cd botfront/botfront # Yes, twice
meteor npm install
meteor npm start
```


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

