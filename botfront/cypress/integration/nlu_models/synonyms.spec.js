/* global cy:true */
const synonymName = 'growth';
const synonymValues = 'raise, increase, augmentation';
const sortedSynonymsValues = 'augmentation, increase, raise';

const visitSynonyms = (projectId) => {
    cy.visit(`/project/${projectId}/nlu/models`);
    cy.contains('Training Data').click();
    cy.contains('Synonyms').click();
};

const getSynonymRow = () => cy.contains(sortedSynonymsValues).closest('.rt-tr');

describe('synonym', function() {
    before(function() {
        cy.createProject('bf', 'My Project', 'fr');
    });


    after(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('adding a synonym', function() {
        it('should create a synonym with supplied parameters', function() {
            visitSynonyms('bf');
            cy.get('.input.lookup-table-key-input input').type(synonymName);
            cy.contains('Add').should('have.class', 'disabled');
            cy.get('textarea.lookup-table-values').type(`${synonymValues},{backspace},,`);
            cy.get('textarea.lookup-table-values').should('have.value', `${synonymValues}, , `);
            cy.contains('Add').click();
            getSynonymRow()
                .children()
                .first()
                .should('contain', synonymName);
            getSynonymRow()
                .children()
                .eq(1)
                .should('contain', sortedSynonymsValues);
        });
    });

    describe('editing a synonym', function() {
        it('should edit the synonym values', function() {
            visitSynonyms('bf');
            getSynonymRow()
                .children()
                .eq(1)
                .click();
            getSynonymRow()
                .children()
                .eq(1)
                .find('textarea')
                .type('{end}{del},,');
            cy.contains('Synonyms').click();
            getSynonymRow()
                .children()
                .eq(1)
                .should('contain', sortedSynonymsValues);
        });

        it('should remove the values and fail removing it without crashing', function() {
            visitSynonyms('bf');
            getSynonymRow()
                .children()
                .eq(1)
                .click();
            getSynonymRow()
                .children()
                .eq(1)
                .find('textarea')
                .type('{selectAll}{del}');
            // we click elsewhere to end the editing
            cy.contains('Synonyms').click();
            getSynonymRow()
                .children()
                .eq(1)
                .should('contain', sortedSynonymsValues);

            getSynonymRow()
                .children()
                .first()
                .click();
            getSynonymRow()
                .children()
                .first()
                .find('input')
                .type('{selectAll}{del}');
            // we click elsewhere to end the editing
            cy.contains('Synonyms').click();
            getSynonymRow()
                .children()
                .first()
                .should('contain', synonymName);
        });
    });

    describe('deleting Synonyms', function() {
        it('should delete the created synonym', function() {
            visitSynonyms('bf');
            getSynonymRow()
                .findCy('icon-trash')
                .click({ force: true });
            cy.get('body').should('not.contain', sortedSynonymsValues);
            cy.contains(sortedSynonymsValues).should('not.exist');
        });
    });
});
