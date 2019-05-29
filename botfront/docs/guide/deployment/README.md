# Deployment

::: tip Work in progress
We're working on a better deployment guide
:::

Running botfront requires deploying different services with Docker containers. The recommended way is to use an orchestration framework such as Kubernetes or Swarm.
- botftont
- botfront-api
- nlu
- core
- actions
- duckling (only if you need structured entities)
- mongo (optional: you can use a hosted service such as mLab our Mongo Atlas instead).

See the `docker-compose.yaml` file in your `botfront-project` for an example

## Required environment variables

| Environment variable  | Description  | Required by|
|---|---|--|
| `ROOT_URL` |  The Botfront app URL (e.g. https://botfront.your.domain) | `botfront` |
| `MONGO_URL`  |  The mongoDB connection string (e.g. `mongodb://user:pass@server:port/database`)  | `botfront` `botfront-api` |
| `MONGO_OPLOG_URL`  |  The mongoDB Oplog connection string  | `botfront` |
| `MAIL_URL`  |  An SMTP url if you want to use the password reset feature  | `botfront` |
| `BF_PROJECT_ID` | The Botfront project ID (typically `my-first-project`) | `core` |
| `BF_URL` | The `botfront-api` root url | `core`  `actions`|

## MongoDB database
When you run Botfront in developer mode, Meteor will spin up a MongoDB database accessible on port `3001`. However, when running in production or with `docker-compose` a MongoDB uri needs to be provided with the environment variable `MONGO_URL`. It is also highly recommended (but optional) to provide an oplog url with `MONGO_OPLOG_URL`. 

::: warning Choose a very short database name
We strongly recommend using a very short database name (e.g `bf`) and not too long response names to [avoid hitting the limits](https://docs.mongodb.com/manual/reference/limits/#namespaces).
:::

## Technical requirements

Those are the miminal requirements:

| Service  | RAM   | CPU  |
|---|---:|---:|
| botfront |  1 Gb | 1  | 
| botfront-api  |  512 Mb | 0.5  |
| duckling  |  512 Mb | 0.5  |
| rasa-nlu (supervised_embeddings) | 1 Gb  |  1 |
| rasa-core  |  512 Mb | 1  |