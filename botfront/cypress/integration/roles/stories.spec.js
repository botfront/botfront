/* eslint-disable no-undef */
// example file to demonstrate cypress commands for roles
const email = 'dummy@dummy.dummy';

describe('story permissions', function() {
    beforeEach(function() {
        cy.login();
        cy.createProject('bf', 'My Project', 'fr');
        cy.createDummyRoleAndUserThenLogin(email, ['stories:r']);
    });

    afterEach(function() {
        cy.removeDummyRoleAndUser(email, 'global-admin');
        cy.logout();
        cy.deleteProject('bf');
    });

    const dataCyShouldNotExist = [
        'add-item',
        'ellipsis-menu',
        'move-story',
        'policies-modal',
        'delete-story',
        'create-branch',
        'link-to',
        'train-select',
        'icon-trash',
        'add-bot-line',
        'add-action-line',
        'add-user-line',
        'add-slot-line',
        'add-story',
        'add-branch',
        'delete-branch',
    ];
    
    function checkIfElementDoNotExist(elm) {
        cy.dataCy(elm).should('not.exist');
    }
    
    function createBranch() {
        cy.logout();
        cy.login();
        cy.visit('/project/bf/stories');
        cy.dataCy('create-branch').click({ force: true });
        cy.logout();
        cy.login(true, email);
    }

    it('Editing buttons/icons should not exist', function() {
        // create a branch before the test so we can test for button visibility of the branch menu
        createBranch();
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded

        dataCyShouldNotExist.forEach((dataCy) => {
            checkIfElementDoNotExist(dataCy);
        });
    });

    it('should not be able to edit story title', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title').should('be.disabled');
    });
    
    it('should not be able to edit branch name', function() {
        createBranch();
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('branch-label')
            .eq(1)
            .click();
        cy.get('[data-cy=branch-label] span').eq(1).should('exist');
        cy.get('[data-cy=branch-label] input').should('not.exist');
    });

    it('should not be able to edit slots', function() {
        cy.logout();
        cy.login();
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('slots-modal').click();
        cy.dataCy('add-slot').click();
        cy.contains('float').click();
        cy.dataCy('new-slot-editor')
            .find('input')
            .first()
            .type('test');
        cy.dataCy('save-button').click();
        cy.logout();
        cy.login(true, email);
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title').should('exist'); // check that the page was properly loaded
        cy.dataCy('slots-modal').click();
        cy.get('form.form .field').each(function(elm, _, __) { cy.wrap(elm).should('have.class', 'disabled'); });
        cy.dataCy('save-button').should('not.exist');
        cy.dataCy('delete-slot').should('not.exist');
    });
   
    it('should not be able to edit story markdown', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('toggle-md').click();
        cy.dataCy('story-editor').click();
        cy.dataCy('story-editor')
            .get('textarea')
            .type('Test', { force: true });
        cy.dataCy('story-editor').get('textarea').blur();
        cy.get('div.ace_content').should('have.text', '* get_started    - utter_get_started');
    });
});
