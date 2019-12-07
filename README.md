<p align="center">
<a href="https://botfront.io">
    <img src="botfront/docs/images/botfront_animation.gif" width="100%">
</a>

<p align="center">
<a href="(https://github.com/botfront/botfront/actions">
    <img src="https://github.com/botfront/botfront/workflows/build/badge.svg" />
</a>
<a href="https://www.npmjs.com/package/botfront">
    <img alt="npm" src="https://img.shields.io/npm/v/botfront.svg">
</a>
<a href='https://github.com/botfront/botfront/blob/master/LICENSE'>
    <img alt="License" src="https://img.shields.io/badge/license-AGPLv3-blue.svg">
</a>
<a href='https://spectrum.chat/botfront'>
    <img alt="License" src="https://withspectrum.github.io/badge/badge.svg">
</a>
</p>



<p align="center">
  <a href="#highlights">Highlights</a> •
  <a href="#quicstart">Quick start</a> •
  <a href="https://spectrum.chat/botfront">Get help</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing">Contributing</a> •
  <a href="./CHANGELOG.md">Release Notes</a> •
  <a href="https://botfront.io">Botfront.io</a>
</p>

<h2 align="center">What is it</h2>


[Botfront](https://botfront.io) is an open source chatbot platform aiming to accelerate the development of complex and context-aware virtual assistants. Botfront runs on your machine and can be deployed on the cloud of your choice.

<h2 name="highlights" align="center">Highlights</h2>


<center>
<table>
  <tr>
    <th><h1>😎</h1><h3>Easy to use</h3></th>
    <th><h1>🎓</h1><h3>State of the Art</h3></th>
    <th><h1>💻️</h1><h3>Developer friendly</h3></th>
  </tr>
    <tr>
    <td width="33%">Conversational projects require easy prototyping, fast implementation and continous iteration. With Botfront, implementing context-aware conversation flows takes minutes and you can accelerate your time to market by an exponential factor.</td>
    <td width="33%">Botfront is built on top of  <a href="https://github.com/rasaHQ/rasa" target="_blank">Rasa</a>, one of the most popular and production ready conversational AI library. Botfront exposes all Rasa functionalities while astracting its complexity. Botfront projects can be exported for an existing Rasa installation.</td>
    <td width="33%">Botfront's intuitive CLI wraps docker-compose commands and abstracts the micro-services orchestration on your development machine. Authoring, training, auto reloading actions code, it just works!</td>
  </tr>
  <tr>
      <th><h1>🌌</h1><h3>Micro services</h3></th>
      <th><h1>🌐</h1><h3>Multilingual</h3></th>
      <th><h1>📚</h1><h3>Documented</h3></th>
    </tr>
    <tr>
      <td width="33%">Botfront comes as containerized micro services that can be deployed on any orchestration system.</td>
      <td width="33%">Build virtual assistants capable of understanding and speaking multiple languages. Implement the conversation flow once and translate your NLU model and bot responses.</td>
      <td width="33%">Botfront is <a href="https://botfront.io/docs/getting-started/setup/" target="_blank">thoroughly documented</a> and <a href="https://botfront.io/docs/getting-started/setup/" target="_blank"> <a href="https://spectrum.chat/botfront" target="_blank">community support </a>is available on <a href="https://spectrum.chat/botfront" target="_blank">Spectrum</a></td>
    </tr>
</table>
</center>


<h2 name="quick-start" align="center">Quick Start</h2>

Botfront only requires a recent version of Docker. You can install the CLI with the following:

```bash
npm install -g botfront
```

Then just run `botfront`to get started.

<img src="/botfront/docs/terminalizer/botfront-setup.gif?raw=true" width="100%">

<h2 name="documentation" align="center">Documentation</h2>

The official documentation of Botfront is hosted on [botfront.io](https://botfront.io/docs)and is automatically built and updated on every new release.

If you need run the documentation elsewhere you can build a Docker container as follows:
```bash
# From the root of the repo
docker build -t botfront/botfront-docs botfront/docs
```

To serve the docs on port 8080 (e.g. `https://localhost:8080`):
```bash
docker run -p 8080:80 botfront/botfront-docs
```

<h2 name="contributing" align="center">Contributing</h2>

We ❤️ contributions of all size and sorts. If you find a typo, if you want to improve a section of the documentation or if you want to help with a bug or a feature, here are the steps:

1. Fork the repo and create a new branch, say `fix-botfront-typo-1`
2. Fix/improve the codebase
3. Commit the changes. **Commit message must follow [the naming convention](#naming-convention)**, say `fix(conversation builder): display story groups in alphabetical order`
4. Make a pull request. **Pull request name must follow [the naming convention](#naming-convention)**. It can simply be one of your commit messages, just copy paste it, e.g. `fix(readme): improve the readability and move sections`
5. Submit your pull request and wait for all checks passed (up to an hour)
6. Request reviews from one of the developers from our core team.
7. Get a 👍 and PR gets merged.

Well done! Once a PR gets merged, here are the things happened next:
- all Docker images tagged with `branch-master` will be automatically updated in an hour. You may check the status on the [Actions](https://github.com/botfront/botfront/actions) tab.
- your contribution and commits will be included in [our weekly release note](https://github.com/gnes-ai/gnes/blob/master/CHANGELOG.md). 🍻

<h3 name="naming-convention" align="center">Commits naming convention</h3>

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

<h2 align="center">License</h2>

Botfront is [AGPLv3](https://github.com/botfront/botfront/blob/master/LICENSE) licensed. You can read the licence [here](https://github.com/botfront/botfront/blob/master/LICENSE).

<sub>
Copyright (C) 2019 9300-2038 Quebec Inc. All rights reserved.
</sub>
