# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.0.0-alpha.2](https://github.com/botfront/botfront/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2020-11-05)


### Features

* add loop line menu ([7ab3758](https://github.com/botfront/botfront/commit/7ab3758944d8fec5deefdfd0a26e58c2f308be94))
* auto select new fragment title input ([266581c](https://github.com/botfront/botfront/commit/266581c3ffe0e0e7d09ada121a31cce8a3e740e8))
* generalize fragment linking behavior ([7bc41d5](https://github.com/botfront/botfront/commit/7bc41d57f8d2b8e26497f1ffe376859d772c0553))
* migration to rasa 2.0 story format ([8115307](https://github.com/botfront/botfront/commit/8115307e00bf0d1391b6c1e13aeb34dbf33c8c20))
* yaml mode ([bdfb6f0](https://github.com/botfront/botfront/commit/bdfb6f08a0e4b21ee9ef298db87366803b9a901c))


### Bug Fixes

* autofocus new response text ([1045b87](https://github.com/botfront/botfront/commit/1045b87242c36cfb6b0fde63926b8fd3f029e18d))
* fix broken canonical example logic ([6b3e810](https://github.com/botfront/botfront/commit/6b3e810970ebb603cc05a98630b7109ba64cd45a))

### [0.27.4](https://github.com/botfront/botfront/compare/v0.27.3...v0.27.4) (2020-11-03)


### Bug Fixes

* loading stuck on NLU screen  ([3825fd2](https://github.com/botfront/botfront/commit/3825fd2dc4a342ec6ddad0e7ed3feba8714adec7))

### [0.27.3](https://github.com/botfront/botfront/compare/v0.27.2...v0.27.3) (2020-10-29)


### Bug Fixes

* fix infinite scrolling stuck on Loading ([1946261](https://github.com/botfront/botfront/commit/1946261c76ab7cfedcf980c49468e3da38acfacd))
* redirect when login ([1191454](https://github.com/botfront/botfront/commit/11914541f67245af288689387b947c3bc14a7a46))

### [0.27.2](https://github.com/botfront/botfront/compare/v0.27.1...v0.27.2) (2020-10-28)


### Features

* augmentation factor setting ([b879eef](https://github.com/botfront/botfront/commit/b879eef6386503dc85fe9c30109894b04b1302d0))


### Bug Fixes

* return of confidence in NLU playground ([2823ff8](https://github.com/botfront/botfront/commit/2823ff888714cc8435fe447fbd97badf2aa50433))

### [0.27.1](https://github.com/botfront/botfront/compare/v0.27.0...v0.27.1) (2020-10-23)


### Features

* slightly better crash traces ([efd4174](https://github.com/botfront/botfront/commit/efd417400fbdbf835fd56eaaebc8c1a35f107103))


### Bug Fixes

* duckling entities and CRFExctractor ([a7fe180](https://github.com/botfront/botfront/commit/a7fe180b116724860451a831fb620bdcf72576ba))
* emojis in examples ([c48742a](https://github.com/botfront/botfront/commit/c48742a6c99b720f32696a9188c395238c231a02))
* endpoints saving when the document does not exist ([1e1d671](https://github.com/botfront/botfront/commit/1e1d67116d5316fe0f1e7ea4119a56f00d52cf82))
* import export changes ([2de21a7](https://github.com/botfront/botfront/commit/2de21a72ad80711d68270630217f33867f46902b))

## [0.27.0](https://github.com/botfront/botfront/compare/v0.26.0...v0.27.0) (2020-10-04)


### Features

* allow role and group for entities in training data ([6294dbc](https://github.com/botfront/botfront/commit/6294dbc206bc8eb2dcb310feb6ca650437d4516f))
* nlu regex  ([dd8e7ae](https://github.com/botfront/botfront/commit/dd8e7ae0ae99d79467e02ba53b6f0c78c1246281))
* unlimited training time ([0574df7](https://github.com/botfront/botfront/commit/0574df7bcaf8033f0b7f01ab85e8ba9aaf9bf488))


### Bug Fixes

* advanced entity editing not possible in data table ([f05f766](https://github.com/botfront/botfront/commit/f05f766b6046c15942ec3b8c8b832542af030754))
* auto redirect to login when logged out ([c96dd08](https://github.com/botfront/botfront/commit/c96dd08ee22350a58c181b77ebe7ebd9c371a486))
* bug with action popup disappearing onscroll ([c78861c](https://github.com/botfront/botfront/commit/c78861cb0fb476f4b9ae88aae1456bb7f714c4f8))
* concat story on branch delete  ([f9dbb5f](https://github.com/botfront/botfront/commit/f9dbb5fef8cbc3a3480edc749e05d24d7aa6ec99))
* new chitchat examples were not displayed in the examples table ([533b46c](https://github.com/botfront/botfront/commit/533b46c81d264d5ce885fb5ada6b6d7c1dfccfef))
* rasa domain import (backport) ([84a35a0](https://github.com/botfront/botfront/commit/84a35a0606b45c8107503e885fb745bde1395c94))

## [0.26.0](https://github.com/botfront/botfront/compare/v0.26.0-rc.3...v0.26.0) (2020-08-28)

## [0.26.0](https://github.com/botfront/botfront/compare/v0.26.0-rc.3...v0.26.0) (2020-08-28)

## [0.26.0-rc.3](https://github.com/botfront/botfront/compare/v0.26.0-rc.2...v0.26.0-rc.3) (2020-08-27)


### Bug Fixes

* prevent entities report crash when evaluation entities empty ([3e7471c](https://github.com/botfront/botfront/commit/3e7471c32fce01b3535d58ab2b114dd4c4167fdd))

## [0.26.0-rc.2](https://github.com/botfront/botfront/compare/v0.26.0-rc.1...v0.26.0-rc.2) (2020-08-24)


### Bug Fixes

* hide copyFrom in bot responses when there is only one language ([c3845d7](https://github.com/botfront/botfront/commit/c3845d7e0bb184b6c93cc5e4d5e49c58ca9afa2e))

## [0.26.0-rc.1](https://github.com/botfront/botfront/compare/v0.25.9...v0.26.0-rc.1) (2020-08-19)


### Features

* inter language responses ([9953d36](https://github.com/botfront/botfront/commit/9953d36d65a9c7954648001789bdf9170e41a9d9))
* routes for individual settings pages ([76d69ad](https://github.com/botfront/botfront/commit/76d69ad5bdcdee115f6e0fc120646951ad746aea))


### Bug Fixes

* display entity evaluation ([4de12cb](https://github.com/botfront/botfront/commit/4de12cb13f3809c020c26693e0e188df774fdbbb))
* do not save duckling entities ([03b9207](https://github.com/botfront/botfront/commit/03b9207ad7dae13a590dbe65a885688857dd3eb4))
* incoming bug when wrong default language in project ([81e6a4c](https://github.com/botfront/botfront/commit/81e6a4c126508e5d8af44aea3349ce5f18d70e31))
* pinned stories were not pinned at the top ([39f2b15](https://github.com/botfront/botfront/commit/39f2b15bc217378320d7a5197c0c31032ff6339c))

### [0.25.9](https://github.com/botfront/botfront/compare/v0.25.8...v0.25.9) (2020-08-06)


### Bug Fixes

* nlu was saved when clicking on menus when it shouldn't have ([81dbd3e](https://github.com/botfront/botfront/commit/81dbd3e7e7b1c104010133f55ae4b2165dcd51a5))
* **evaluation:** the value for f1 and recall were inverted ([c8b9a8c](https://github.com/botfront/botfront/commit/c8b9a8c22af823d8c31a9582c30162a702e369d4))
* activities with duckling entities ([44b86ef](https://github.com/botfront/botfront/commit/44b86ef6974c05737c0aa3df050c1f5d660507ef))

### [0.25.8](https://github.com/botfront/botfront/compare/v0.25.7...v0.25.8) (2020-07-29)


### Bug Fixes

* fixed training without selected story groups ([e0202a3](https://github.com/botfront/botfront/commit/e0202a3123509ec03b21d5614b40edb51b39921f))

### [0.25.7](https://github.com/botfront/botfront/compare/v0.25.6...v0.25.7) (2020-07-29)


### Features

* resize observer polyfill ([89bc547](https://github.com/botfront/botfront/commit/89bc54721bb7f179dd05aaf23a6409a7c53d9461))

### [0.25.6](https://github.com/botfront/botfront/compare/v0.25.5...v0.25.6) (2020-07-24)


### Bug Fixes

* dashboards are now exported/imported ([73165d5](https://github.com/botfront/botfront/commit/73165d508395e6f437b0417a46237340b949d950))
* fix slots not deleted because of missing projectId ([5c0c428](https://github.com/botfront/botfront/commit/5c0c4286770a096117356b115a6f69f806910180))
* stories with null body not importing ([b2d20e9](https://github.com/botfront/botfront/commit/b2d20e923b154ef2787fc173221c273652fae281))

### [0.25.5](https://github.com/botfront/botfront/compare/v0.25.4...v0.25.5) (2020-07-21)


### Bug Fixes

* crash when openning incoming ([5aeb4c3](https://github.com/botfront/botfront/commit/5aeb4c3bbed8069f986e859b6609e9409ce37a45))

### [0.25.5](https://github.com/botfront/botfront/compare/v0.25.4...v0.25.5) (2020-07-21)


### Bug Fixes

* crash when openning incoming ([5aeb4c3](https://github.com/botfront/botfront/commit/5aeb4c3bbed8069f986e859b6609e9409ce37a45))

### [0.25.5](https://github.com/botfront/botfront/compare/v0.25.4...v0.25.5) (2020-07-21)


### Bug Fixes

* crash when openning incoming ([5aeb4c3](https://github.com/botfront/botfront/commit/5aeb4c3bbed8069f986e859b6609e9409ce37a45))

### [0.25.5](https://github.com/botfront/botfront/compare/v0.25.4...v0.25.5) (2020-07-21)


### Bug Fixes

* crash when openning incoming ([5aeb4c3](https://github.com/botfront/botfront/commit/5aeb4c3bbed8069f986e859b6609e9409ce37a45))

### [0.25.4](https://github.com/botfront/botfront/compare/v0.25.3...v0.25.4) (2020-07-16)


### Bug Fixes

* check response names for wrong characters ([091c3fd](https://github.com/botfront/botfront/commit/091c3fd))
* search bar event listener leak ([3368c7f](https://github.com/botfront/botfront/commit/3368c7f))
* story search debouncing ([d06783b](https://github.com/botfront/botfront/commit/d06783b))



### [0.25.3](https://github.com/botfront/botfront/compare/v0.25.2...v0.25.3) (2020-07-14)


### Bug Fixes

* always display create intent in intent label ([5cb4729](https://github.com/botfront/botfront/commit/5cb4729))



### [0.25.2](https://github.com/botfront/botfront/compare/v0.25.1...v0.25.2) (2020-07-14)


### Bug Fixes

* add trigger intents to domain ([#652](https://github.com/botfront/botfront/issues/652)) ([e999ac6](https://github.com/botfront/botfront/commit/e999ac6))


### Features

* rename responses ([1f7c7d4](https://github.com/botfront/botfront/commit/1f7c7d4))



### [0.25.1](https://github.com/botfront/botfront/compare/v0.25.0...v0.25.1) (2020-07-01)


### Bug Fixes

* fix init payload for chat demo ([9676012](https://github.com/botfront/botfront/commit/9676012))
* story play buttons ([c346ed4](https://github.com/botfront/botfront/commit/c346ed4))


### Features

* actions project  ([c1de834](https://github.com/botfront/botfront/commit/c1de834))



## [0.25.0](https://github.com/botfront/botfront/compare/v0.25.0-rc.1...v0.25.0) (2020-06-29)


### Bug Fixes

* crash when form present in story ([79ecb6d](https://github.com/botfront/botfront/commit/79ecb6d))


### Features

* dev chatbot made shareable via a link ([3638dff](https://github.com/botfront/botfront/commit/3638dff))
* error page with report buttons ([d656c12](https://github.com/botfront/botfront/commit/d656c12))
* **cli:** replaced --no-mongo-auth with --enable-mongo-auth ([5b89af1](https://github.com/botfront/botfront/commit/5b89af1))



## [0.25.0-rc.1](https://github.com/botfront/botfront/compare/v0.24.3...v0.25.0-rc.1) (2020-06-17)


### Bug Fixes

* click on intent in dropdown had no effect in story visual editor ([c71f9de](https://github.com/botfront/botfront/commit/c71f9de))
* entity tagging by removing autofocus ([f57feda](https://github.com/botfront/botfront/commit/f57feda))
* hide publish switch ([ff30b76](https://github.com/botfront/botfront/commit/ff30b76))
* intent dropdown not clickable on canonical example ([c196994](https://github.com/botfront/botfront/commit/c196994))


### Features

* add option to erase existing data during import ([cf80335](https://github.com/botfront/botfront/commit/cf80335))
* new pipeline, policies ([a96bc81](https://github.com/botfront/botfront/commit/a96bc81))
* stories search de-select ([33ec116](https://github.com/botfront/botfront/commit/33ec116))



### [0.24.3](https://github.com/botfront/botfront/compare/v0.24.2...v0.24.3) (2020-06-04)


### Bug Fixes

* entity tagging in activity screen ([4bb335b](https://github.com/botfront/botfront/commit/4bb335b))



### [0.24.2](https://github.com/botfront/botfront/compare/v0.24.1...v0.24.2) (2020-06-02)


### Bug Fixes

* activity with entities ([e8c5ae3](https://github.com/botfront/botfront/commit/e8c5ae3))



### [0.24.1](https://github.com/botfront/botfront/compare/v0.24.0...v0.24.1) (2020-05-28)


### Bug Fixes

* updagraded rasa-for-botfront with disambiguation fix ([#617](https://github.com/botfront/botfront/issues/617)) ([3ad2a00](https://github.com/botfront/botfront/commit/3ad2a00))



## [0.24.0](https://github.com/botfront/botfront/compare/v0.24.0-beta.0...v0.24.0) (2020-05-27)


### Features

* batch reset intent ([#604](https://github.com/botfront/botfront/issues/604)) ([053d18c](https://github.com/botfront/botfront/commit/053d18c))
* quick reply and button bot responses ([3e27604](https://github.com/botfront/botfront/commit/3e27604))



## [0.24.0-beta.0](https://github.com/botfront/botfront/compare/v0.23.1...v0.24.0-beta.0) (2020-05-18)


### Bug Fixes

* nlu modal: add examples with no model trained ([cb19edd](https://github.com/botfront/botfront/commit/cb19edd))


### Features

* better usability of the incoming tab ([095c5db](https://github.com/botfront/botfront/commit/095c5db))


### Tests

* nlu edit: updating the displayed example ([7defcbd](https://github.com/botfront/botfront/commit/7defcbd))



### [0.23.1](https://github.com/botfront/botfront/compare/v0.23.0...v0.23.1) (2020-05-13)


### Bug Fixes

* merging duckling entities with other extractors ([a2d38d6](https://github.com/botfront/botfront/commit/a2d38d6))



## [0.23.0](https://github.com/botfront/botfront/compare/v0.23.0-rc.0...v0.23.0) (2020-05-06)


### Bug Fixes

* assumed error object structure ([879786e](https://github.com/botfront/botfront/commit/879786e))


### Features

* **import/export:** version check ([2ccf353](https://github.com/botfront/botfront/commit/2ccf353))



## [0.23.0-rc.0](https://github.com/botfront/botfront/compare/v0.22.2...v0.23.0-rc.0) (2020-05-05)


### Bug Fixes

* button type resolve ([ca80d75](https://github.com/botfront/botfront/commit/ca80d75))
* conversation parse safety ([4820de7](https://github.com/botfront/botfront/commit/4820de7))
* exclude rasa reserved actions from domain ([c53b387](https://github.com/botfront/botfront/commit/c53b387))
* ignore duplicate index violations during import ([5d43b77](https://github.com/botfront/botfront/commit/5d43b77))
* prevent examples without intent to be saved ([2f10e26](https://github.com/botfront/botfront/commit/2f10e26))
* story access safety in addlinkCheckpoints ([1dfda47](https://github.com/botfront/botfront/commit/1dfda47))
* support importing project without model ([c9154a1](https://github.com/botfront/botfront/commit/c9154a1))
* weird behaviour when deleting conversations ([4eba38a](https://github.com/botfront/botfront/commit/4eba38a))
* **cli:** invoking botfront in a non project folder crashes ([2885579](https://github.com/botfront/botfront/commit/2885579))


### Features

* **carousel:** initial commit ([22143b1](https://github.com/botfront/botfront/commit/22143b1))
* **qr buttons:** make buttons draggable & droppable ([e1bb09c](https://github.com/botfront/botfront/commit/e1bb09c))
* story editor: indicate re-used responses ([ea1ccec](https://github.com/botfront/botfront/commit/ea1ccec))


### Tests

* click to open response-in-use popup ([8e144b7](https://github.com/botfront/botfront/commit/8e144b7))
* response name popup ([0632425](https://github.com/botfront/botfront/commit/0632425))



### [0.22.2](https://github.com/botfront/botfront/compare/v0.22.1...v0.22.2) (2020-04-22)


### Bug Fixes

* missing environement field in the gql schema for trackerstore ([266d154](https://github.com/botfront/botfront/commit/266d154))



### [0.22.1](https://github.com/botfront/botfront/compare/v0.22.0-rc.2...v0.22.1) (2020-04-17)


### Bug Fixes

* deletion of unused bot responses ([982f73c](https://github.com/botfront/botfront/commit/982f73c))
* story search inconsistency ([9f3014c](https://github.com/botfront/botfront/commit/9f3014c))
* timezone support for conversation viewer ([1750fb4](https://github.com/botfront/botfront/commit/1750fb4))


### Tests

* multiple matches in stories search ([122dce9](https://github.com/botfront/botfront/commit/122dce9))
* unit tests for conversation transcript ([869dca1](https://github.com/botfront/botfront/commit/869dca1))



## [0.22.0](https://github.com/botfront/botfront/compare/v0.22.0-rc.2...v0.22.0) (2020-04-14)


### Bug Fixes

* deletion of unused bot responses ([982f73c](https://github.com/botfront/botfront/commit/982f73c))
* story search inconsistency ([9f3014c](https://github.com/botfront/botfront/commit/9f3014c))


### Tests

* multiple matches in stories search ([122dce9](https://github.com/botfront/botfront/commit/122dce9))



## [0.22.0-rc.2](https://github.com/botfront/botfront/compare/v0.22.0-rc.1...v0.22.0-rc.2) (2020-04-13)



## [0.22.0-rc.1](https://github.com/botfront/botfront/compare/v0.22.0-rc.0...v0.22.0-rc.1) (2020-04-10)


### Tests

* improve nlu_intentmessage.spec ([ff95942](https://github.com/botfront/botfront/commit/ff95942))



## [0.22.0-rc.0](https://github.com/botfront/botfront/compare/v0.21.4...v0.22.0-rc.0) (2020-04-09)


### Bug Fixes

*  story page crash after import ([b579b54](https://github.com/botfront/botfront/commit/b579b54))
* entity doubling in data parsed from rasa ([a45083a](https://github.com/botfront/botfront/commit/a45083a))
* handling of import response, ([a405766](https://github.com/botfront/botfront/commit/a405766))
* stories search algorithim ([9b787aa](https://github.com/botfront/botfront/commit/9b787aa))


### Features

* **visual story editor:** add option for new disjuncts ([c8468a2](https://github.com/botfront/botfront/commit/c8468a2))
* stories: NLU modal ([8e5f7e7](https://github.com/botfront/botfront/commit/8e5f7e7))
* user utterances container ([363dea5](https://github.com/botfront/botfront/commit/363dea5))


### Tests

* add tests for multiple disjuncts ([918307c](https://github.com/botfront/botfront/commit/918307c))
* stories: nlu editor ([c3b60b3](https://github.com/botfront/botfront/commit/c3b60b3))



### [0.21.4](https://github.com/botfront/botfront/compare/v0.22.0...v0.21.4) (2020-03-31)



### [0.21.3](https://github.com/botfront/botfront/compare/v0.21.2...v0.21.3) (2020-03-20)


### Bug Fixes

* mongo credentials are overwritten on update ([#520](https://github.com/botfront/botfront/issues/520)) ([84570e3](https://github.com/botfront/botfront/commit/84570e3))



### [0.21.2](https://github.com/botfront/botfront/compare/v0.21.1...v0.21.2) (2020-03-19)



### [0.21.1](https://github.com/botfront/botfront/compare/v0.21.0...v0.21.1) (2020-03-18)



## [0.21.0](https://github.com/botfront/botfront/compare/v0.20.3...v0.21.0) (2020-03-18)


### Bug Fixes

* duplicate story insertion bug ([83a063e](https://github.com/botfront/botfront/commit/83a063e))
* training with empty story groups ([120056b](https://github.com/botfront/botfront/commit/120056b))


### Features

* seach stories by title and content ([45be252](https://github.com/botfront/botfront/commit/45be252))
* **dnd tree:** better behavior ([b44ae15](https://github.com/botfront/botfront/commit/b44ae15))
* **dnd tree:** extract logic to hook ([5e25eca](https://github.com/botfront/botfront/commit/5e25eca))
* **dnd tree:** inline name editing ([e187633](https://github.com/botfront/botfront/commit/e187633))
* **dnd tree:** no ellipsis menu ([9295f85](https://github.com/botfront/botfront/commit/9295f85))
* **permalinks:** initial commit ([a307bf2](https://github.com/botfront/botfront/commit/a307bf2))
* dnd tree poc wip initial commit ([123ad0a](https://github.com/botfront/botfront/commit/123ad0a))


### Tests

* bot response indexing ([e968c49](https://github.com/botfront/botfront/commit/e968c49))



### [0.20.3](https://github.com/botfront/botfront/compare/v0.20.2...v0.20.3) (2020-03-12)


### Bug Fixes

* fix bug with linking ([46aa227](https://github.com/botfront/botfront/commit/46aa227))



### [0.20.2](https://github.com/botfront/botfront/compare/v0.20.1...v0.20.2) (2020-03-11)


### Features

* block non ascii chars in entities ([92dfda1](https://github.com/botfront/botfront/commit/92dfda1))
* display version number at the bottom of the sidebar ([5cb2fee](https://github.com/botfront/botfront/commit/5cb2fee))



### [0.20.2](https://github.com/botfront/botfront/compare/v0.20.1...v0.20.2) (2020-03-09)


### Features

* block non ascii chars in entities ([92dfda1](https://github.com/botfront/botfront/commit/92dfda1))
* display version number at the bottom of the sidebar ([5cb2fee](https://github.com/botfront/botfront/commit/5cb2fee))



### [0.20.1](https://github.com/botfront/botfront/compare/v0.20.0...v0.20.1) (2020-03-06)



## [0.20.0](https://github.com/botfront/botfront/compare/v0.20.0-rc.2...v0.20.0) (2020-03-05)



## [0.20.0-rc.2](https://github.com/botfront/botfront/compare/v0.20.0-rc.1...v0.20.0-rc.2) (2020-02-28)



## [0.20.0-rc.1](https://github.com/botfront/botfront/compare/v0.19.3...v0.20.0-rc.1) (2020-02-28)


### Bug Fixes

* axios with json was not logged ([f2dd10f](https://github.com/botfront/botfront/commit/f2dd10f))
* change of logging level ([bcf8daf](https://github.com/botfront/botfront/commit/bcf8daf))
* don't overwrite namespace on import ([#476](https://github.com/botfront/botfront/issues/476)) ([50976c6](https://github.com/botfront/botfront/commit/50976c6))
* fix undefined slot line showing as bad lines ([ee973fd](https://github.com/botfront/botfront/commit/ee973fd))
* unfeaturized slots can have initial value of any type ([4173ef0](https://github.com/botfront/botfront/commit/4173ef0))
* use latest_invent_time instead of updated at ([56d754d](https://github.com/botfront/botfront/commit/56d754d))


### Features

* graphql authentification for external consumers ([e37a3f9](https://github.com/botfront/botfront/commit/e37a3f9))
* **export:** export one md file per story group ([a8f05fe](https://github.com/botfront/botfront/commit/a8f05fe))
* **import:** import nlu data ([5a6fd40](https://github.com/botfront/botfront/commit/5a6fd40))
* **import:** upsert slots and responses ([07b9859](https://github.com/botfront/botfront/commit/07b9859))
* **import domain:** wip ([54b1caa](https://github.com/botfront/botfront/commit/54b1caa))
* **import rasa stories:** db-ready stories are generated ([1dc22e9](https://github.com/botfront/botfront/commit/1dc22e9))
* **import rasa stories:** log more import issues ([4bb8b19](https://github.com/botfront/botfront/commit/4bb8b19))
* **import rasa stories:** parse story file into intermediate format ([657dd1c](https://github.com/botfront/botfront/commit/657dd1c))
* **import rasa stories:** ux initial commit ([f75514c](https://github.com/botfront/botfront/commit/f75514c))
* **rasa export:** add export all languages option ([94ca4f5](https://github.com/botfront/botfront/commit/94ca4f5))
* add story group name in story export ([d267e20](https://github.com/botfront/botfront/commit/d267e20))
* collapse/expand all stories on doubleclick ([2214a3f](https://github.com/botfront/botfront/commit/2214a3f))


### Tests

* add test for language switch in vse ([5f5222b](https://github.com/botfront/botfront/commit/5f5222b))
* collapse all stories ([476a318](https://github.com/botfront/botfront/commit/476a318))
* edit a response while filtering responses ([80378ea](https://github.com/botfront/botfront/commit/80378ea))



### [0.19.3](https://github.com/botfront/botfront/compare/v0.19.2...v0.19.3) (2020-02-12)



### [0.19.2](https://github.com/botfront/botfront/compare/v0.19.1...v0.19.2) (2020-02-11)


### Bug Fixes

* it was not posible to have more than one entity in payload editor ([61cf096](https://github.com/botfront/botfront/commit/61cf096))
* **cli:** correct path in production Dockerfile for actions ([dd535a9](https://github.com/botfront/botfront/commit/dd535a9))
* metadata lost at import, add the metadata model in the api ([2728b58](https://github.com/botfront/botfront/commit/2728b58))


### Features

* trigger stories from the editor ([5bb73cd](https://github.com/botfront/botfront/commit/5bb73cd))
* **cli:** add a .gitignore file to project template ([65f7d84](https://github.com/botfront/botfront/commit/65f7d84))


### Tests

* fix custom response test ([#460](https://github.com/botfront/botfront/issues/460)) ([cf56b10](https://github.com/botfront/botfront/commit/cf56b10))
* responses in a new language ([2b7a70f](https://github.com/botfront/botfront/commit/2b7a70f))
* stories play button ([15b62f4](https://github.com/botfront/botfront/commit/15b62f4))



### [0.19.1](https://github.com/botfront/botfront/compare/v0.19.0...v0.19.1) (2020-01-23)


### Bug Fixes

* response form leaves a margin at the right of the modal ([#443](https://github.com/botfront/botfront/issues/443)) ([bd876d8](https://github.com/botfront/botfront/commit/bd876d8))



## [0.19.0](https://github.com/botfront/botfront/compare/v0.19.0-rc.0...v0.19.0) (2020-01-22)



## [0.19.0-rc.0](https://github.com/botfront/botfront/compare/v0.19.0-beta.0...v0.19.0-rc.0) (2020-01-21)


### Bug Fixes

* **activity insertion:** prevent populateActivity never returning ([b4dc07b](https://github.com/botfront/botfront/commit/b4dc07b))
* **activity logging:** use string ids ([8544d6f](https://github.com/botfront/botfront/commit/8544d6f))
* **cli:** major version upgrade + migration guide ([#445](https://github.com/botfront/botfront/issues/445)) ([94d21a8](https://github.com/botfront/botfront/commit/94d21a8))
* **conversation import:** new lang field location ([b349daf](https://github.com/botfront/botfront/commit/b349daf))


### Features

* **activity:** don't show spinner ([8ad22a5](https://github.com/botfront/botfront/commit/8ad22a5))
* **export:** add exclusion options to project export ([92cc546](https://github.com/botfront/botfront/commit/92cc546))



## [0.19.0-beta.0](https://github.com/botfront/botfront/compare/v0.19.0-alpha.6...v0.19.0-beta.0) (2020-01-20)


### Bug Fixes

* cannot edit project startup responses ([fad2eca](https://github.com/botfront/botfront/commit/fad2eca))
* deleteVariation fails if variation is focused ([b7262dd](https://github.com/botfront/botfront/commit/b7262dd))
* variations not saving ([9929a72](https://github.com/botfront/botfront/commit/9929a72))
* variations save on modal close ([ce040af](https://github.com/botfront/botfront/commit/ce040af))
* visual editor, always load first variation ([a5703bf](https://github.com/botfront/botfront/commit/a5703bf))


### Tests

* custom and image variations ([4f3e1d1](https://github.com/botfront/botfront/commit/4f3e1d1))
* edit image variations ([7cdf9ac](https://github.com/botfront/botfront/commit/7cdf9ac))
* first variation is shown in visual stories ([35cfd08](https://github.com/botfront/botfront/commit/35cfd08))
* fix custom bot response test ([7e6132b](https://github.com/botfront/botfront/commit/7e6132b))
* quick reply variations ([2ffe6af](https://github.com/botfront/botfront/commit/2ffe6af))
* variations ([133dd0d](https://github.com/botfront/botfront/commit/133dd0d))



## [0.19.0-alpha.6](https://github.com/botfront/botfront/compare/v0.19.0-alpha.5...v0.19.0-alpha.6) (2020-01-13)


### Bug Fixes

* utterance text missing in visual editor ([285fe29](https://github.com/botfront/botfront/commit/285fe29))


### Tests

* fix bot response consistency ([c3f4e26](https://github.com/botfront/botfront/commit/c3f4e26))
* fix bot response tests ([fa975be](https://github.com/botfront/botfront/commit/fa975be))
* fix bot_response + bot_response_consistency ([832d69d](https://github.com/botfront/botfront/commit/832d69d))
* fix bot_response_consistency tests ([715fa35](https://github.com/botfront/botfront/commit/715fa35))
* refactor bot response consistency ([0a9efa5](https://github.com/botfront/botfront/commit/0a9efa5))
* wait for save in custom bot response spec ([5ad290b](https://github.com/botfront/botfront/commit/5ad290b))



## [0.19.0-alpha.5](https://github.com/botfront/botfront/compare/v0.19.0-alpha.4...v0.19.0-alpha.5) (2020-01-09)


### Bug Fixes

* missing response content in visual editor ([439bbc4](https://github.com/botfront/botfront/commit/439bbc4))


### Features

* nlg in project default language if no language specified ([#418](https://github.com/botfront/botfront/issues/418)) ([e2ab647](https://github.com/botfront/botfront/commit/e2ab647))


### Tests

* response editor in visual editor ([9b60cb4](https://github.com/botfront/botfront/commit/9b60cb4))



## [0.19.0-alpha.4](https://github.com/botfront/botfront/compare/v0.19.0-alpha.3...v0.19.0-alpha.4) (2020-01-07)


### Bug Fixes

* botResponseEditor, prevent close on save ([a6ae54d](https://github.com/botfront/botfront/commit/a6ae54d))
* cannot close empty custom response ([edbfc1d](https://github.com/botfront/botfront/commit/edbfc1d))
* intent confidence alignment in conversations ([#417](https://github.com/botfront/botfront/issues/417)) ([ec8b8b3](https://github.com/botfront/botfront/commit/ec8b8b3))
* quick reply, select button intent ([2943a0b](https://github.com/botfront/botfront/commit/2943a0b))


### Tests

* add custom response via visual editor ([19c4bf4](https://github.com/botfront/botfront/commit/19c4bf4))
* expect error on responseEditor close ([71f1178](https://github.com/botfront/botfront/commit/71f1178))
* fix bot response test, fails to edit ([1ec4b5c](https://github.com/botfront/botfront/commit/1ec4b5c))



## [0.19.0-alpha.3](https://github.com/botfront/botfront/compare/v0.19.0-alpha.2...v0.19.0-alpha.3) (2020-01-07)


### Bug Fixes

* allow any type of ars in NLG endpoint to support forms ([#410](https://github.com/botfront/botfront/issues/410)) ([a2f6d5f](https://github.com/botfront/botfront/commit/a2f6d5f))
* metadata and delete icons remain visible ([#407](https://github.com/botfront/botfront/issues/407)) ([0ec6c18](https://github.com/botfront/botfront/commit/0ec6c18))
* story visual editor can't retrieve bot responses ([#415](https://github.com/botfront/botfront/issues/415)) ([083af1e](https://github.com/botfront/botfront/commit/083af1e))
* strip slashes when parsing and no model trained ([#412](https://github.com/botfront/botfront/issues/412)) ([6ad1f66](https://github.com/botfront/botfront/commit/6ad1f66))


### Features

* add forceOpen to metadata ([#413](https://github.com/botfront/botfront/issues/413)) ([f8a4a5c](https://github.com/botfront/botfront/commit/f8a4a5c))
* **cli:** mongo database security ([#406](https://github.com/botfront/botfront/issues/406)) ([7a711a7](https://github.com/botfront/botfront/commit/7a711a7))
* facebook messenger support ([#405](https://github.com/botfront/botfront/issues/405)) ([eeb7119](https://github.com/botfront/botfront/commit/eeb7119))



## [0.19.0-alpha.2](https://github.com/botfront/botfront/compare/v0.19.0-alpha.1...v0.19.0-alpha.2) (2020-01-04)


### Bug Fixes

* text should not be null in image payload ([6321efd](https://github.com/botfront/botfront/commit/6321efd))
* **cli:** docker-compose file must not be generated on project init ([#404](https://github.com/botfront/botfront/issues/404)) ([ce11213](https://github.com/botfront/botfront/commit/ce11213))



## [0.19.0-alpha.1](https://github.com/botfront/botfront/compare/v0.19.0-alpha.0...v0.19.0-alpha.1) (2020-01-03)


### Bug Fixes

* bug with utterance insertion in visual story editor ([#385](https://github.com/botfront/botfront/issues/385)) ([61605db](https://github.com/botfront/botfront/commit/61605db))
* enforce uniqueness of index in bot responses ([befe4fb](https://github.com/botfront/botfront/commit/befe4fb))
* language retrieval failure preventing activity logging ([8f215ba](https://github.com/botfront/botfront/commit/8f215ba))


### Features

* **cli:** improvements in version management and file generation ([#396](https://github.com/botfront/botfront/issues/396)) ([e2a9258](https://github.com/botfront/botfront/commit/e2a9258))
* **language selector:** make multiple selection possible ([#389](https://github.com/botfront/botfront/issues/389)) ([4dce052](https://github.com/botfront/botfront/commit/4dce052))
* **seq:** don't commit response unless actually changed ([2f04706](https://github.com/botfront/botfront/commit/2f04706))
* **seqs:** move resolved responses to state ([5d814dd](https://github.com/botfront/botfront/commit/5d814dd))
* **sequences:** context update function ([2ce2257](https://github.com/botfront/botfront/commit/2ce2257))
* **sequences:** new line logic ([cf760a6](https://github.com/botfront/botfront/commit/cf760a6))
* **sequences:** sequent delete logic ([3f1d3e2](https://github.com/botfront/botfront/commit/3f1d3e2))
* **sequences:** wip ([29df2b1](https://github.com/botfront/botfront/commit/29df2b1))
* **user id:** add user id to conversations ([e434d60](https://github.com/botfront/botfront/commit/e434d60))
* add a statistics page to training data ([#397](https://github.com/botfront/botfront/issues/397)) ([11786a5](https://github.com/botfront/botfront/commit/11786a5))
* ensure consistency between stories and responses ([#366](https://github.com/botfront/botfront/issues/366)) ([097211f](https://github.com/botfront/botfront/commit/097211f))
* **user id:** show user id in conversation viewer ([2d41018](https://github.com/botfront/botfront/commit/2d41018))
* images can be added to the story visual editor ([#401](https://github.com/botfront/botfront/issues/401)) ([866bb7f](https://github.com/botfront/botfront/commit/866bb7f))
* log conversation language too ([3a5e458](https://github.com/botfront/botfront/commit/3a5e458))


### Tests

* adapt canonical test to new intent label component ([e2c30f2](https://github.com/botfront/botfront/commit/e2c30f2))
* fix more tests ([62f0ec3](https://github.com/botfront/botfront/commit/62f0ec3))
* fix tests ([f494a00](https://github.com/botfront/botfront/commit/f494a00))
* stop overwriting endpoints with fixtures ([984572c](https://github.com/botfront/botfront/commit/984572c))



## [0.19.0-alpha.0](https://github.com/botfront/botfront/compare/v0.18.5...v0.19.0-alpha.0) (2019-12-19)


### Bug Fixes

* add entities in the NLU Playground ([9f5d2e3](https://github.com/botfront/botfront/commit/9f5d2e3))
* canonical popup alignment and style ([7df72e1](https://github.com/botfront/botfront/commit/7df72e1))
* change training status determination method ([9aa6e15](https://github.com/botfront/botfront/commit/9aa6e15))
* crash in incoming ([af33948](https://github.com/botfront/botfront/commit/af33948))
* default settings for development setup are incorrect ([#373](https://github.com/botfront/botfront/issues/373)) ([7a6add8](https://github.com/botfront/botfront/commit/7a6add8))
* deprecated parameter in context parse method ([b1969f4](https://github.com/botfront/botfront/commit/b1969f4))
* import project error message not displayed ([#348](https://github.com/botfront/botfront/issues/348)) ([0a049ce](https://github.com/botfront/botfront/commit/0a049ce))
* instantaneous chat answers ([3ed1695](https://github.com/botfront/botfront/commit/3ed1695))
* keep only allowed fields in activity insertion/reparse ([8704cd3](https://github.com/botfront/botfront/commit/8704cd3))
* meteor server setup up for graphQL subscriptions ([e2bb30e](https://github.com/botfront/botfront/commit/e2bb30e))
* mongo connection failure message ([f045af3](https://github.com/botfront/botfront/commit/f045af3))
* remember story group selection ([febf6ef](https://github.com/botfront/botfront/commit/febf6ef))
* **cli:** error when running the CLI outside a project folder ([#374](https://github.com/botfront/botfront/issues/374)) ([1f6a3f8](https://github.com/botfront/botfront/commit/1f6a3f8))
* wrong default API host in default-settings.docker-compose.dev.json ([5f932d6](https://github.com/botfront/botfront/commit/5f932d6))
* **cli:** selecting logs in the main menu crashes the CLI ([777670c](https://github.com/botfront/botfront/commit/777670c))


### Features

* add conversations mutations names ([913ade7](https://github.com/botfront/botfront/commit/913ade7))
* **cli:** show more relevant commands on botfront up ([b393e16](https://github.com/botfront/botfront/commit/b393e16))
* add graphQL schema for activity ([c846b6d](https://github.com/botfront/botfront/commit/c846b6d))
* add resolver for activity ([e30d3e2](https://github.com/botfront/botfront/commit/e30d3e2))
* add security layer to GraphQL API ([#368](https://github.com/botfront/botfront/issues/368)) ([b79684d](https://github.com/botfront/botfront/commit/b79684d))
* include intent confidence score in conversations viewer ([#358](https://github.com/botfront/botfront/issues/358)) ([5ffe46d](https://github.com/botfront/botfront/commit/5ffe46d))
* **activity:** batch reinterpret only visible items ([efd548b](https://github.com/botfront/botfront/commit/efd548b))
* mark any first example for an intent & entity combination canonical ([#356](https://github.com/botfront/botfront/issues/356)) ([5152d13](https://github.com/botfront/botfront/commit/5152d13))
* **actions:** rebuild action server on file change ([9724433](https://github.com/botfront/botfront/commit/9724433))
* **activity:** add sorting by confidence % ([87c18fe](https://github.com/botfront/botfront/commit/87c18fe))
* **activity:** attempt at optimistic rerendering ([7989b56](https://github.com/botfront/botfront/commit/7989b56))
* **activity:** use subscriptions instead of query ([1534c76](https://github.com/botfront/botfront/commit/1534c76))
* **data table:** add props for fixed w&h ([a6eadc4](https://github.com/botfront/botfront/commit/a6eadc4))
* **data table:** show header only if present, add fixedRows prop ([0d5dd34](https://github.com/botfront/botfront/commit/0d5dd34))
* **intent dropdown:** sort selected first ([d8f4f4b](https://github.com/botfront/botfront/commit/d8f4f4b))
* **intent label:** new intent label wip ([2c16be8](https://github.com/botfront/botfront/commit/2c16be8))
* **project context:** refresh intents and entities on mount ([#354](https://github.com/botfront/botfront/issues/354)) ([bc36c91](https://github.com/botfront/botfront/commit/bc36c91))


### Tests

* enable eslint no-undef ([858a8ce](https://github.com/botfront/botfront/commit/858a8ce))
* fix cypress tests ([5345fa6](https://github.com/botfront/botfront/commit/5345fa6))
* fix cypress tests ([9d980c7](https://github.com/botfront/botfront/commit/9d980c7))
* fix incoming tests ([e326e4c](https://github.com/botfront/botfront/commit/e326e4c))
* fix test, polyfill fromEntries ([621ea41](https://github.com/botfront/botfront/commit/621ea41))
* fix tests ([d837348](https://github.com/botfront/botfront/commit/d837348))
* fix the fix ([92b0176](https://github.com/botfront/botfront/commit/92b0176))
* persist working language ([b7cba07](https://github.com/botfront/botfront/commit/b7cba07))
* reintroduce qr postback button test ([c62817b](https://github.com/botfront/botfront/commit/c62817b))
* **activity:** update tests ([016a2c7](https://github.com/botfront/botfront/commit/016a2c7))
* remove incoming from redux language tests ([58b0544](https://github.com/botfront/botfront/commit/58b0544))
* removes callback might fix random bug ([65ea143](https://github.com/botfront/botfront/commit/65ea143))
* update selectors to new dataCy selectors ([a49073d](https://github.com/botfront/botfront/commit/a49073d))



### [0.18.5](https://github.com/botfront/botfront/compare/v0.18.4...v0.18.5) (2019-11-22)



### [0.18.4](https://github.com/botfront/botfront/compare/v0.18.3...v0.18.4) (2019-11-22)



### [0.18.3](https://github.com/botfront/botfront/compare/v0.18.2...v0.18.3) (2019-11-22)


### Bug Fixes

* display update warnings for bot sequences ([6974bc0](https://github.com/botfront/botfront/commit/6974bc0))
* export for Rasa: domain contains language information ([8330b23](https://github.com/botfront/botfront/commit/8330b23))


### Tests

* fixes visual edit tests  after removing sequences ([57f3748](https://github.com/botfront/botfront/commit/57f3748))



### [0.18.2](https://github.com/botfront/botfront/compare/v0.18.1...v0.18.2) (2019-11-18)


### Bug Fixes

* before/after each in convo tests ([e6f7fad](https://github.com/botfront/botfront/commit/e6f7fad))
* before/after each in convo tests ([94b2dde](https://github.com/botfront/botfront/commit/94b2dde))
* branch deletion in visual_branches test ([9d1bb6c](https://github.com/botfront/botfront/commit/9d1bb6c))
* clean up state before tests instead of after ([2ece10f](https://github.com/botfront/botfront/commit/2ece10f))
* conversation test needs to wait for rasa ([38985f1](https://github.com/botfront/botfront/commit/38985f1))
* duplicate keys after deleting branch ([ecbbea7](https://github.com/botfront/botfront/commit/ecbbea7))
* import delayed refresh causes test to fail ([1a1ebf1](https://github.com/botfront/botfront/commit/1a1ebf1))
* merge conversation changes from master ([bc4d091](https://github.com/botfront/botfront/commit/bc4d091))
* merge conversation changes from master ([1a740f6](https://github.com/botfront/botfront/commit/1a740f6))
* merge conversation pagination ([09c7d57](https://github.com/botfront/botfront/commit/09c7d57))
* nlu training button permanatly disabled ([03d85cd](https://github.com/botfront/botfront/commit/03d85cd))
* standeradize test steps to delete branches ([2852dbc](https://github.com/botfront/botfront/commit/2852dbc))
* training on linked stories ([4ade3a6](https://github.com/botfront/botfront/commit/4ade3a6))
* training state stuck in training after import ([46ab050](https://github.com/botfront/botfront/commit/46ab050))
* use importProject cypress command in tests ([568e212](https://github.com/botfront/botfront/commit/568e212))
* use importProject cypress command in tests ([63fb46a](https://github.com/botfront/botfront/commit/63fb46a))
* use withRouter for routing, func for get url ([a49cd47](https://github.com/botfront/botfront/commit/a49cd47))
* use withRouter for routing, func for get url ([e593a27](https://github.com/botfront/botfront/commit/e593a27))


### Features

* add cy.findCy command ([fe99ed5](https://github.com/botfront/botfront/commit/fe99ed5))
* remove reload in conversation tests ([0b3e55a](https://github.com/botfront/botfront/commit/0b3e55a))
* test deleting a branch in the visual editor ([4f1abdd](https://github.com/botfront/botfront/commit/4f1abdd))


### Tests

* nlu inference ([debec73](https://github.com/botfront/botfront/commit/debec73))



### [0.18.1](https://github.com/botfront/botfront/compare/v0.18.0...v0.18.1) (2019-11-12)



## [0.18.0](https://github.com/botfront/botfront/compare/v0.18.0-rc.2...v0.18.0) (2019-11-12)



## [0.18.0-rc.2](https://github.com/botfront/botfront/compare/v0.18.0-rc.1...v0.18.0-rc.2) (2019-11-12)



## [0.18.0-rc.1](https://github.com/botfront/botfront/compare/v0.18.0-rc.0...v0.18.0-rc.1) (2019-11-12)


### Tests

* improved reliability ([99dc70b](https://github.com/botfront/botfront/commit/99dc70b))



## [0.18.0-rc.0](https://github.com/botfront/botfront/compare/v0.17.2...v0.18.0-rc.0) (2019-11-11)


### Bug Fixes

* capitalize select a language ([54ad0d6](https://github.com/botfront/botfront/commit/54ad0d6))
* change conversations.specs to "...".spec ([d77747c](https://github.com/botfront/botfront/commit/d77747c))
* change to satisfy eslint prefer destructuring ([395c620](https://github.com/botfront/botfront/commit/395c620))
* conditions for updating redux story group ([ba11397](https://github.com/botfront/botfront/commit/ba11397))
* crach in incoming after import ([6247ca3](https://github.com/botfront/botfront/commit/6247ca3))
* deep links for conversation ([57c801a](https://github.com/botfront/botfront/commit/57c801a))
* delete conversation when deleting a project ([f4ea674](https://github.com/botfront/botfront/commit/f4ea674))
* dimensions in NLU statistics ([86d6e9c](https://github.com/botfront/botfront/commit/86d6e9c))
* enable rasa export ([c396375](https://github.com/botfront/botfront/commit/c396375))
* es lint warning for ++ operator ([ca8415f](https://github.com/botfront/botfront/commit/ca8415f))
* eslint and browser warnings ([f44bd4e](https://github.com/botfront/botfront/commit/f44bd4e))
* eslint issues ([bfb8b15](https://github.com/botfront/botfront/commit/bfb8b15))
* eslint warning, add a space ([5cbc42e](https://github.com/botfront/botfront/commit/5cbc42e))
* eslint warnings in conversationsBrowser ([6919671](https://github.com/botfront/botfront/commit/6919671))
* evaluation data when linking from incoming ([294d905](https://github.com/botfront/botfront/commit/294d905))
* export for rasa info message text ([21c03d0](https://github.com/botfront/botfront/commit/21c03d0))
* file download causes timeout in cypress tests ([e024ccb](https://github.com/botfront/botfront/commit/e024ccb))
* fixed rasa parsing in visual story editor ([#314](https://github.com/botfront/botfront/issues/314)) ([be97fe9](https://github.com/botfront/botfront/commit/be97fe9))
* import tests failing after visual story merge ([df0c43e](https://github.com/botfront/botfront/commit/df0c43e))
* link from activity evaluates wrong data ([ff67fb3](https://github.com/botfront/botfront/commit/ff67fb3))
* loose ends and tests ([c99570c](https://github.com/botfront/botfront/commit/c99570c))
* missing period in info message ([a35adb1](https://github.com/botfront/botfront/commit/a35adb1))
* names of export project test ([71f073c](https://github.com/botfront/botfront/commit/71f073c))
* nlu training button permanatly disabled ([77829cf](https://github.com/botfront/botfront/commit/77829cf))
* rasa X export explanation ([ef19cbd](https://github.com/botfront/botfront/commit/ef19cbd))
* story group redux selection random behaviour ([b7e40cd](https://github.com/botfront/botfront/commit/b7e40cd))
* style sort utterances dropdown ([4fc0f4d](https://github.com/botfront/botfront/commit/4fc0f4d))
* test finds an element before it is removed ([c84e0ff](https://github.com/botfront/botfront/commit/c84e0ff))
* testing link in export success message ([a1918c3](https://github.com/botfront/botfront/commit/a1918c3))
* train empty stories ([e2be980](https://github.com/botfront/botfront/commit/e2be980))
* training spec train button click failing ([2884b12](https://github.com/botfront/botfront/commit/2884b12))
* yaml extension must be yml ([f750728](https://github.com/botfront/botfront/commit/f750728))


### Features

*  loader does not show up if request fast (css anim) ([b68ea07](https://github.com/botfront/botfront/commit/b68ea07))
* add export for rasa ([ae11aee](https://github.com/botfront/botfront/commit/ae11aee))
* add export for rasa ([14ca3fe](https://github.com/botfront/botfront/commit/14ca3fe))
* add fields to conversation schema/resolver ([98f65eb](https://github.com/botfront/botfront/commit/98f65eb))
* add infor messages to rasa/rasaX export ([52ae84f](https://github.com/botfront/botfront/commit/52ae84f))
* add loading when switching ([e73302f](https://github.com/botfront/botfront/commit/e73302f))
* add missing fields to conversation resolvers/schema ([9d300b6](https://github.com/botfront/botfront/commit/9d300b6))
* add mutations for conversations ([875e99a](https://github.com/botfront/botfront/commit/875e99a))
* add popup for canonical examples ([af9f2e1](https://github.com/botfront/botfront/commit/af9f2e1))
* add possibility to toggle canonical on examples ([6d5f4fd](https://github.com/botfront/botfront/commit/6d5f4fd))
* add sort and filter to graphlql query ([a5bfb62](https://github.com/botfront/botfront/commit/a5bfb62))
* add tabs for the sections of incoming ([1487534](https://github.com/botfront/botfront/commit/1487534))
* connect required data to incoming tab ([984a764](https://github.com/botfront/botfront/commit/984a764))
* conversation analytics ([9850b4e](https://github.com/botfront/botfront/commit/9850b4e))
* conversation details fetching with graphQL ([2d3a0bf](https://github.com/botfront/botfront/commit/2d3a0bf))
* delete use grahpQL mutation ([2369097](https://github.com/botfront/botfront/commit/2369097))
* disable editing for canonical examples ([458888d](https://github.com/botfront/botfront/commit/458888d))
* disable trash when example is canonical ([b792284](https://github.com/botfront/botfront/commit/b792284))
* enable import and export tests ([2e84a81](https://github.com/botfront/botfront/commit/2e84a81))
* filtering switch for canonical examples ([0303444](https://github.com/botfront/botfront/commit/0303444))
* hide intents text if none, improve css ([7752e6c](https://github.com/botfront/botfront/commit/7752e6c))
* hide language selector on the conversation tab ([a0d6b9a](https://github.com/botfront/botfront/commit/a0d6b9a))
* hide subComponent on canonicals ([60c22fd](https://github.com/botfront/botfront/commit/60c22fd))
* incoming language now from redux ([1a49953](https://github.com/botfront/botfront/commit/1a49953))
* keep route when switching project ([308c1a8](https://github.com/botfront/botfront/commit/308c1a8))
* language in training data saved in redux ([42947cf](https://github.com/botfront/botfront/commit/42947cf))
* language selector in stories ! ([9fb8ef9](https://github.com/botfront/botfront/commit/9fb8ef9))
* link to evaluation from incoming ([9ff1568](https://github.com/botfront/botfront/commit/9ff1568))
* message when switching a canonical example ([b5d66e6](https://github.com/botfront/botfront/commit/b5d66e6))
* move activity to new page with conversations ([854893f](https://github.com/botfront/botfront/commit/854893f))
* nlu analytics with graphql ([3ba51ae](https://github.com/botfront/botfront/commit/3ba51ae))
* optimistic removes read markers ([c0b7e46](https://github.com/botfront/botfront/commit/c0b7e46))
* pagination for conversation ([5058643](https://github.com/botfront/botfront/commit/5058643))
* popups blocking editing when canonical ([ba272db](https://github.com/botfront/botfront/commit/ba272db))
* update conversation data on delete ([3091354](https://github.com/botfront/botfront/commit/3091354))
* use graphQL in conversation browser ([867a472](https://github.com/botfront/botfront/commit/867a472))
* use mutation for marking as read ([14609ad](https://github.com/botfront/botfront/commit/14609ad))
* **back to project settings:** ensure projectId set ([ffbccf7](https://github.com/botfront/botfront/commit/ffbccf7))
* **canonical examples:** sort by canonical status on train ([48cf643](https://github.com/botfront/botfront/commit/48cf643))
* **canonical examples:** sort by canonical status on train ([1efcd84](https://github.com/botfront/botfront/commit/1efcd84))
* **visual story editor:** initial commit ([511fe9a](https://github.com/botfront/botfront/commit/511fe9a))
* sort new utterances by date, new or old ([cf0269c](https://github.com/botfront/botfront/commit/cf0269c))


### Tests

* add build docs job ([396e777](https://github.com/botfront/botfront/commit/396e777))
* add cypress testing routines ([b1fd3e1](https://github.com/botfront/botfront/commit/b1fd3e1))
* add cypress tests ([78bf1a3](https://github.com/botfront/botfront/commit/78bf1a3))
* add tests for conversations ([527b394](https://github.com/botfront/botfront/commit/527b394))
* add tests for incoming tab ([16a0345](https://github.com/botfront/botfront/commit/16a0345))
* beforeEach deletes previous models ([fbe1bc6](https://github.com/botfront/botfront/commit/fbe1bc6))
* changes/improvement for previous modifications ([f21f67a](https://github.com/botfront/botfront/commit/f21f67a))
* enable videos ([bdfafdc](https://github.com/botfront/botfront/commit/bdfafdc))
* fix caching ([23338b9](https://github.com/botfront/botfront/commit/23338b9))
* fix caching ([3387d99](https://github.com/botfront/botfront/commit/3387d99))
* fix Examples test with canonical ([232fd72](https://github.com/botfront/botfront/commit/232fd72))
* fix order in test ([1529475](https://github.com/botfront/botfront/commit/1529475))
* fix previous commit ([b5011ba](https://github.com/botfront/botfront/commit/b5011ba))
* fix screenshot on failure ([b79a332](https://github.com/botfront/botfront/commit/b79a332))
* fixed new utterances test ([a92d89f](https://github.com/botfront/botfront/commit/a92d89f))
* fixes after rebase ([52521db](https://github.com/botfront/botfront/commit/52521db))
* force click ([a5dccc9](https://github.com/botfront/botfront/commit/a5dccc9))
* improve way to access icons, might fix tests on the ci ([fe3bacb](https://github.com/botfront/botfront/commit/fe3bacb))
* improved cypress tests stability ([4da626c](https://github.com/botfront/botfront/commit/4da626c))
* install chai for cypress ([1da716f](https://github.com/botfront/botfront/commit/1da716f))
* may fix failling test ([ecb2df2](https://github.com/botfront/botfront/commit/ecb2df2))
* might fix canonical switching test ([74745ce](https://github.com/botfront/botfront/commit/74745ce))
* potential tests fixes ([07f2fb1](https://github.com/botfront/botfront/commit/07f2fb1))
* re-enable test for rasa export ([4e40a85](https://github.com/botfront/botfront/commit/4e40a85))
* rename canonical tests ([85f2d85](https://github.com/botfront/botfront/commit/85f2d85))
* test for conversation paginations ([3e22113](https://github.com/botfront/botfront/commit/3e22113))
* test language dropdown in rasa export ([1a1db59](https://github.com/botfront/botfront/commit/1a1db59))
* uniqueness of canonical intent, value, entity ([1f90923](https://github.com/botfront/botfront/commit/1f90923))
* update ci vars ([e6b25df](https://github.com/botfront/botfront/commit/e6b25df))
* update to test non-edition on canonical ([91ff862](https://github.com/botfront/botfront/commit/91ff862))
* wait for sg to exist before navigating away ([8ee5aaa](https://github.com/botfront/botfront/commit/8ee5aaa))
* zip dir instead of tarball ([df45e58](https://github.com/botfront/botfront/commit/df45e58))



### [0.17.2](https://github.com/botfront/botfront/compare/v0.17.0...v0.17.2) (2019-10-30)


### Bug Fixes

* no response duplication ([384c096](https://github.com/botfront/botfront/commit/384c096))


### Features

* choose export option ([8087106](https://github.com/botfront/botfront/commit/8087106))


### Tests

* correct data cy ([ff6ff71](https://github.com/botfront/botfront/commit/ff6ff71))



## [0.17.0](https://github.com/botfront/botfront/compare/v0.17.0-rc.1...v0.17.0) (2019-10-26)



## [0.17.0-rc.1](https://github.com/botfront/botfront/compare/v0.17.0-rc.0...v0.17.0-rc.1) (2019-10-26)



## [0.17.0-rc.0](https://github.com/botfront/botfront/compare/v0.16.7...v0.17.0-rc.0) (2019-10-26)


### Bug Fixes

* missing stash files from the latest commit ([8b89667](https://github.com/botfront/botfront/commit/8b89667))


### Features

* add botfront api files ([a0513e6](https://github.com/botfront/botfront/commit/a0513e6))
* add support for cli arguments ([292a79f](https://github.com/botfront/botfront/commit/292a79f))


### Tests

* fix storygroup test ([03ebfc2](https://github.com/botfront/botfront/commit/03ebfc2))



### [0.16.7](https://github.com/botfront/botfront/compare/v0.16.6...v0.16.7) (2019-10-25)


### Tests

* fix story groups ([ae8c448](https://github.com/botfront/botfront/commit/ae8c448))



### [0.16.6](https://github.com/botfront/botfront/compare/v0.16.5...v0.16.6) (2019-10-25)



### [0.16.5](https://github.com/botfront/botfront/compare/v0.16.4...v0.16.5) (2019-10-25)


### Bug Fixes

* potential fix for the story exceptions ([46275e4](https://github.com/botfront/botfront/commit/46275e4))
* potential fix for the story group test not passing ([ce2414a](https://github.com/botfront/botfront/commit/ce2414a))
* removes popup presence checking ([ea5c4fd](https://github.com/botfront/botfront/commit/ea5c4fd))
* test destination story warning ([627eda1](https://github.com/botfront/botfront/commit/627eda1))


### Features

* widen the story name input field ([d037702](https://github.com/botfront/botfront/commit/d037702))


### Tests

* story exceptions fixes ([17e99c6](https://github.com/botfront/botfront/commit/17e99c6))
* storygroups test fixes ([#289](https://github.com/botfront/botfront/issues/289)) ([5d56479](https://github.com/botfront/botfront/commit/5d56479))
* udpated github action ([0e4d0d4](https://github.com/botfront/botfront/commit/0e4d0d4))



### [0.16.4](https://github.com/botfront/botfront/compare/v0.16.3-rc.1...v0.16.4) (2019-10-23)



### [0.16.4](https://github.com/botfront/botfront/compare/v0.16.3-rc.1...v0.16.4) (2019-10-22)



### [0.16.3-rc.1](https://github.com/botfront/botfront/compare/v0.16.3...v0.16.3-rc.1) (2019-10-20)


### Bug Fixes

* add check to ensure story is linked ([ef22a6a](https://github.com/botfront/botfront/commit/ef22a6a))
* change self link test for the cloud nuild ([477cd02](https://github.com/botfront/botfront/commit/477cd02))



### [0.16.3](https://github.com/botfront/botfront/compare/v0.16.2...v0.16.3) (2019-10-18)


### Bug Fixes

* add test triggering the bug ([27a7a09](https://github.com/botfront/botfront/commit/27a7a09))
* bug introduced with nlu import ([abd0b4b](https://github.com/botfront/botfront/commit/abd0b4b))
* can't fetch entities when an nlu example has no entities key ([f4d78c1](https://github.com/botfront/botfront/commit/f4d78c1))
* crash in NLU page after loading ([b559399](https://github.com/botfront/botfront/commit/b559399))
* css for rasa-webchat ([882d2b9](https://github.com/botfront/botfront/commit/882d2b9))
* destination stories don't trigger warnings if no intent ([2dd38a8](https://github.com/botfront/botfront/commit/2dd38a8))
* disabled api dependant tests ([bf4b73b](https://github.com/botfront/botfront/commit/bf4b73b))
* export test expects success msg on fail ([d644d07](https://github.com/botfront/botfront/commit/d644d07))
* fixed empty stories not training ([b55453d](https://github.com/botfront/botfront/commit/b55453d))
* force clicks on elements that may be hidden ([a695514](https://github.com/botfront/botfront/commit/a695514))
* test failing to find .popup when slow ([242f104](https://github.com/botfront/botfront/commit/242f104))
* use data-cy instead of class names ([8a64aca](https://github.com/botfront/botfront/commit/8a64aca))
* useEffect to update the group name on render ([4853ada](https://github.com/botfront/botfront/commit/4853ada))
* webchat on firefox ([c644d16](https://github.com/botfront/botfront/commit/c644d16))


### Features

* add option to export conversations ([f82ecee](https://github.com/botfront/botfront/commit/f82ecee))
* add test triggering the bug ([2e1dc3e](https://github.com/botfront/botfront/commit/2e1dc3e))
* export request optional and default settings ([6cfa259](https://github.com/botfront/botfront/commit/6cfa259))
* self link when a story has branches ([63d67e5](https://github.com/botfront/botfront/commit/63d67e5))
* test to self link on stories with branches ([c68969f](https://github.com/botfront/botfront/commit/c68969f))


### Tests

* fixed test for exceptions in story branches ([9f32c31](https://github.com/botfront/botfront/commit/9f32c31))
* porting error messages and export link url ([f5ce211](https://github.com/botfront/botfront/commit/f5ce211))



### [0.16.2](https://github.com/botfront/botfront/compare/v0.16.0-rc.13...v0.16.2) (2019-10-10)


### Bug Fixes

*  cognetive complexity in ExportProject ([90699d3](https://github.com/botfront/botfront/commit/90699d3))
* add import/export tests to ignoreTestFiles ([fb212b3](https://github.com/botfront/botfront/commit/fb212b3))
* add period to success message ([abfbfb0](https://github.com/botfront/botfront/commit/abfbfb0))
* capital API in error message ([8760e8f](https://github.com/botfront/botfront/commit/8760e8f))
* change slot name to a better name ([67de146](https://github.com/botfront/botfront/commit/67de146))
* code climate cognetive complexity ([60b8b65](https://github.com/botfront/botfront/commit/60b8b65))
* code climate complexity in ExportProject ([8a6bf74](https://github.com/botfront/botfront/commit/8a6bf74))
* code climate complexity in ImportProject ([b9d91ed](https://github.com/botfront/botfront/commit/b9d91ed))
* code climate complexity in ImportProject ([f9ffa2e](https://github.com/botfront/botfront/commit/f9ffa2e))
* code climate complexity in ImportProject ([57b1a75](https://github.com/botfront/botfront/commit/57b1a75))
* code climate complexity in ImportProject ([f13b1d2](https://github.com/botfront/botfront/commit/f13b1d2))
* cogenetive complexity in ExportProject ([88c01f7](https://github.com/botfront/botfront/commit/88c01f7))
* cognetive complexity in ExportProject ([3cbd3b9](https://github.com/botfront/botfront/commit/3cbd3b9))
* cognetive complexity in ExportProject ([f928a85](https://github.com/botfront/botfront/commit/f928a85))
* cognetive complextiy in ExportProject ([4362697](https://github.com/botfront/botfront/commit/4362697))
* cognitive complexity in ExportProject ([ef11501](https://github.com/botfront/botfront/commit/ef11501))
* force a refresh after importing a project ([c701e26](https://github.com/botfront/botfront/commit/c701e26))
* import project button alignment ([81d7031](https://github.com/botfront/botfront/commit/81d7031))
* import project tab crashing when opened ([9409901](https://github.com/botfront/botfront/commit/9409901))
* import/export error message text ([897aec8](https://github.com/botfront/botfront/commit/897aec8))
* import/export failing for medium+ projects ([7fe11f2](https://github.com/botfront/botfront/commit/7fe11f2))
* importProject codeclimate complexity ([24ccab4](https://github.com/botfront/botfront/commit/24ccab4))
* missing request settings for import request ([dd580b0](https://github.com/botfront/botfront/commit/dd580b0))
* prevent build from failing when slow ([e239cbe](https://github.com/botfront/botfront/commit/e239cbe))
* reduced length of exportProject method ([bed56b5](https://github.com/botfront/botfront/commit/bed56b5))
* remove importAgain button ([3e85bd1](https://github.com/botfront/botfront/commit/3e85bd1))
* remove timeout interval from export.methods ([cb183ce](https://github.com/botfront/botfront/commit/cb183ce))
* replace identical code code with utils ([dd5e243](https://github.com/botfront/botfront/commit/dd5e243))


### Features

* connect export ui to api ([cd288d2](https://github.com/botfront/botfront/commit/cd288d2))
* connect import UI to API ([23271f1](https://github.com/botfront/botfront/commit/23271f1))
* ui for Import and Export of a project ([b949f23](https://github.com/botfront/botfront/commit/b949f23))


### Tests

* import project and export project Ui tests ([b0106e7](https://github.com/botfront/botfront/commit/b0106e7))
* verify botfront project import ([cc05fbb](https://github.com/botfront/botfront/commit/cc05fbb))



## [0.16.0-rc.13](https://github.com/botfront/botfront/compare/v0.16.0-rc.12...v0.16.0-rc.13) (2019-10-09)


### Bug Fixes

* chitchat data not added ([1b7aeac](https://github.com/botfront/botfront/commit/1b7aeac))



## [0.16.0-rc.12](https://github.com/botfront/botfront/compare/v0.16.0-rc.10...v0.16.0-rc.12) (2019-10-08)


### Bug Fixes

* crash on null intent_evaluation result ([0444424](https://github.com/botfront/botfront/commit/0444424))
* fixed stories crashing after update ([760d01e](https://github.com/botfront/botfront/commit/760d01e))
* import of large nlu files ([e622a1c](https://github.com/botfront/botfront/commit/e622a1c))
* improve branching tab color ([ece007d](https://github.com/botfront/botfront/commit/ece007d))
* not complete comment ([d665519](https://github.com/botfront/botfront/commit/d665519))
* quick reply schema also add tests ([259bffc](https://github.com/botfront/botfront/commit/259bffc))
* remplace flat() so it is supported by electron ([b9ceac3](https://github.com/botfront/botfront/commit/b9ceac3))
* storyGroup deletion was not available after a unlinking ([03e373f](https://github.com/botfront/botfront/commit/03e373f))
* tagging of accentuated characters ([24becda](https://github.com/botfront/botfront/commit/24becda))
* wrong slot properties ([66df140](https://github.com/botfront/botfront/commit/66df140))
* **cli:** fixed docker-cli-js to 2.5.x ([a909ef4](https://github.com/botfront/botfront/commit/a909ef4))


### Features

* add ellipsis menu in place of story edit ([9b6b668](https://github.com/botfront/botfront/commit/9b6b668))
* add tests for story group deletion ([84c4bc5](https://github.com/botfront/botfront/commit/84c4bc5))
* check before storygroup deletion ([14180be](https://github.com/botfront/botfront/commit/14180be))
* component for each story group ([fb4b75b](https://github.com/botfront/botfront/commit/fb4b75b))
* storygroup deletion without checks ([a450ca3](https://github.com/botfront/botfront/commit/a450ca3))
* update tests to support new ellipsis menu ([cb3a98f](https://github.com/botfront/botfront/commit/cb3a98f))


### Tests

* removed useless scrolling test ([5d92d45](https://github.com/botfront/botfront/commit/5d92d45))



## [0.16.0-rc.11](https://github.com/botfront/botfront/compare/v0.16.0-rc.10...v0.16.0-rc.11) (2019-10-04)


### Bug Fixes

* **cli:** fixed docker-cli-js to 2.5.x ([a909ef4](https://github.com/botfront/botfront/commit/a909ef4))
* improve branching tab color ([ece007d](https://github.com/botfront/botfront/commit/ece007d))
* not complete comment ([d665519](https://github.com/botfront/botfront/commit/d665519))
* remplace flat() so it is supported by electron ([b9ceac3](https://github.com/botfront/botfront/commit/b9ceac3))


### Features

* add ellipsis menu in place of story edit ([9b6b668](https://github.com/botfront/botfront/commit/9b6b668))
* add tests for story group deletion ([84c4bc5](https://github.com/botfront/botfront/commit/84c4bc5))
* check before storygroup deletion ([14180be](https://github.com/botfront/botfront/commit/14180be))
* component for each story group ([fb4b75b](https://github.com/botfront/botfront/commit/fb4b75b))
* storygroup deletion without checks ([a450ca3](https://github.com/botfront/botfront/commit/a450ca3))
* update tests to support new ellipsis menu ([cb3a98f](https://github.com/botfront/botfront/commit/cb3a98f))



## [0.16.0-rc.10](https://github.com/botfront/botfront/compare/v0.16.0-rc.9...v0.16.0-rc.10) (2019-10-03)


### Bug Fixes

* checkpoint creation with linked stories ([00a4c23](https://github.com/botfront/botfront/commit/00a4c23))
* codeclimate similar code warning ([2bf176f](https://github.com/botfront/botfront/commit/2bf176f))
* codeclimate warnings ([0b067de](https://github.com/botfront/botfront/commit/0b067de))
* connected stories popup trigger behaviour ([a295e5a](https://github.com/botfront/botfront/commit/a295e5a))
* correction for the test story_exceptionsn3 ([0d89fb9](https://github.com/botfront/botfront/commit/0d89fb9))
* eslint warning ([25041f7](https://github.com/botfront/botfront/commit/25041f7))
* move Storylinker code to the StoryFooter ([283ff70](https://github.com/botfront/botfront/commit/283ff70))
* naming issues of css class for linking state ([919ee35](https://github.com/botfront/botfront/commit/919ee35))
* padding style for connected alert popup ([4bf3cef](https://github.com/botfront/botfront/commit/4bf3cef))
* reduce padding for story group title in popup ([93bd8ff](https://github.com/botfront/botfront/commit/93bd8ff))
* refactor codeclimate similar code ([eb0755b](https://github.com/botfront/botfront/commit/eb0755b))
* remove import of unexisting file in main.less ([6ec58d0](https://github.com/botfront/botfront/commit/6ec58d0))
* remove possibility to link a story to itself ([329b70e](https://github.com/botfront/botfront/commit/329b70e))
* remove usage of important in css ([6eb9070](https://github.com/botfront/botfront/commit/6eb9070))
* resolve eslint warnings ([479c50e](https://github.com/botfront/botfront/commit/479c50e))
* stop delete on branches with linked siblings ([0fb6351](https://github.com/botfront/botfront/commit/0fb6351))
* stop inherit checkpoints on story duplication ([f691fd5](https://github.com/botfront/botfront/commit/f691fd5))
* style for destination story popup ([176c6f3](https://github.com/botfront/botfront/commit/176c6f3))
* test on linking leaf stories ([979037f](https://github.com/botfront/botfront/commit/979037f))
* tests ([4543496](https://github.com/botfront/botfront/commit/4543496))
* use find insead of get to retreive descendent element ([929698d](https://github.com/botfront/botfront/commit/929698d))


### Features

* add disabled prop to the stories linker ([248bcb2](https://github.com/botfront/botfront/commit/248bcb2))
* add fields and methods to create checkpoints ([2b37ee4](https://github.com/botfront/botfront/commit/2b37ee4))
* add methods to removeCheckpoints ([67504e6](https://github.com/botfront/botfront/commit/67504e6))
* add tests for story linking ([29dded5](https://github.com/botfront/botfront/commit/29dded5))
* comments for addlinkCheckpoints ([cca459d](https://github.com/botfront/botfront/commit/cca459d))
* connect checkpoint data to frontend ([09501dc](https://github.com/botfront/botfront/commit/09501dc))
* function to add rasa checkpoints to linked stories ([d4f129b](https://github.com/botfront/botfront/commit/d4f129b))
* handle changing the link to a story ([3e466e5](https://github.com/botfront/botfront/commit/3e466e5))
* hide linking menu when linking is not possible ([530902d](https://github.com/botfront/botfront/commit/530902d))
* improves comments of the reccursiveSearch use to find a branchId ([340379e](https://github.com/botfront/botfront/commit/340379e))
* linked stories are used in rasa ([75360d1](https://github.com/botfront/botfront/commit/75360d1))
* list of stories in the story editor footer (link to) ([448a46a](https://github.com/botfront/botfront/commit/448a46a))
* popup for connected stories alert ([468191c](https://github.com/botfront/botfront/commit/468191c))
* popup for story is connected Popup ([68e570d](https://github.com/botfront/botfront/commit/68e570d))
* refactor code from StoryFooter to StoryEditorContainer ([9a23127](https://github.com/botfront/botfront/commit/9a23127))
* sort stories name in the linking dropdown ([2ce56f8](https://github.com/botfront/botfront/commit/2ce56f8))
* style for connected story top menu ([d409fd1](https://github.com/botfront/botfront/commit/d409fd1))
* style for ToolTipPopup ([e1c9d16](https://github.com/botfront/botfront/commit/e1c9d16))
* support state change linked or not linked ([c5932a5](https://github.com/botfront/botfront/commit/c5932a5))
* tests  for checkpoint creation of linked stories ([bbdc2fb](https://github.com/botfront/botfront/commit/bbdc2fb))
* tooltip popup when a story cannot be deleted ([9c9a854](https://github.com/botfront/botfront/commit/9c9a854))
* ui use backend to add a link to a story ([221e24c](https://github.com/botfront/botfront/commit/221e24c))
* update stories tests as you cannot link to a story itself ([232b3c5](https://github.com/botfront/botfront/commit/232b3c5))
* warning in story topMenu when connected ([ed4883e](https://github.com/botfront/botfront/commit/ed4883e))


### Tests

* add training test ([5af0174](https://github.com/botfront/botfront/commit/5af0174))
* fix dependencies ([e963951](https://github.com/botfront/botfront/commit/e963951))
* story delete buttons disable on linked ([0f32b05](https://github.com/botfront/botfront/commit/0f32b05))



## [0.16.0-rc.9](https://github.com/botfront/botfront/compare/v0.16.0-rc.8...v0.16.0-rc.9) (2019-09-26)


### Bug Fixes

* better error message for training ([bbf122c](https://github.com/botfront/botfront/commit/bbf122c))
* better errors for failed training ([92b4b2f](https://github.com/botfront/botfront/commit/92b4b2f))
* rename storiesLight to stories ([0b25ede](https://github.com/botfront/botfront/commit/0b25ede))
* templates for stories training ([1b16259](https://github.com/botfront/botfront/commit/1b16259))


### Features

* **default domain:** declare default domain in project settings ([#224](https://github.com/botfront/botfront/issues/224)) ([5b03ac5](https://github.com/botfront/botfront/commit/5b03ac5))
* all story of a projet are fetch in the StoryContainer ([bf619fa](https://github.com/botfront/botfront/commit/bf619fa))
* exclude services when starting ([78f73a8](https://github.com/botfront/botfront/commit/78f73a8))


### Tests

* fixed slot test ([0aeed0f](https://github.com/botfront/botfront/commit/0aeed0f))
* fixed unit tests for story traversal ([da50360](https://github.com/botfront/botfront/commit/da50360))



## [0.16.0-rc.8](https://github.com/botfront/botfront/compare/v0.16.0-rc.7...v0.16.0-rc.8) (2019-09-23)


### Bug Fixes

* fixed slots errors ([59f98ee](https://github.com/botfront/botfront/commit/59f98ee))


### Tests

* test that new slots are detected in stories ([920ce7e](https://github.com/botfront/botfront/commit/920ce7e))



## [0.16.0-rc.7](https://github.com/botfront/botfront/compare/v0.16.0-rc.6...v0.16.0-rc.7) (2019-09-13)



## [0.16.0-rc5](https://github.com/botfront/botfront/compare/v0.16.0-rc.4...v0.16.0-rc5) (2019-09-13)



## [0.16.0-rc.4](https://github.com/botfront/botfront/compare/v0.16.0-rc.3...v0.16.0-rc.4) (2019-09-11)


### Bug Fixes

* add empty branches to new stories ([582208a](https://github.com/botfront/botfront/commit/582208a))



## [0.16.0-rc.3](https://github.com/botfront/botfront/compare/v0.16.0-rc.2...v0.16.0-rc.3) (2019-09-11)



## [0.16.0-rc.2](https://github.com/botfront/botfront/compare/v0.16.0-rc.1...v0.16.0-rc.2) (2019-09-10)


### Bug Fixes

* adjust line height for story group menu items ([52185d7](https://github.com/botfront/botfront/commit/52185d7))
* alerts not removed if intro story deleted ([3898d83](https://github.com/botfront/botfront/commit/3898d83))
* crash in BranchTabLabel with old DataBases ([46d0c12](https://github.com/botfront/botfront/commit/46d0c12))
* extra character caused a crash on start ([292f498](https://github.com/botfront/botfront/commit/292f498))
* storyGroupMenu selected items are blue ([909dda2](https://github.com/botfront/botfront/commit/909dda2))
* the selected story group is blue ([c71a1b5](https://github.com/botfront/botfront/commit/c71a1b5))
* undefined bot responses preventing training ([1658daa](https://github.com/botfront/botfront/commit/1658daa))
* wrong default base_url in credentials ([8d3c28a](https://github.com/botfront/botfront/commit/8d3c28a))


### Features

* add icon indicators for story exceptions ([26ff2aa](https://github.com/botfront/botfront/commit/26ff2aa))
* add response context to StotyEditorContainer ([c0bdb40](https://github.com/botfront/botfront/commit/c0bdb40))
* add response context to StotyEditorContainer ([08fc2ed](https://github.com/botfront/botfront/commit/08fc2ed))
* exclude stories with errors from training ([bfccd22](https://github.com/botfront/botfront/commit/bfccd22))
* links to Spectrum in menu and docs ([d093604](https://github.com/botfront/botfront/commit/d093604))


### Tests

* add tests for exceptions in markdown ([4982ab9](https://github.com/botfront/botfront/commit/4982ab9))



## [0.16.0-rc.1](https://github.com/botfront/botfront/compare/v0.15.5...v0.16.0-rc.1) (2019-09-09)


### Bug Fixes

* adjust testing for new title save action ([f017cc7](https://github.com/botfront/botfront/commit/f017cc7))
* backwards compatibility for exceptions ([d3c8109](https://github.com/botfront/botfront/commit/d3c8109))
* bug indexing over string ([12d7967](https://github.com/botfront/botfront/commit/12d7967))
* bug on stories without branches in db ([06beece](https://github.com/botfront/botfront/commit/06beece))
* bug when deleting mother branch ([2519369](https://github.com/botfront/botfront/commit/2519369))
* change css so selected story group is blue ([e9b2217](https://github.com/botfront/botfront/commit/e9b2217))
* change from push to spreadsyntax for path ([357f8f0](https://github.com/botfront/botfront/commit/357f8f0))
* crash in BranchTabLabel with old DataBases ([6aa6e67](https://github.com/botfront/botfront/commit/6aa6e67))
* crashing in story utils with old DBs ([b306a70](https://github.com/botfront/botfront/commit/b306a70))
* exceptionAlerts warnings passed bad prop ([66f9071](https://github.com/botfront/botfront/commit/66f9071))
* fix the fix of the fix ([5ff8b24](https://github.com/botfront/botfront/commit/5ff8b24))
* manual rollback re add intent warning msg ([2208dc6](https://github.com/botfront/botfront/commit/2208dc6))
* new method of verifying default story test ([29b6b29](https://github.com/botfront/botfront/commit/29b6b29))
* remove console.log and es lint errors ([32a0206](https://github.com/botfront/botfront/commit/32a0206))
* remove unnecessary method call ([1647b13](https://github.com/botfront/botfront/commit/1647b13))
* standardize story title save + discard events ([452595f](https://github.com/botfront/botfront/commit/452595f))
* stop crash when creating new story group ([51391c0](https://github.com/botfront/botfront/commit/51391c0))
* story groups not deleting ([6158fc6](https://github.com/botfront/botfront/commit/6158fc6))
* typo ([9e3798d](https://github.com/botfront/botfront/commit/9e3798d))
* typo in docker compose template ([8bdde39](https://github.com/botfront/botfront/commit/8bdde39))
* wrong default base_url in credentials ([#201](https://github.com/botfront/botfront/issues/201)) ([b5835c3](https://github.com/botfront/botfront/commit/b5835c3))


### Features

* add a popup for story group exception alerts ([df29b22](https://github.com/botfront/botfront/commit/df29b22))
* add icon indicators for story exceptions ([37cd372](https://github.com/botfront/botfront/commit/37cd372))
* add StoryFooter component and StoryPathPopup ([84ad69e](https://github.com/botfront/botfront/commit/84ad69e))
* change story popup now shows full path ([6991ce8](https://github.com/botfront/botfront/commit/6991ce8))
* change wrap StoryFooter in Segment component ([6dd4a0a](https://github.com/botfront/botfront/commit/6dd4a0a))
* merge deleted stories ([a65068e](https://github.com/botfront/botfront/commit/a65068e))
* **branching:** "recursive" schema, update update method ([9988140](https://github.com/botfront/botfront/commit/9988140))
* **branching:** add new branch ([68521a8](https://github.com/botfront/botfront/commit/68521a8))
* **branching:** add story field to mock data ([444176c](https://github.com/botfront/botfront/commit/444176c))
* **offline templates:** error catching for missing templates ([a512d4b](https://github.com/botfront/botfront/commit/a512d4b))
* **offline templates:** full responses are exported with domain ([69a5e69](https://github.com/botfront/botfront/commit/69a5e69))
* collapsable stories ([10dbc7a](https://github.com/botfront/botfront/commit/10dbc7a))
* open first branches by default ([1b37c13](https://github.com/botfront/botfront/commit/1b37c13))
* persist branch path across application ([33e26b4](https://github.com/botfront/botfront/commit/33e26b4))
* **branch tab label:** es-lint, proptypes minor fix ([126a468](https://github.com/botfront/botfront/commit/126a468))
* **branching:** confirm deletion ([eb96c23](https://github.com/botfront/botfront/commit/eb96c23))
* **branching:** disallow two sibling branches from having same name ([bf5c2a7](https://github.com/botfront/botfront/commit/bf5c2a7))
* **branching:** integrate StoryFooter ([5b0566b](https://github.com/botfront/botfront/commit/5b0566b))
* add StoryFooter prop that hides continue ([243ca5e](https://github.com/botfront/botfront/commit/243ca5e))
* style story footer and remove warnings ([db700a7](https://github.com/botfront/botfront/commit/db700a7))
* styled story footer and branch+link buttons ([07f53d0](https://github.com/botfront/botfront/commit/07f53d0))
* **branching:** domain generation/story compilation ([70fcb3a](https://github.com/botfront/botfront/commit/70fcb3a))
* **branching:** hotfix for backsupport ([86f9af3](https://github.com/botfront/botfront/commit/86f9af3))
* **branching:** integrate tab labels ([9c9942d](https://github.com/botfront/botfront/commit/9c9942d))
* **branching:** make room for footer ([2eb5e67](https://github.com/botfront/botfront/commit/2eb5e67))
* **branching:** refactor, integrate with db ([8eb1a71](https://github.com/botfront/botfront/commit/8eb1a71))
* **branching:** remove fixture, fix behavior with branch-less branches ([4fa3abd](https://github.com/botfront/botfront/commit/4fa3abd))
* **branching:** switch active branch on deletion ([8e2c551](https://github.com/botfront/botfront/commit/8e2c551))
* **branching:** update extractDomainFromStories ([71fc936](https://github.com/botfront/botfront/commit/71fc936))
* add branch tab component for branch menu ([97c45d8](https://github.com/botfront/botfront/commit/97c45d8))
* add default story group on project insert ([2ca4cd7](https://github.com/botfront/botfront/commit/2ca4cd7))
* add warning when NLU can't be trained because of  n < 2 intents ([b47996a](https://github.com/botfront/botfront/commit/b47996a))
* refactor BranchTabLabel and style ([87f8d45](https://github.com/botfront/botfront/commit/87f8d45))
* **branching:** wip ([fe0d24d](https://github.com/botfront/botfront/commit/fe0d24d))


### Tests

* add story_title tests for saving discarding ([9276d08](https://github.com/botfront/botfront/commit/9276d08))
* add tests for story utils ([cdd550e](https://github.com/botfront/botfront/commit/cdd550e))
* added test for branches edge cases ([0f464b7](https://github.com/botfront/botfront/commit/0f464b7))
* branching ([ae5b893](https://github.com/botfront/botfront/commit/ae5b893))
* collapsable stories ([60f7c46](https://github.com/botfront/botfront/commit/60f7c46))
* confirm intro story group is not deleted ([026b58d](https://github.com/botfront/botfront/commit/026b58d))
* fixed tests ([248210c](https://github.com/botfront/botfront/commit/248210c))
* merging branches ([435fec1](https://github.com/botfront/botfront/commit/435fec1))
* move story_controller tests to mocha ([55ecb67](https://github.com/botfront/botfront/commit/55ecb67))
* new for add 3rd branch and delete branches ([dfb0eb5](https://github.com/botfront/botfront/commit/dfb0eb5))
* remove cypress test ([a865589](https://github.com/botfront/botfront/commit/a865589))
* story branches persistence ([187b602](https://github.com/botfront/botfront/commit/187b602))
* story-state-persistence ([73fb41d](https://github.com/botfront/botfront/commit/73fb41d))
* updated stories text for default story group ([d99ddbc](https://github.com/botfront/botfront/commit/d99ddbc))
* wrap component in environment ([6fefe62](https://github.com/botfront/botfront/commit/6fefe62))



### [0.15.5](https://github.com/botfront/botfront/compare/v0.15.4...v0.15.5) (2019-08-11)


### Bug Fixes

* should redirect to stories after setup ([9e1b7c4](https://github.com/botfront/botfront/commit/9e1b7c4))


### Features

* easier setup to develop against the docker-compose stack ([630171b](https://github.com/botfront/botfront/commit/630171b))
* faster sidebar transition ([051448c](https://github.com/botfront/botfront/commit/051448c))
* save current story group ([41d1f4e](https://github.com/botfront/botfront/commit/41d1f4e))



### [0.15.4](https://github.com/botfront/botfront/compare/v0.15.3...v0.15.4) (2019-07-31)


### Bug Fixes

* missing cloudbuild image update ([5185489](https://github.com/botfront/botfront/commit/5185489))
* set correct initial version in default model ([a2dd24c](https://github.com/botfront/botfront/commit/a2dd24c))


### Features

* **context-helper:** add entities and intent generation function ([ffecc52](https://github.com/botfront/botfront/commit/ffecc52))


### Tests

* add unit test for intent and entity extraction ([4b500e1](https://github.com/botfront/botfront/commit/4b500e1))
* fixed typos ([8025a2e](https://github.com/botfront/botfront/commit/8025a2e))



### [0.15.3](https://github.com/botfront/botfront/compare/v0.15.2...v0.15.3) (2019-07-26)


### Features

* **FloatingIconButton:** add color & size props ([f0060b2](https://github.com/botfront/botfront/commit/f0060b2))
* postinstall script starts botfront right after npm install ([7998c31](https://github.com/botfront/botfront/commit/7998c31))



### [0.15.2](https://github.com/botfront/botfront/compare/v0.15.1...v0.15.2) (2019-07-25)


### Bug Fixes

* **deps:** re-add react-syntax-highlighter ([3cf562c](https://github.com/botfront/botfront/commit/3cf562c))
* **utterance-viewer:** fix entity recall logic ([3beb473](https://github.com/botfront/botfront/commit/3beb473))


### Features

* **UtteranceInput:** add excludedTarget prop to exclude some blur triggers ([dff4587](https://github.com/botfront/botfront/commit/dff4587))


### Tests

* fix all cypress tests ([#135](https://github.com/botfront/botfront/issues/135)) ([78639b7](https://github.com/botfront/botfront/commit/78639b7))



### [0.15.1](https://github.com/botfront/botfront/compare/v0.15.0...v0.15.1) (2019-07-19)


### Bug Fixes

* **domain generation:** no hard coded action in domain ([#126](https://github.com/botfront/botfront/issues/126)) ([c205e31](https://github.com/botfront/botfront/commit/c205e31))
* **initalPayload:** removed bug where other stories were also present for initialPayload ([3c85144](https://github.com/botfront/botfront/commit/3c85144))
* uncompatible model version due to rasa-for-bf version ([#130](https://github.com/botfront/botfront/issues/130)) ([9eee0fb](https://github.com/botfront/botfront/commit/9eee0fb))
* **utterance-viewer:** Fix onChange and onDelete for utteranceviewer ([20be977](https://github.com/botfront/botfront/commit/20be977))


### Features

* **cli:** CLI suggests to update the npm package and to update projects ([#112](https://github.com/botfront/botfront/issues/112)) ([2fc3b7c](https://github.com/botfront/botfront/commit/2fc3b7c))
* **entity:** Add a generic entity component ([682edc3](https://github.com/botfront/botfront/commit/682edc3))
* **utterance-input:**  Add utterance input ([67e6615](https://github.com/botfront/botfront/commit/67e6615))
* **utterance-viewer:**  Add Intent, Entity, and UtteranceViewer component ([d0fadd1](https://github.com/botfront/botfront/commit/d0fadd1))
* **UtteranceInput:** add fluid prop ([a841be6](https://github.com/botfront/botfront/commit/a841be6))
* scripts to help with release automation ([#131](https://github.com/botfront/botfront/issues/131)) ([5559df4](https://github.com/botfront/botfront/commit/5559df4))
* unique slot names ([3a179ed](https://github.com/botfront/botfront/commit/3a179ed))


### Tests

* fix accessibility and slots test ([#125](https://github.com/botfront/botfront/issues/125)) ([035c1fc](https://github.com/botfront/botfront/commit/035c1fc))



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
