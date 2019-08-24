/* eslint-disable no-undef */

describe('NLU Batch Insert', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });

    beforeEach(function() {
        cy.visit('/login');
        cy.login();
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('Should add and delete multiple examples', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        cy.get('.batch-insert-input').type('hello\ncoucou\nsalut');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intent1{enter}');
        cy.get('[data-cy=save-button]').click();
        cy.contains('Examples').click();
        cy.contains('hello')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.contains('coucou')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);
        cy.contains('salut')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.get('[data-cy=trash]').should('not.exist');
    });
});

describe('NLU Synonyms', function() {
    beforeEach(function() {
        cy.login();
    });

    before(function() {
        cy.visit('/')
            // .then(() => cy.deleteProject('bf'))
            .then(() => cy.createProject('bf', 'My Project', 'fr'))
    });

    after(function() {
        cy.deleteProject('bf');
    });

    it('Should add, edit, delete synonyms', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
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
        cy.get('.entity-synonym-values').type('{end}synonym5,synonym6,synonym7');
        cy.get('.entity-synonym-save-button').click();
        cy.get(':nth-child(2) > .rt-tr > .lookup-value > div > p').should(($p) => {
            expect($p.first()).to.contain('value3');
        });
        cy.get(':nth-child(2) > .rt-tr > .lookup-list > :nth-child(1) > div > .ellipsis').should(($p) => {
            expect($p.first()).to.contain('synonym5, synonym6, synonym7');
        });

        // Delete first synonym
        cy.get(':nth-child(1) > .rt-tr')
            .find('[data-cy=trash] .viewOnHover')
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
            .find('[data-cy=trash] .viewOnHover')
            .click({ force: true });
    });
});
