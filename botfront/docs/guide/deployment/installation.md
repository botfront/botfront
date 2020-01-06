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
Deploying on Kubernetes or Openshift is by far the best option if you are familiar with one of them, especially if you are running it in production.

## Install Botfront on a remote server

You can install Botfront with the CLI on a remote server exactly how you installed it on your local machine. A notable drawback to this approach is that if you want to use custom actions, you need to either develop them on the server or figure out a way to transfer them from your local machine.

First you need to spin up a virtual machine from the Cloud Provider of your choice. We recommend a machine with at least 1 CPU and 2 Gb of RAM

::: warning
This is only a start. The following installation is not secure and not suitable for production.
:::

1. Create a virtual machine with Ubuntu installed, and note the external IP address. For this tutorial, we'll assume the IP address is `123.99.135.3`
2. Install Node.js
```bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install lts/erbium
```
3. Install Docker and Docker Compose
```bash
sudo apt-get -y update
sudo apt-get -y remove docker docker-engine docker.io
sudo apt -y install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo apt install curl
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
4. Install Botfront
```bash
npm install -g botfront
botfront init # create a project
```

5. Edit the `botfront.yml` file
```bash
nano .botfront/botfront.yml
```

In the `env` section, change the `root_url` to the machine IP address (leave the port 8888 unchanged)
```yaml
env:
  ...
  root_url: 'http://123.99.135.3:8888'
  ...
```
6. Launch Botfront
```bash
botfront up
```
7. Open Botfront in your browser (`http://123.99.135.3:8888`) and setup your project
8. Go to settings/credentials and change the `base_url` host to the IP address (keep the host unchanged)
```yaml
rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: http://123.99.135.3:5005
  socket_path: '/socket.io/'
```
9. Botfront is ready to use.

## Run Botfront remotely with `docker-machine`

`docker-machine` lets you run docker containers on a remote machine from your local computer. Since Botfront is powered by containers, it is a good option. `docker-compose` makes it safe and easy to transfer files to the server, which makes deployments a little bit easier.


We're going to use DigitalOcean for this tutorial, but all major cloud providers are supported. See [here](https://docs.docker.com/v17.09/machine/drivers/) for more information.

#### 1. Get your DigitalOcean API key
Select the `API` option from the left sidebar of the admin panel and generate a token from there. Give it `read` and `write` permissions.
Then set a variable in your shell:

```bash
export $DOTOKEN=<your token>
```

#### 2. Provision your machine

```bash
docker-machine create \
  --driver digitalocean \
  --digitalocean-image centos-7-x64 \
  --digitalocean-size s-1vcpu-1gb \
  --digitalocean-access-token $DOTOKEN \
  botfront-machine
```

This will setup a 1vCPU and 1gb RAM virtual machine with the CentOS operating system installed. It takes a few minutes

When this is done you can run `docker-machine inspect botfront-machine` to obtain the IP address of your machine (at the top of the JSON output):

```
{
    "ConfigVersion": 3,
    "Driver": {
        "IPAddress": "167.71.163.9", # <-- IP address
        "MachineName": "botfront-machine",
        ...
```

#### 3. Create specific compose files

::: tip Note
You must execute all the following commands from your project folder
:::


Your remote deployment will have different characteristics than your local project, so `docker-compose.yml` and `.env` must be different.

Create a `digitalocean` folder and copy the compose files:

```bash
mkdir digitalocean
cp docker-compose.yml digitalocean/.
cp .env digitalocean/.
cd digitalocean
```

In `digitalocean/.env`, replace the host in the `ROOT_URL` with the IP address:
```
...
ROOT_URL=http://167.71.163.9:8888
...
```

In `digitalocean/docker-compose.yml`:

##### 1. Replace all occurrences of:

```yaml
    ...
    env_file:
      - .env
    ...
```

with:

```yaml
    ...
    env_file:
      - ./digitalocean/.env
    ...
```

##### 2. Unexpose unncessary services
Unless you need them for debugging purposes, the `botfront-api` and `mongo` services do not need to be exposed outside of the Docker network.

You can simply comment or remove as follows:

```yaml
botfront-api:
    ...
    # ports:
    #  - '8080:8080'
    ...
...
mongo:
    ...
    # ports:
    #  - '27017:27017'
    ...
```
```

```bash
eval $(docker-machine env botfront-machine)
```

#### 4. Copy your project files and database to the remote host

::: warning
You must execute these commands from your project folder and not from the `digitalocean` folder
:::

If you already have a project (stories, actions, trained models,...) you might want to copy them to the remote server. The following commands will replicate your database, actions and models on the remote host.

```bash
docker-machine scp -r botfront-db botfront-machine:$(pwd)/botfront-db
docker-machine scp -r actions botfront-machine:$(pwd)/actions
docker-machine scp -r models botfront-machine:$(pwd)/models
```

::: tip Where to find your project on the remote host?
`docker-machine` will use the exact same location the remote host. So if your project is at `/some/path/your_project` on your local machine, it is going to be at the exact same place on the remote host. Which means that if you ssh your machine with `docker-machine ssh botfront-machine` you can `cd /some/path/your_project` to find your project. This is why the above commands use `pwd`
:::



#### 5. Start Botfront on the remote host

Connect your `docker` CLI to the remote host.

```bash
eval $(docker-machine env botfront)
```

Go to the `digitalocean` folder:

```bash
cd digitalocean
```

Run Botfront with:

```bash
docker-compose  --project-directory ../ up -d
```

Open Botfront in your browser (`http://<your_ip>:8888`) and setup your project and go to settings/credentials to change the `base_url` host to the IP address (keep the host unchanged)
```yaml
rasa_addons.core.channels.webchat.WebchatInput:
  session_persistence: true
  base_url: http://<your_ip>:5005
  socket_path: '/socket.io/'
```

Note: you'll have to do that again each time you push the database to the remote host (see previous step)

Botfront is up and running!


#### 6. Stopping Botfront and disconnecting from `docker-machine`

To stop Botfront:

```bash
docker-compose  --project-directory ../ down -d
```

To disconnect your Docker CLI from the remote host (i.e if you want to run your project locally):

```bash
eval $(docker-machine env -u)
```

::: danger
If you remove the machine with `docker-machine rm botfront-machine, it will erase your local project
:::


#### What's next
The next step is to add a proxy and a ssl security layer with Let's Encrypt certificates.
Contributions are welcome, you may start [here](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion/wiki/Docker-Compose) and [there](https://github.com/evertramos/docker-compose-letsencrypt-nginx-proxy-companion).


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
| `BF_PROJECT_ID` | The Botfront project ID (typically `bf`) | `rasa` |
| `BF_URL` | The `botfront-api` root url | `rasa`  `actions`|
| `API_KEY` | GraphQL API key. You can then set the `authorization` header to the `API_KEY` value to perform GraphQL operations | `botfront`|
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


