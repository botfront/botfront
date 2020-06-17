import { expect } from 'chai';
import { MultilingualTemplateField } from './TemplateValuesField';

describe('Templates', () => {
    describe('Empty array', function () {
        it('should be empty', function () {
            const empty = MultilingualTemplateField.isEmpty([]);
            expect(empty).to.be.equal(true);
        });
    });
    
    describe('Array with empty object', function () {
        it('should be empty', function () {
            const empty = MultilingualTemplateField.isEmpty([{}]);
            expect(empty).to.be.equal(true);
        });
    });
    
    
    describe('Undefined', function () {
        it('should be empty', function () {
            const empty = MultilingualTemplateField.isEmpty(null);
            expect(empty).to.be.equal(true);
        });
    });
    
    describe('[{lang:xxx}]', function () {
        it('should not be empty', function () {
            const empty = MultilingualTemplateField.isEmpty([{ lang: 'en' }]);
            expect(empty).to.be.equal(false);
        });
    });
    
    describe('Addable languages', function () {
        const values = [{ lang: 'fr' }];
        it('should be the difference between the current template languages and the NLU languages', function () {
            const result = MultilingualTemplateField.getAddableLanguages(['en', 'fr', 'de'], values);
            expect(result).to.be.deep.equal(['en', 'de']);
        });
    
        it('should be empty if the all the NLU languages are already in the current template', function () {
            const result = MultilingualTemplateField.getAddableLanguages(['fr'], values);
            expect(result).to.be.deep.equal([]);
        });
    
        it('should not be empty if NLU languages are empty', function () {
            const result = MultilingualTemplateField.getAddableLanguages([], values);
            expect(result).to.be.deep.equal([]);
        });
    });
});
