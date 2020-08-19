/* global cy expect:true */

describe('NLU Batch Insert', function() {
    beforeEach(() => {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => cy.login());
    });
    afterEach(() => {
        cy.logout();
        cy.deleteProject('bf');
    });

    it('Should add and delete multiple examples', function() {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\ncoucou\nsalut');
        cy.dataCy('intent-label')
            .click({ force: true })
            .type('intent1{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.dataCy('icon-gem', null, '.active').click();
        cy.contains('hello')
            .closest('.rt-tr')
            .findCy('icon-trash')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.contains('coucou')
            .closest('.rt-tr')
            .findCy('icon-trash')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.contains('salut')
            .closest('.rt-tr')
            .findCy('icon-trash')
            .first()
            .click({ force: true });
        cy.get('[data-cy=trash]').should('not.exist');
    });
});

describe('NLU Synonyms', function() {
    beforeEach(function() {
        cy.login();
        cy.visit('/')
            // .then(() => cy.deleteProject('bf'))
            .then(() => cy.createProject('bf', 'My Project', 'fr'));
    });

    afterEach(function() {
        cy.deleteProject('bf');
    });

    it('Should add, edit, delete synonyms', function() {
        cy.visit('/project/bf/nlu/models');
        cy.dataCy('nlu-menu-training-data').click();
        cy.contains('Synonyms').click();
        // Add a synonym
        cy.get('.entity-synonym  > input').type('value');
        cy.get('.entity-synonym-values').type('synonym1,synonym2,synonym3');
        cy.get('.entity-synonym-save-button').click();
        cy.get(':nth-child(1) > .rt-tr > .lookup-value > div > p').should(($p) => {
            expect($p.first()).to.contain('value');
        });
        cy.get(':nth-child(1) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').should(($p) => {
            expect($p.first()).to.contain('synonym1, synonym2, synonym3');
        });
        cy.get(':nth-child(1) > .rt-tr > .lookup-value > div > p').click();
        cy.get(':nth-child(1) > .rt-tr > .lookup-value > div input').type('value2');
        
        // click outside
        cy.get('[data-cy=example-text-editor-input]').click();
        cy.get(':nth-child(1) > .rt-tr > .lookup-value > div > p').should(($p) => {
            expect($p.first()).to.contain('valuevalue2');
        });
        
        cy.get(':nth-child(1) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').click();
        cy.get(':nth-child(1) > .rt-tr > .lookup-list > :nth-child(1) > div textarea').type('{end},synonym4');
        // click outside
        cy.get('[data-cy=example-text-editor-input]').click();
        cy.get(':nth-child(1) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').should(($p) => {
            expect($p.first()).to.contain('synonym1, synonym2, synonym3, synonym4');
        });
        
        // Add another synonym
        cy.get('.entity-synonym  > input').type('value3');
        cy.get('.entity-synonym  > input').should('have.value', 'value3');
        cy.get('.entity-synonym-values').type('{end}synonym5,synonym6,synonym7');
        cy.get('.entity-synonym-values').should('have.value', 'synonym5, synonym6, synonym7');

        cy.get('.entity-synonym-save-button').click();
        cy.get(':nth-child(2) > .rt-tr > .lookup-value > div > p').should(($p) => {
            expect($p.first()).to.contain('value3');
        });
        cy.get(':nth-child(2) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').should(($p) => {
            expect($p.first()).to.contain('synonym5, synonym6, synonym7');
        });

        // Delete first synonym
        cy.get(':nth-child(1) > .rt-tr')
            .findCy('icon-trash')
            .click({ force: true });
        // verify it's deleted
        cy.get(':nth-child(1) > .rt-tr > .lookup-value > div > p').should(($p) => {
            expect($p.first()).to.contain('value3');
        });

        cy.get(':nth-child(1) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').should(($p) => {
            expect($p.first()).to.contain('synonym5, synonym6, synonym7');
        });

        // Delete the remaining synonym
        cy.get(':nth-child(1) > .rt-tr')
            .findCy('icon-trash')
            .click({ force: true });
    });
});
