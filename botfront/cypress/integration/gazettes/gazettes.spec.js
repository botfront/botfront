/* eslint-disable no-undef */
const modelName = 'myModel';
const gazetteName = 'growth';
const gazetteValues = 'raise, increase, augmentation';
const sortedGazetteValues = 'augmentation, increase, raise';

const visitGazette = (projectId, modelId) => {
    cy.visit(`/project/${projectId}/nlu/model/${modelId}`);
    cy.contains('Training Data').click();
    cy.contains('Gazette').click();
};
let modelId = '';
const getGazetteRow = () => cy.contains(sortedGazetteValues).closest('.rt-tr');

describe('gazette', function() {
    before(function() {
        cy.login();
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.get('@bf_project_id').then((id) => {
            cy.createNLUModelProgramatically(id, modelName, 'fr', 'my description')
                .then((result) => {
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

    after(function() {
        cy.login();
        cy.deleteNLUModelProgramatically(null, this.bf_project_id, 'fr');
        cy.logout();
    });

    
    describe('adding a gazette', function() {
        it('should create a gazette with supplied parameters', function() {
            visitGazette(this.bf_project_id, modelId);
            cy.get('.input.entity-synonym input').type(gazetteName);
            cy.get('textarea.entity-synonym-values').type(gazetteValues);
            cy.contains('Add').click();
            getGazetteRow()
                .children()
                .first()
                .should('contain', gazetteName);
            getGazetteRow()
                .children()
                .eq(1)
                .should('contain', sortedGazetteValues);
        });
    });

    describe('editing a gazette', function() {
        it('should change gazette mode', function() {
            visitGazette(this.bf_project_id, modelId);
            getGazetteRow()
                .children()
                .eq(2)
                .find('input')
                .click();
            cy.get('.ui.popup')
                .contains('token_set_ratio')
                .click();
            getGazetteRow()
                .children()
                .eq(2)
                .find('input')
                .should('have.attr', 'value', 'token_set_ratio');
        });

        it('should edit the gazette examples', function() {
            visitGazette(this.bf_project_id, modelId);
            getGazetteRow()
                .children()
                .eq(1)
                .click();
            getGazetteRow()
                .children()
                .eq(1)
                .find('textarea')
                .type('{del},,');
            cy.contains('Gazette').click();
            getGazetteRow()
                .children()
                .eq(1)
                .should('contain', sortedGazetteValues);
        });

        it('should remove the values and fail removing it without crashing', function() {
            visitGazette(this.bf_project_id, modelId);
            getGazetteRow()
                .children()
                .eq(1)
                .click();
            getGazetteRow()
                .children()
                .eq(1)
                .find('textarea')
                .type('{selectAll}{del}');
            // we click elsewhere to end the editing
            cy.contains('Gazette').click();
            getGazetteRow()
                .children()
                .eq(1)
                .should('contain', sortedGazetteValues);

            getGazetteRow()
                .children()
                .first()
                .click();
            getGazetteRow()
                .children()
                .first()
                .find('input')
                .type('{selectAll}{del}');
            // we click elsewhere to end the editing
            cy.contains('Gazette').click();
            getGazetteRow()
                .children()
                .first()
                .should('contain', gazetteName);
        });
    });

    describe('deleting Gazette', function() {
        it('should delete the created gazette', function() {
            visitGazette(this.bf_project_id, modelId);
            getGazetteRow()
                .find('[data-cy=trash] .viewOnHover')
                .click({ force: true });
            cy.get('body').should('not.contain', sortedGazetteValues);
            cy.contains(sortedGazetteValues).should('not.exist');
        });
    });
});
