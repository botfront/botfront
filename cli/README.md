# Botfront.
<p align="center">
<a href="https://botfront.io">
    <img src="botfront_animation.gif" width="100%">
</a>

<p align="center">
<a href="(https://github.com/botfront/botfront/actions">
    <img src="https://github.com/botfront/botfront/workflows/build/badge.svg" />
</a>
<a href="https://www.npmjs.com/package/botfront">
    <img alt="npm" src="https://img.shields.io/npm/v/botfront.svg">
</a>
<a href='https://github.com/botfront/botfront/blob/master/LICENSE'>
    <img alt="License" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg">
</a>
<a href='https://spectrum.chat/botfront'>
    <img alt="Spectrum link" src="https://withspectrum.github.io/badge/badge.svg">
</a>
</p>


<p align="center">
  <a href="#highlights">Highlights</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#development">Development</a>
</p>
<p align="center">
  <a href="./CHANGELOG.md">Release Notes</a> •
  <a href="https://spectrum.chat/botfront">Get help</a> •
  <a href="https://botfront.io">Botfront.io</a>
</p>

<br/>
<h2 align="center">What is it</h2>

Conversational projects require easy prototyping, fast implementation and continuous iteration. With **[Botfront](https://botfront.io)** you can build context-aware conversation flows in minutes and accelerate time to market by an exponential factor.
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

## Version Control

Clone the project as usual then run `git push -u origin master` to set origin as the default remote. **Don't miss this step** or you might push on the open source repo by accident.
### Getting started

Just...

```bash
npm install -g botfront
```

And...

```bash
botfront
```

Then run `git remote add upstream https://github.com/botfront/botfront` to add the open source repo as another remote source.

Now, everytime you want to integrate the latest changes from the open source repo, just run `git pull upstream stable`

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

Copyright (C) 2021 Dialogue Technologies Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
