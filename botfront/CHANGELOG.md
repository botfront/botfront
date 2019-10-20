# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
