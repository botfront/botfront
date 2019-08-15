
/* eslint-disable no-undef */

describe('NLU Intent warning message displays', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'en');
    });

    beforeEach(function() {
        cy.visit('/login');
        cy.login();
    });

    after(function() {
        cy.deleteProject('bf');
        cy.logout();
    });

    it('Should add and delete multiple examples', function() {
        cy.visit('/project/bf/nlu/models');
        cy.get('.nlu-menu-training-data').click();
        cy.contains('Insert many').click();
        // check warning message exists
        cy.contains('You need at least two distinct intents to train NLU').should('exist');

        // create first intent
        cy.get('.batch-insert-input').type('cya\nlater');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('newintent{enter}');
        cy.get('[data-cy=save-button]').click();

        // timer required between batch saves
        cy.wait(1200);

        // create second intent
        cy.get('.batch-insert-input').type('hello\nhi guys');
        cy.get('.purple > .ui').click();
        cy.get('.purple > .ui > .search').type('intent1{enter}');
        cy.get('[data-cy=save-button]').click();

        // returns to the example tab
        cy.contains('Examples').click();

        // trains the NLU
        cy.get('[data-cy="train-button"]').click();
        cy.wait(1500);
        

        cy.contains('You need at least two distinct intents to train NLU').should('not.exist');
        
        // delete example
        cy.contains('hello')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);

        // delete example
        cy.contains('hi guys')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);

        // check warning message exists
        cy.contains('You need at least two distinct intents to train NLU').should('exist');

        // delete example
        cy.contains('cya')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);
        
        // delete example
        cy.contains('later')
            .closest('.rt-tr')
            .find('[data-cy=trash] .viewOnHover')
            .first()
            .click({ force: true });
        cy.wait(100);

        // check warning message exists
        cy.contains('You need at least two distinct intents to train NLU').should('exist');
    });
});
