import { expect } from 'chai';
import { safeLoad } from 'js-yaml';
import fs from 'fs';
import { Meteor } from 'meteor/meteor';
import { StoryController, extractDomain } from './story_controller';

const slots = [
    {
        name: 'feedback_value',
        type: 'categorical',
        categories: ['positive', 'negative'],
    },
];

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
    { line: 27, code: 'form' },
    { line: 31, code: 'declare_form' },
    { line: 32, code: 'declare_form' },
    { line: 33, code: 'intent' },
];

const domainGold = `entities:
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
- utter_fallback
- utter_default
- utter_noworries
- utter_anything_else
- utter_bye
- action_greet_user
- utter_moreinformation
- utter_ask_feedback
- utter_great
- utter_can_do
- utter_docu
- utter_thumbsup
- utter_cantsignup
- utter_ask_continue_newsletter
- action_deactivate_form
- utter_response_why_email
- utter_nohelp
- action_chitchat
- utter_what_help
- utter_not_sure
- utter_possibilities
- utter_react_positive
- utter_react_negative
forms:
- sales_form
- subscribe_newsletter_form
templates:
  utter_default: ''
  utter_fallback: ''
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
      - negative
  latest_response_name:
    type: unfeaturized
  followup_response_name:
    type: unfeaturized
  parse_data:
    type: unfeaturized`;

if (Meteor.isServer) {
    describe('extract domain from storyfile fixtures', function() {
        it('should output yaml matching the gold', function() {
            const storiesOne = fs.readFileSync('./assets/app/fixtures/stories_01.md', 'utf8');
            expect(safeLoad(extractDomain(storiesOne.split('\n\n'), slots))).to.be.deep.equal(safeLoad(domainGold));
        });
        it('should output exceptions matching the gold', function() {
            const storiesTwo = fs.readFileSync('./assets/app/fixtures/stories_02.md', 'utf8');
            const val = new StoryController(storiesTwo, slots);
            const exceptions = val.exceptions.map(exception => ({
                line: exception.line,
                code: exception.code,
            }));
            expect(exceptions).to.be.deep.equal(exceptionsGold);
        });
    });//
}
