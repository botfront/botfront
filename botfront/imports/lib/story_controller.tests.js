import { expect } from 'chai';
import { safeLoad } from 'js-yaml';
import fs from 'fs';
import { Meteor } from 'meteor/meteor';
import { StoryController } from './story_controller';
import { extractDomain } from './story.utils';

const slots = [
    {
        name: 'feedback_value',
        type: 'categorical',
        categories: ['positive', 'negative'],
    },
];

const responses = {
    utter_valid: '',
    utter_valid_response: '',
    utter_noworries: '',
    utter_anything_else: '',
    utter_bye: '',
    utter_moreinformation: '',
    utter_ask_feedback: '',
    utter_great: '',
    utter_can_do: '',
    utter_docu: '',
    utter_thumbsup: '',
    utter_cantsignup: '',
    utter_ask_continue_newsletter: '',
    utter_response_why_email: '',
    utter_nohelp: '',
    utter_what_help: '',
    utter_not_sure: '',
    utter_possibilities: '',
    utter_react_positive: '',
    utter_react_negative: '',
};

const exceptionsGold = [
    { line: 1, code: 'have_intent' },
    { line: 1, code: 'action_name' },
    { line: 3, code: 'prefix' },
    { line: 4, code: 'prefix' },
    { line: 5, code: 'prefix' },
    { line: 6, code: 'prefix' },
    { line: 10, code: 'action_name' },
    { line: 11, code: 'invalid_char' },
    { line: 12, code: 'prefix' },
    { line: 13, code: 'prefix' },
    { line: 15, code: 'empty_intent' },
    { line: 16, code: 'prefix' },
    { line: 17, code: 'empty_intent' },
    { line: 17, code: 'intent' },
    { line: 22, code: 'invalid_char' },
    { line: 24, code: 'invalid_char' },
    { line: 25, code: 'empty_intent' },
    { line: 26, code: 'no_such_form' },
    { line: 27, code: 'form' },
    { line: 31, code: 'declare_form' },
    { line: 32, code: 'declare_form' },
    { line: 33, code: 'intent' },
];

const domainGoldYaml = `entities:
- name
- feedback_value
- email
intents:
- thank
- bye
- greet
- enter_data
- contact_sales
- feedback
- signup_newsletter
- affirm
- deny
- explain
- ask_whatspossible
- ask_weather
- react_positive
- react_negative
actions:
- utter_valid
- utter_valid_response
- utter_noworries
- utter_anything_else
- utter_bye
- utter_moreinformation
- utter_ask_feedback
- utter_great
- utter_can_do
- utter_docu
- utter_thumbsup
- utter_cantsignup
- utter_ask_continue_newsletter
- utter_response_why_email
- utter_nohelp
- utter_what_help
- utter_not_sure
- utter_possibilities
- utter_react_positive
- utter_react_negative
- action_greet_user
- action_chitchat
forms:
- sales_form
- subscribe_newsletter_form
responses:
  utter_valid: ''
  utter_valid_response: ''
  utter_noworries: ''
  utter_anything_else: ''
  utter_bye: ''
  utter_moreinformation: ''
  utter_ask_feedback: ''
  utter_great: ''
  utter_can_do: ''
  utter_docu: ''
  utter_thumbsup: ''
  utter_cantsignup: ''
  utter_ask_continue_newsletter: ''
  utter_response_why_email: ''
  utter_nohelp: ''
  utter_what_help: ''
  utter_not_sure: ''
  utter_possibilities: ''
  utter_react_positive: ''
  utter_react_negative: ''
slots:
  feedback_value:
    type: categorical
    values:
      - positive
      - negative`;

const domainGold = safeLoad(domainGoldYaml);

const defaultDomain = {
    actions: ['action_1', 'action_2'],
    slots: { slot_1: { type: 'unfeaturized' } },
    intents: ['intent1'],
    entities: ['entitiy1'],
};

const domainGoldWithDefault = {
    actions: [...defaultDomain.actions, ...domainGold.actions],
    slots: { ...defaultDomain.slots, ...domainGold.slots },
    intents: [...defaultDomain.intents, ...domainGold.intents],
    entities: [...defaultDomain.entities, ...domainGold.entities],
    responses: domainGold.responses,
    forms: domainGold.forms,
};


if (Meteor.isServer) {
    describe('extract domain from storyfile fixtures', function() {
        it('should output yaml matching the gold', function() {
            const storiesOne = fs.readFileSync('./assets/app/fixtures/stories_01.md', 'utf8');
            expect(safeLoad(extractDomain({
                stories: storiesOne.split('\n\n'), slots, responses,
            }))).to.be.deep.equal(domainGold);
        });
        it('should output yaml matching the gold with a default domain', function() {
            const storiesOne = fs.readFileSync('./assets/app/fixtures/stories_01.md', 'utf8');
            expect(safeLoad(extractDomain({
                stories: storiesOne.split('\n\n'), slots, responses, defaultDomain,
            })))
                .to.be.deep.equal(domainGoldWithDefault);
        });
        it('should output exceptions matching the gold', function() {
            const storiesTwo = fs.readFileSync('./assets/app/fixtures/stories_02.md', 'utf8');
            const val = new StoryController({ story: storiesTwo, slots });
            const exceptions = val.exceptions.map(exception => ({
                line: exception.line,
                code: exception.code,
            }));
            expect(exceptions).to.be.deep.equal(exceptionsGold);
        });
    });//
}
