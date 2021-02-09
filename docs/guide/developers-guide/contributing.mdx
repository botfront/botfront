---
name: Contributing to Botfront
title: Contribute to make Rasa development even easier
route: /docs/contributing
menu: Developers
meta:
  - name: description
    content: "Setup your local environment to develop or contribute to Botfront to make Rasa development even easier"
  - name: keywords
    content: botfront open source meteor contribute rasa
---

# Contributing to Botfront

If you wish to contribute to Botfront or to make custom changes, here is the recommended way to install and run it on your local machine.

## Install

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies

```bash
git clone https://github.com/botfront/botfront
cd botfront/botfront
meteor npm install
```

<Important type="tip" title="Don't run tests if you have valuable data in your DB">

Meteor comes with its own Node.js and NPM. When installing dependencies, it is better to use the Meteor NPM by running `meteor npm install` than using your local one (`npm install`)

</Important>

## Run

Since Botfront is made of several services you need to start all other services with `docker-compose` from a regular project.

1. Create a Botfront project with `botfront init` (not in the repo, anywhere else on your machine)
2. Start your project with `botfront up -e botfront`. This will run all services except the Botfront app, since you are going to run it with Meteor locallyé
3. Reset meteor from Botfront root folder with `meteor reset` (**this will wipe the database**).
4. Run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000)

## Documentation

The documentation is located in the `botfront/docs` folder. If you wish to edit the doumentation and preview your changes your can run the documentation on your machine with `npm run docs:dev`.

If you need to build it: `npm run docs:build`

The docs are built with [Vuepress](https://vuepress.vuejs.org)

## Running and writing tests

You can run our integration test suite with `npx cypress run` or interactively with `npx cypress open`

<Important type="warning" title="Don't run tests if you have valuable data in your DB">

The test suite starts by testing the setup process **and will wipe the database**.

</Important>


## Using the logger

When contributing you will most certainly need to log some information.
Under the hood, we use Winston. You can create an instance of a logger with one of the helper functions  [found here](#createlogger).
We use one logger instance per file and one per method.

The logging is only done on the server-side part of the application.
Our logger supports 4 severity levels:
- error
- warn
- info
- debug

You can also add metadata to the log statement to provide more details. However, we limit the metadata you can log to: 
- userId (prefilled by helper)
- file (prefilled by helper)
- method (prefilled by helper)
- url
- data
- args (prefilled by helper)
- params
- status
- error

If you already have access to a logger instance in your method, here is a quick extract of the winston doc showing usage. Otherwise, refer to [Creating a logger](#createlogger)
```javascript
logger.log({
  level: 'info',
  message: 'Hello log files!'
});
// Same as the previous statement
logger.info('Hello again logs');

// a logging statement with metadata
logger.info('Everything is alright !', {status: 200});

logger.error('Oh no, something went wrong', {status: 500});
```

Log statement are formated as follows. Empty fields do not appear.
```
<timestamp> [<level>] : <message> user: <userId> <file> - <method> with <args>  <status> url: <url> params: <params> data: <data>  error: <error> 
```
For example, it looks like this
```
2020-02-14T17:23:28.025Z [info] : Training project bf... user: Hv45jp24J7i3ncaZW /imports/api/instances/instances.methods.js - rasa.train with {"projectId":"bf","instance":{"_id":"vcS4JMdx4LTTr9T65","name":"Default","host":"http://rasa:5005","projectId":"bf","type":"server"}}
```


## Creating a logger
To create a logger instance we have three helper functions, `getAppLoggerForFile`, `getAppLoggerForMethod` and `addLoggingInterceptors`

```javascript
 import {
        getAppLoggerForFile,
        getAppLoggerForMethod,
        addLoggingInterceptors,
    } from 'botfront/server/logger.js'; // change to yours
```


If you want to see some real usage you can look into the `botfront/botfront/imports/api/instances/instances.methods.js` file

Here are the details for each function. 

### getAppLoggerForFile(filename)
This method will create a logger for the whole file, it just creates a logger with the file metadata prefilled
- filename: the name of the file your logging from, should be `__filename` most of the time

the returned instance will most likely be used in the next method. It's very unlikely that you log using this instance.

### getAppLoggerForMethod(fileLogger, method, userId, callingArgs)

This method will create a logger for a specific method, and it is from this one that you will get the instance for logging
- fileLogger: an logger instance previously created with the above function 
- method: the method name your are in
- userId: userId, most of the time it will be Meteor.userId()
- callingArgs: arguments used to call the method you are in


```javascript
const filelogger = getAppLoggerForMethod(__filename);

const aMethod = (a,b) => {
    const methodLogger = getAppLoggerForMethod(fileLogger, 'aMethod', Meteor.userId(), {a,b});
    methodLogger.info('Stated to work')
    // 2020-01-01T12:00:00.00Z [info] : Stated to work user: user1 .../example.js - aMethod with {a: 'a', b: 'b'}
}
```


### addLoggingInterceptors(axiosClient, logger)

This helper is specificatly designed to be used with axios, and it will log at request time and response time.
 - axiosClient: the instance of axios that you want to log data from created throught `axios.create()`
 - logger: an instance of a logger created throught `getAppLoggerForMethod`

```javascript
const logger = getAppLoggerForMethod(...);
const client = axios.create();
addLoggingInterceptors(client, logger);
client.post(url, payload); // this call will create reponse and request logs
```
