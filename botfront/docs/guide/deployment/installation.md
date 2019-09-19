---
meta:
  - name: description
    content: 'Botfront: server installation'
  - name: keywords
    content: botfront stories nlu rasa slots deployment
permalink: /deployment/:slug
---

# Server installation

Botfront comes as a collection of services delivered as Docker images that you need to orchestrate so they can work together. You have different options.

## Orchestration framework (recommended)
Deploying on  Kubernetes, Openshift or Swarm is by far the best option if you are familiar with one of them, especially if you are running it in production.

## Single server
An alternative option is to deploy all the services on a single machine with Docker installed. The easiest option is then to run Botfront with Docker compose and you can easily re-use the `docker-compose.yaml` file in the `.botfront` directory on your project.

Note that using docker-compose in production is generally not recommended as a best practice.

## Services and Docker images
The table below lists all the services that can be used with Botfront.

| Service  | Docker image  |
|---|---|
| botftont |  `botfront/botfront`|
| botfront-api  |  `botfront/botfront-api`  |
| rasa  |  `botfront/rasa-for-botfront`  |
| duckling  |  `botfront/duckling`  |
| actions | Build your own | 
| mongo | `mongo` or hosted service (mLab, Mongo Atlas, Compose, ...)  |

::: tip Image tags
It is not recommended to deploy the images witout tags or with the `latest` tag. Look in the `.botfront.yml` for the tags corresponding to the version of Botfront you are using.
:::

Duckling (a structured entity parser developed by Facebook) is not strictly required if your NLU pipeline doesn't use it.

Also, be very careful with your choice regarding MongoDB. If you decide to just run it as a container, be sure to at least properly mount the volume on a physical disk (otherwise all your data will be gone when the container is destroyed) and seriously consider scheduling back-ups on a regular basis.

Using a hosted service such as MongoDB Atlas is highly recommended, some of them even include a free plan that will be more than enough for small projects.

## Environment variables

The following table shows the environment variables required by each service. Be sure to make those available as arguments or in the manifest files of your deployment

| Environment variable  | Description  | Required by|
|---|---|--|
| `ROOT_URL` |  The Botfront app URL (e.g. https://botfront.your.domain) | `botfront` |
| `MONGO_URL`  |  The mongoDB connection string (e.g. `mongodb://user:pass@server:port/database`)  | `botfront` `botfront-api` |
| `MONGO_OPLOG_URL`  |  The mongoDB Oplog connection string  | `botfront` (optional)|
| `MAIL_URL`  |  An SMTP url if you want to use the password reset feature  | `botfront` |
| `BF_PROJECT_ID` | The Botfront project ID (typically `my-first-project`) | `rasa` |
| `BF_URL` | The `botfront-api` root url | `rasa`  `actions`|
| `MODELS_LOCAL_PATH` |  Where the trained model returned by Rasa is stored locally. Defaults to `/app/models/` and should not be changed in a containerized environment. The Botfront Dockerfile exposes a volume with that path | `botfront` (optional) |

## Volumes

Although volumes are technically not required for Botfront to run and work, if you do not mount them your data will be gone when containers are destroyed.

| Volume  | Description  | Used by|
|---|---|--|
| `/app/models` |  Where Botfront stores the model retured by Rasa when the training is completed | `botfront` |
| `/app/models`  |  Where Rasa loads a model from when it starts | `rasa` |
| `/data/db`  |  Where MongoDB persists your data | `mongo`|

`/app/models` should be mounted on the same location so when Rasa restarts it can load the latest trained model.

## MongoDB database considerations
It is **highly** recommended (but optional) to provide an oplog url with `MONGO_OPLOG_URL`. This will improve the reactivity of the platform as well as reduce the network throughput between MongoDB and Botfront.

::: warning IMPORTANT: choose a very short database name
Choose a very short database name (e.g `bf`) and not too long response names to [avoid hitting the limits](https://docs.mongodb.com/manual/reference/limits/#namespaces).
:::

## Indicative technical requirements

Those are the minimal requirements:

| Service  | RAM   | CPU  |
|---|---:|---:|
| botfront |  1 Gb | 1  |
| botfront-api  |  128 Mb | 0.5  |
| duckling  |  512 Mb | 0.5  |
| rasa (supervised_embeddings) | 1 Gb  |  1 |


