
<p align="center">
<a href="(https://github.com/botfront/botfront/actions">
    <img src="https://github.com/botfront/botfront/workflows/build/badge.svg" />
</a>
<a href="https://www.npmjs.com/package/botfront">
    <img alt="npm" src="https://img.shields.io/npm/v/botfront.svg">
</a>
<a href='https://github.com/botfront/botfront/blob/master/LICENSE'>
    <img alt="License" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg">
</a>
<a href='https://github.com/botfront/botfront/discussions'>
    <img alt="Github discussions link" src="https://img.shields.io/badge/Community%20support-Start%20a%20discussion-green">
</a>
</p>
<br />

<H1 align="center">
    This project is not maintained anymore and will not receive further updates.
</H1>

<p align="center">
  <a href="#highlights">Highlights</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick start</a> •
  <a href="#development">Development</a>
</p>
<p align="center">
  <a href="./CHANGELOG.md">Release Notes</a> •
</p>

<br/>
<h2 align="center">What is it</h2>

Botfront is an open-source enterprise-grade conversational platform built with Rasa. 
It provides super intuitive interfaces and collaborative features to domain experts, conversational designers and engineers. 

<br/>
<h2 name="highlights" align="center">Highlights</h2>

<center>
<table>
  <tr>
    <th><h2>😎</h2><h3>Easy to use</h3></th>
    <th><h2>🎓</h2><h3>Powerful</h3></th>
    <th><h2>💻️</h2><h3>Developer friendly</h3></th>
  </tr>
    <tr>
    <td width="33%">Our main goal is to lower the technical barrier to entry in conversational AI. Implementing context-aware conversations should be as easy as chatting.</td>
    <td width="33%">Botfront uses <strong><a href="https://github.com/rasaHQ/rasa" target="_blank">Rasa</a></strong>, a powerful and production ready conversational AI library. Botfront exposes all Rasa functionalities and abstracts its complexity.</td>
    <td width="33%">Botfront's intuitive CLI orchestrates all Botfront's services on your development machine.<br/>Authoring, training, auto reloading actions code, it just works!</td>
  </tr>

</table>
</center>

<br/>
<h2 name="features" align="center">Features</h2>
<table>

<tr>
    <td width="33%"><h4>An intuitive interface for stories and rules</h4></td>
    <td width="67%">Botfront provides a <a href="https://botfront.io/docs/rasa/conversation-builder">unique and natural conversation authoring experience</a>. You can create complex dialog flows in minutes</td>
</tr>
<tr>
    <td width="33%"><h4>A flow chart editor for forms</h4></td>
    <td width="67%">A super intuitive <a href="https://botfront.io/docs/rasa/forms-slot-filling/">flow chart editor</a> for conversations that do not require machine learning
</tr>
<tr>
    <td width="33%"><h4>Automated tests</h4></td>
    <td width="67%">Create <a href="https://botfront.io/docs/rasa/testing/">automated tests in one click</a> from conversations, get detailed reports and deploy in confidence.
</tr>
<tr>
    <td width="33%"><h4>Git integration</h4></td>
    <td width="67%">Version your work on a repository with the new <a href="https://botfront.io//docs/rasa/git-integration">Git integration</a>.
</tr>
<tr>
    <td width="33%"><h4>Train & evaluate NLU models</h4></td>
    <td width="67%">Botfront comes with a complete NLU toolbox. You can tag vast amounts of data efficiently, train and evaluate models. <a href="https://botfront.io/docs/rasa/nlu/evaluation/#evaluation-methods">Several evaluation methods</a> are available depending on the development stage of your model, and you can annotate incoming NLU data</td>
</tr>
<tr>
    <td width="33%"><h4>Rasa integration</h4></td>
    <td width="67%">Botfront exposes all Rasa features and concepts and and makes them accessible at a higher level for faster development. You can <a href="https://botfront.io/docs/import-export/">export a Botfront project and use it with Rasa</a> at any time.</td>
</tr>
<tr>
    <td width="33%"><h4>Enterprise ready</h4></td>
    <td width="67%">Scale your conversational AI practice with enterprise grade projects and user management, RBAC and flexible deployment options.
</tr>
</table>
<br/>
<h2 name="quick-start" align="center">Quick Start</h2>

Botfront only requires a recent version of Docker. You can install the CLI with the following:

```bash
npm install -g botfront
```

Then just run `botfront`to get started.

<!-- broken image. commented out as I'm not sure it should be deleted -->
<!-- <img src="/botfront/docs/terminalizer/botfront-setup.gif?raw=true" width="100%"> -->

<br/>
<h2 name="documentation" align="center">Documentation</h2>

The [official documentation](https://botfront.io/docs/getting-started/setup) of Botfront is hosted on [botfront.io](https://botfront.io/docs/getting-started/setup). It is automatically built and updated on every new release. Once you've installed the cli you can also use `botfront docs` to open it.

**We welcome contributions!** It can be as easy as clicking on the "Edit page on Github" link at the bottom of every documentation pages.

<h2 name="development" align="center">Development</h2>

### Installation

1. Botfront is a Meteor app, so the first step is to [install Meteor](https://www.meteor.com/install)
2. Then clone this repo and install the dependencies:
```bash
git clone https://github.com/botfront/botfront
cd botfront/botfront
meteor npm install
```
3. Install the CLI from the source code:
```bash
# if you installed Botfront from npm uninstall it.
npm uninstall -g botfront
# Install the cli from the source code
cd cli && npm link
```
Botfront needs to be connected to other services, especially Rasa. To do this, you need to create a regular project, and start Botfront with a dedicated configuration:

1. Create a Botfront project with `botfront init` (somewhere else, not in the repo)
2. Start your project with `botfront up -e botfront`. This will run all services except the Botfront app, since you are going to run it with Meteor locally
3. Go back to the botfront checkout `cd botfront/botfront` and run Botfront with `meteor npm run start:docker-compose.dev`. Botfront will be available at [http://localhost:3000](http://localhost:3000) so open your browser and happy editing :smile_cat:

### TroubleShooting

Some [botfront cli](https://github.com/botfront/botfront/blob/master/cli/src/cli.js) commands that may help if you run into problems:

```shell
botfront init     # create a new botfront project
botfront logs     # show the logs!
botfront killall  # stop all docker services
botfront down     # stop all botfront services
botfront up       # restart botfront
botfront docs     # open the docs in your browser
```

Note that these should be run from the same directory as your botfront project

### Contribute

We ❤️ contributions of all size and sorts. If you find a typo, if you want to improve a section of the documentation or if you want to help with a bug or a feature, here are the steps:

1. Fork the repo and create a new branch, say `fix-botfront-typo-1`
2. Fix/improve the codebase
3. Commit the changes. **Commit message must follow [the naming convention](#commit-messages-naming-convention)**, say `fix(conversation builder): display story groups in alphabetical order`
4. Make a pull request. **Pull request name must follow [the naming convention](#commit-messages-naming-convention)**. It can simply be one of your commit messages, just copy paste it, e.g. `fix(readme): improve the readability and move sections`
5. Submit your pull request and wait for all checks passed (up to an hour)
6. Request reviews from one of the developers from our core team.
7. Get a 👍 and PR gets merged.

Well done! Once a PR gets merged, here are the things happened next:
- all Docker images tagged with `branch-master` will be automatically updated in an hour. You may check the status on the [Actions](https://github.com/botfront/botfront/actions) tab.
- your contribution and commits will be included in [our release note](https://github.com/botfront/botfront/blob/master/CHANGELOG.md).

### Testing

End to end tests are using the Cypress testing framework.

To manually run the Cypress tests, you need to have Botfront running in development mode. Some tests also require Rasa to be available.

Once you are at the root of the repo, you can enter the following.

```bash
cd botfront
# if you want to open Cypress' graphical interface
npx cypress open
# If you want to run the whole suite in headless mode
# This could take up to an hour depending on your computer
npx cypress run
# If you want to run a specific test
npx cypress run --spec "cypress/integration/02_training/training.spec.js"
```

### Commit messages naming convention

To help everyone with understanding the commit history of Botfront, we employ [`commitlint`](https://commitlint.js.org/#/) to enforce the commit styles:

```text
type(scope?): subject
```

where `type` is one of the following:

- build
- ci
- chore
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test

`scope` is optional, represents the module your commit working on.

`subject` explains the commit.

As an example, a commit that improved the documentation:
```text
docs(conversation builder): update slots manager screenshot.
```
<br/>
<h2 align="center">License</h2>

Copyright (C) 2021 Dialogue Technologies Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.(C) 2021 Dialogue Technologies Inc. All rights reserved.
