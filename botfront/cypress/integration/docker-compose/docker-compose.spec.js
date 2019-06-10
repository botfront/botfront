/* eslint-disable no-undef */

describe('Project Credentials', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('Endpoints', function() {
        it('Endpoints should not be empty', function() {
            cy.visit(`/project/${this.bf_project_id}/settings`);
            cy.contains('Endpoints').click();
            cy.get('.ace_content').eq(0)
                .invoke('text')
                .then((text) => {
                    expect(text).to.not.equal('');
                });
        });
    });

    after(function() {
    });
});
