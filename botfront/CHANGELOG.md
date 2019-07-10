# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.15.0](https://github.com/botfront/botfront/compare/v0.15.0-rc.1...v0.15.0) (2019-07-09)


### Bug Fixes

* **empty-storygroup-name:** Story group with empty name is not attempted to save. ([00d0e55](https://github.com/botfront/botfront/commit/00d0e55))
* commented dangerous db query ([8e3d990](https://github.com/botfront/botfront/commit/8e3d990))
* fixed error that prevented training ([2b81691](https://github.com/botfront/botfront/commit/2b81691))
* wrong title in stories ([3135318](https://github.com/botfront/botfront/commit/3135318))


### Features

* **intro-stories:** Add intro-stories for the front and backend ([9b1171e](https://github.com/botfront/botfront/commit/9b1171e))
* **new-train-button:** Add a generic train button ([38a82ae](https://github.com/botfront/botfront/commit/38a82ae))
* **stories:** Add intro stories at start of a project ([1ae1dd5](https://github.com/botfront/botfront/commit/1ae1dd5))
* **train-storyGroup:** Only selected stories are trained ([2daa6f0](https://github.com/botfront/botfront/commit/2daa6f0))



## [0.15.0-rc.0](https://github.com/botfront/botfront/compare/v0.14.5...v0.15.0-rc.0) (2019-06-23)


### Bug Fixes

* **activity:** Fixed language field from models ([bd42879](https://github.com/botfront/botfront/commit/bd42879))
* **add-language:** backspace cannot be used to remove a language ([5cbddc3](https://github.com/botfront/botfront/commit/5cbddc3))
* **chat:** use environment variable for socket url ([5509a86](https://github.com/botfront/botfront/commit/5509a86))
* **cli:** botfront log displays continous logs ([eb2555e](https://github.com/botfront/botfront/commit/eb2555e))
* **cli:** Error when init a new project ([69afddc](https://github.com/botfront/botfront/commit/69afddc))
* **cli:** logs from CLI main menu not working ([5d7fcdb](https://github.com/botfront/botfront/commit/5d7fcdb))
* **core policy:** pr changes ([f2d36c5](https://github.com/botfront/botfront/commit/f2d36c5))
* **delete instance:** removed the delete instance bug ([0b918b2](https://github.com/botfront/botfront/commit/0b918b2))
* **nlu:** evaluation broken due to a missing instance ([226f7d2](https://github.com/botfront/botfront/commit/226f7d2))
* **nlu:** Missing import for the Loaded in API tab ([93e07a3](https://github.com/botfront/botfront/commit/93e07a3))
* **nlu:** Wrong  logger components ([62ca16e](https://github.com/botfront/botfront/commit/62ca16e))
* **nlu:** wrong component name ([1234902](https://github.com/botfront/botfront/commit/1234902))
* **slots:** domain would not generate when no slot ([017f0d9](https://github.com/botfront/botfront/commit/017f0d9))
* **slots:** slots validation ([6dbdce6](https://github.com/botfront/botfront/commit/6dbdce6))
* **switch languages:**  minor fixes for switch language feature ([0c08815](https://github.com/botfront/botfront/commit/0c08815))
* **test-switch-langauge:** Test adaptation complete ([f933411](https://github.com/botfront/botfront/commit/f933411))
* **tests:** Made tests independent of NLUModel ([6ade15a](https://github.com/botfront/botfront/commit/6ade15a))
* **user-email:** email address is trimmed before storing ([8a30066](https://github.com/botfront/botfront/commit/8a30066))
* adding a story ([e1a28d1](https://github.com/botfront/botfront/commit/e1a28d1))
* core policy test ([6ab8411](https://github.com/botfront/botfront/commit/6ab8411))
* correct actions base image in project template ([e1ff3b1](https://github.com/botfront/botfront/commit/e1ff3b1))
* default actions server port in environment variables ([8071a5c](https://github.com/botfront/botfront/commit/8071a5c))
* eslint error ([b8cfb6f](https://github.com/botfront/botfront/commit/b8cfb6f))
* gathering training data ([c18d778](https://github.com/botfront/botfront/commit/c18d778))
* merge related fixes ([6f80729](https://github.com/botfront/botfront/commit/6f80729))
* minor fixes project info ([eadf2dc](https://github.com/botfront/botfront/commit/eadf2dc))
* PR ([2d7b8c3](https://github.com/botfront/botfront/commit/2d7b8c3))
* PR changes ([a0e185a](https://github.com/botfront/botfront/commit/a0e185a))
* useless div ([16c5ddc](https://github.com/botfront/botfront/commit/16c5ddc))
* wrong message in Project info ([c8df530](https://github.com/botfront/botfront/commit/c8df530))


### Features

* **cli:** A CLI to create and start a project ([fdca615](https://github.com/botfront/botfront/commit/fdca615))
* **cli:** added a debug flag to rasa in the docker-compose file ([7a73953](https://github.com/botfront/botfront/commit/7a73953))
* **cli:** Added project start prompt after project is created ([78c2730](https://github.com/botfront/botfront/commit/78c2730))
* **cli:** contextual start and stop options ([faee3d9](https://github.com/botfront/botfront/commit/faee3d9))
* **cli:** Messages variations when checking / pulling ([d8fba18](https://github.com/botfront/botfront/commit/d8fba18))
* **cli:** more intuitive commands ([1c9363e](https://github.com/botfront/botfront/commit/1c9363e))
* **cli:** Poss. to change Docker image tags ([478f9c9](https://github.com/botfront/botfront/commit/478f9c9))
* **cli:** pull only if needed; fixed const reassign ([043bddb](https://github.com/botfront/botfront/commit/043bddb))
* **cli:** too many things ([51e536a](https://github.com/botfront/botfront/commit/51e536a))
* **data-import:** uploaded file is converted to json by rasa endpoint ([b2dc297](https://github.com/botfront/botfront/commit/b2dc297))
* **instances:** instance type is now hidden if empty ([c526f34](https://github.com/botfront/botfront/commit/c526f34))
* **model-creation:** Associated new models with default model instance ([18a6eb0](https://github.com/botfront/botfront/commit/18a6eb0))
* **nlu:** set 'data' as default tab when opening a model ([e443530](https://github.com/botfront/botfront/commit/e443530))
* **nlu:** Support for NLU parsing with new Rasa API ([695351a](https://github.com/botfront/botfront/commit/695351a))
* **Project Info:** Language selection ([baa1001](https://github.com/botfront/botfront/commit/baa1001))
* **project-settings:** added default core policy ([d01b504](https://github.com/botfront/botfront/commit/d01b504))
* **slots:** boilerplate ([6af17f3](https://github.com/botfront/botfront/commit/6af17f3))
* **slots:** fixed up the UI ([29e8b22](https://github.com/botfront/botfront/commit/29e8b22))
* **slots:** slots are added to domain file ([ec96b5f](https://github.com/botfront/botfront/commit/ec96b5f))
* **slots:** specific forms for specific types ([01b54a4](https://github.com/botfront/botfront/commit/01b54a4))
* **slots:** validation for float slot type ([223d53f](https://github.com/botfront/botfront/commit/223d53f))
* **slots:** you can create and edit slots ([2895fe9](https://github.com/botfront/botfront/commit/2895fe9))
* **stories:** added tests for story validator ([b5b902d](https://github.com/botfront/botfront/commit/b5b902d))
* **stories:** auto sav ([2201ae3](https://github.com/botfront/botfront/commit/2201ae3))
* **stories:** definitive ESLint compliance; improved exception handling ([e97db4e](https://github.com/botfront/botfront/commit/e97db4e))
* **stories:** delete stories and format errors ([625ab62](https://github.com/botfront/botfront/commit/625ab62))
* **stories:** ESLint compliance; improved exception handling ([b0db64a](https://github.com/botfront/botfront/commit/b0db64a))
* **stories:** friendly md messages ([9bbddd5](https://github.com/botfront/botfront/commit/9bbddd5))
* **stories:** initial commit for StoryValidator class lib ([8e3fd42](https://github.com/botfront/botfront/commit/8e3fd42))
* **stories:** lazy loading ([30a5b0f](https://github.com/botfront/botfront/commit/30a5b0f))
* **stories:** popup confirm to delete stories ([671690d](https://github.com/botfront/botfront/commit/671690d))
* **stories:** story validation - output at most 1 'title' error ([84eb5ec](https://github.com/botfront/botfront/commit/84eb5ec))
* **stories:** updated test & fixture file to use error codes ([9379516](https://github.com/botfront/botfront/commit/9379516))
* **stories:** you can now save stories ([821cf82](https://github.com/botfront/botfront/commit/821cf82))
* added model_id param to HttpLogger component ([61f6287](https://github.com/botfront/botfront/commit/61f6287))
* auto extract triggered actions from policy to domain ([f85391c](https://github.com/botfront/botfront/commit/f85391c))
* menu and adding story groups ([f855b29](https://github.com/botfront/botfront/commit/f855b29))
* **switch-langauges:** Added support for legacy models ([acad437](https://github.com/botfront/botfront/commit/acad437))
* simpler consent for product updates ([8608c7e](https://github.com/botfront/botfront/commit/8608c7e))
* **train stories:** Training button added to stories ([ee22054](https://github.com/botfront/botfront/commit/ee22054))
* **train stories:** Training button added to stories ([35a11df](https://github.com/botfront/botfront/commit/35a11df))
* **training:**  fixed model name ([779002d](https://github.com/botfront/botfront/commit/779002d))
* stories (wip) ([896fecb](https://github.com/botfront/botfront/commit/896fecb))


### Tests

* training data fix ([494ccb3](https://github.com/botfront/botfront/commit/494ccb3))
* **docker-compose:** Added a test to check that the orchestrator is docker-compose ([02fbb80](https://github.com/botfront/botfront/commit/02fbb80))
* **project-instances:** added create, edit and delete instance test ([3e57a78](https://github.com/botfront/botfront/commit/3e57a78))
* **project-setting:** added test for core policy ([b550473](https://github.com/botfront/botfront/commit/b550473))
* **switch language:** added test for adding and deleting model ([0396ab4](https://github.com/botfront/botfront/commit/0396ab4))



### [0.14.5](https://github.com/botfront/botfront/compare/v0.14.4...v0.14.5) (2019-05-16)


### Bug Fixes

* docker compose ([753c157](https://github.com/botfront/botfront/commit/753c157))



### [0.14.4](https://github.com/botfront/botfront/compare/v0.14.3...v0.14.4) (2019-05-16)


### Bug Fixes

* linux compatibility ([0e991f6](https://github.com/botfront/botfront/commit/0e991f6))
* README.md ([834c0fa](https://github.com/botfront/botfront/commit/834c0fa))
* subscription email ([6989e38](https://github.com/botfront/botfront/commit/6989e38))


### Features

* side chat now supports no language ([6f39945](https://github.com/botfront/botfront/commit/6f39945))


### Tests

* testing no language in chat ([6a71e06](https://github.com/botfront/botfront/commit/6a71e06))



### [0.14.3](https://github.com/botfront/botfront/compare/v0.14.2...v0.14.3) (2019-05-10)


### Bug Fixes

* entities not saving ([26b96a1](https://github.com/botfront/botfront/commit/26b96a1))
* login background size ([489388f](https://github.com/botfront/botfront/commit/489388f))


### Tests

* entities saving ([3b901e2](https://github.com/botfront/botfront/commit/3b901e2))



### 0.14.2 (2019-05-09)


### Bug Fixes

* object in ace field ([b1156a9](https://github.com/botfront/botfront/commit/b1156a9))
* **bot responses:** import fails ([38a9d99](https://github.com/botfront/botfront/commit/38a9d99))
* removed useles instance property ([a8c9d58](https://github.com/botfront/botfront/commit/a8c9d58))


### Features

* better confirmation for publish model ([8ecf500](https://github.com/botfront/botfront/commit/8ecf500))
* confirmation for model duplication ([45e9bb0](https://github.com/botfront/botfront/commit/45e9bb0))
* pull request template ([2c9f554](https://github.com/botfront/botfront/commit/2c9f554))


### Tests

* duplicate and publish models ([bbc863b](https://github.com/botfront/botfront/commit/bbc863b))



## 0.14.0 (2019-05-06)


### Bug Fixes

* corrected instances ([c949333](https://github.com/botfront/botfront/commit/c949333))
* scroll in bot responses ([3ca4928](https://github.com/botfront/botfront/commit/3ca4928))


### Features

* disabled activity button in Populate ([5d60c61](https://github.com/botfront/botfront/commit/5d60c61))
