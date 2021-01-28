/* eslint-disable no-undef */
describe('project creation', function () {
    beforeEach(function () {
        cy.createProject('bf', 'Duedix', 'fr');
        cy.visit('/login');
        cy.login();
    });

    afterEach(function () {
        cy.deleteProject('bf');
        cy.deleteProject('test');
        cy.deleteProject('test1');
    });

    it('should be possible to create and delete project', function () {
        cy.visit('/admin/projects');
        cy.wait(1000);
        cy.dataCy('new-project').click();
        cy.get('#uniforms-0000-0001').type('test');
        cy.get('#uniforms-0000-0003').type('bf-test');
        cy.get('#uniforms-0000-0004').click();
        cy.get('#uniforms-0000-0004')
            .children()
            .children()
            .first()
            .click();
        cy.get('#uniforms-0000-0006').type('test');
        cy.dataCy('submit-field').click();
        cy.location('href').should('match', /http:\/\/\w*:*[0-9]*\/admin\/projects/);
        cy.get(':nth-child(3) > .rt-tr > :nth-child(1)').should('have.text', 'test');
        cy.get(':nth-child(3) > .rt-tr > :nth-child(3) a').click();
        cy.location('href').should('match', /http:\/\/\w*:*[0-9]*\/admin\/project\/./);
        cy.dataCy('delete-project').should('be.disabled');
        cy.get('.ui > label').click();
        cy.dataCy('submit-field').click();
        cy.get(':nth-child(1) > .rt-tr > :nth-child(1)').eq(1).should('have.text', 'test');
        cy.get(':nth-child(1) > .rt-tr > :nth-child(3) a').click();
        cy.location('href').should('match', /http:\/\/\w*:*[0-9]*\/admin\/project\/./);
        cy.dataCy('delete-project').should('not.be.disabled');
        cy.dataCy('delete-project').click();
        cy.get('.primary').click();
        cy.get(':nth-child(3) > .rt-tr > :nth-child(1)').should('have.text', '\u00a0'); // \u00a0 is nbsp, the 'empty' value in the table
        cy.get(':nth-child(2) > .rt-tr > :nth-child(1)').should('have.text', 'Duedix');
        cy.get(':nth-child(1) > .rt-tr > :nth-child(1)').eq(1).should('have.text', 'Chitchat');
    });
});
