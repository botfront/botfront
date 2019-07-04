/* eslint-disable no-undef */
const modelName = 'myModel';
const synonymName = 'growth';
const synonymValues = 'raise, increase, augmentation';
const sortedSynonymsValues = 'augmentation, increase, raise';
let modelId = '';

const visitSynonyms = (projectId) => {
    cy.visit(`/project/${projectId}/nlu/model/${modelId}`);
    cy.contains('Training Data').click();
    cy.contains('Synonyms').click();
};

const getSynonymRow = () => cy.contains(sortedSynonymsValues).closest('.rt-tr');

describe('synonym', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(
                id,
                modelName,
                'fr',
                'my nlu tagging testing model',
            ).then((result) => {
                modelId = result;
            });
        });
    });

    beforeEach(function() {
        cy.login();
    });

    afterEach(function() {
        cy.logout();
    });

    describe('adding a synonym', function() {
        it('should create a synonym with supplied parameters', function() {
            visitSynonyms(this.bf_project_id);
            cy.get('.input.entity-synonym input').type(synonymName);
            cy.contains('Add').should('have.class', 'disabled');
            cy.get('textarea.entity-synonym-values').type(`${synonymValues},{backspace},,`);
            cy.get('textarea.entity-synonym-values').should('have.value', `${synonymValues}, , `);
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
            visitSynonyms(this.bf_project_id);
            getSynonymRow()
                .children()
                .eq(1)
                .click();
            getSynonymRow()
                .children()
                .eq(1)
                .find('textarea')
                .type('{del},,');
            cy.contains('Synonyms').click();
            getSynonymRow()
                .children()
                .eq(1)
                .should('contain', sortedSynonymsValues);
        });

        it('should remove the values and fail removing it without crashing', function() {
            visitSynonyms(this.bf_project_id);
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
            visitSynonyms(this.bf_project_id);
            getSynonymRow()
                .find('[data-cy=trashbin] .viewOnHover')
                .click({ force: true });
            cy.get('body').should('not.contain', sortedSynonymsValues);
            cy.contains(sortedSynonymsValues).should('not.exist');
            cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
        });
    });
});
