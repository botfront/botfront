# Deployment

::: tip Work in progress
We're working on a better deployment guide
:::

## Services and Docker images
Running botfront requires deploying different services. The recommended way is to use an orchestration framework such as Kubernetes or Swarm.

| Service  | Docker image  |
|---|---|
| botftont |  `botfront/botfront`|
| botfront-api  |  `botfront/botfront-api`  |
| rasa  |  `botfront/rasa-for-botfront`  |
| duckling  |  `botfront/duckling`  |
| actions | Build your own | 
| mongo | `mongo` or hosted service (mLab, Mongo Atlas, Compose, ...)  |

See the `docker-compose.yaml` file in the `.botfront` directory on your project

## Required environment variables

| Environment variable  | Description  | Required by|
|---|---|--|
| `ROOT_URL` |  The Botfront app URL (e.g. https://botfront.your.domain) | `botfront` |
| `MONGO_URL`  |  The mongoDB connection string (e.g. `mongodb://user:pass@server:port/database`)  | `botfront` `botfront-api` |
| `MONGO_OPLOG_URL`  |  The mongoDB Oplog connection string  | `botfront` |
| `MAIL_URL`  |  An SMTP url if you want to use the password reset feature  | `botfront` |
| `BF_PROJECT_ID` | The Botfront project ID (typically `my-first-project`) | `rasa` |
| `BF_URL` | The `botfront-api` root url | `rasa`  `actions`|

## MongoDB database
When you run Botfront in developer mode, Meteor will spin up a local MongoDB database accessible on port `3001`. However, when running in production or with `docker-compose` a MongoDB uri needs to be provided with the environment variable `MONGO_URL`. It is also **highly** recommended (but optional) to provide an oplog url with `MONGO_OPLOG_URL`. 

::: warning IMPORTANT: choose a very short database name
Choose a very short database name (e.g `bf`) and not too long response names to [avoid hitting the limits](https://docs.mongodb.com/manual/reference/limits/#namespaces).
:::

## Technical requirements

Those are the miminal requirements:

| Service  | RAM   | CPU  |
|---|---:|---:|
| botfront |  1 Gb | 1  | 
| botfront-api  |  512 Mb | 0.5  |
| duckling  |  512 Mb | 0.5  |
| rasa (supervised_embeddings) | 1 Gb  |  1 |
