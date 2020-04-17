import { expect } from 'chai';
import { formatConversationInMd } from './utils';
import conversations from './utils.test.data.json';

const convoOneParsed = `# Conversation first_convo (Fri Aug 30 2019 16:36:45 GMT-0400)
## User Joe Bloe

* /get_started`;

const convoTwoParsed = `# Conversation second_convo (Fri Aug 30 2019 16:36:45 GMT-0400 - Fri Aug 30 2019 16:36:56 GMT-0400)

* /get_started
- Je suis prêt. Demandez une question.
* comment faire pour créer un chatbot?
- Facile!
  Regarde!
  [ http://botfront.io/image.png ]
- Cela répond à votre question ?
  <Oui> <Non>
* <Non>`;

if (Meteor.isClient) {
    describe('conversation formatting', function () {
        it('should format a one-turn conversation with userId', function () {
            expect(formatConversationInMd(conversations[0], -4)).to.be.equal(convoOneParsed);
        });
        it('should format a multi-turn conversation without userId', function () {
            expect(formatConversationInMd(conversations[1], -4)).to.be.equal(convoTwoParsed);
        });
    });
}
