

const chai = require('chai');
const expect = chai.expect;
chai.config.includeStack = true;

const { indexStory, indexBotResponse  } = require('../searchIndexing.utils')
const {storyFixture,
    textFixture,
    quickReplyFixture,
    customFixture,
    imageFixture} =  require ('./indexing.fixtures.js');



describe('## Story indexing', () => {
    it('should index the story', () => {
        const result = indexStory(storyFixture);
        expect(result).to.be.deep.equal({
            contents: 'hello \n helpOptions \n how_are_you \n mood positive \n utter_hello \n utter_tXd-Pm66 \n utter_Xywmv8uc \n utter_hwZIDQ5P \n utter_0H5XEC9h \n action_help \n mood',
            info: 'Welcome Story',
        });
    });
});


describe('## Bot response indexing', () => {
    it('should index a text response', () => {
        const result = indexBotResponse(textFixture);
        expect(result).to.be.equal('utter_Xywmv8uc\nHi i am great, how about you?\ngood! how are you?\nsava, et toi?');
    });
    it('should index a quick reply', () => {
        const result = indexBotResponse(quickReplyFixture);
        expect(result).to.be.equal('utter_tXd-Pm66\nyou can get help with the following:\nwebsite navigation\nnavigation_help\nI have a different question\nhttp://google.com');
    });
    it('should index a custom response', () => {
        const result = indexBotResponse(customFixture);
        expect(result).to.be.equal('utter_custom\ntest: true ');
    });
    it('should index a image response', () => {
        const result = indexBotResponse(imageFixture);
        expect(result).to.be.equal('utter_0H5XEC9h');
    });
});
