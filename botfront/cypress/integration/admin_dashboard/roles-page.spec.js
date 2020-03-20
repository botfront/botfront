/* eslint-disable no-undef */

const roleName = 'TestRole';
const editedRoleName = 'NewRole';

describe('can create, edit, and delete a role', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
    });
    afterEach(function() {
        cy.logout();
        cy.deleteUser('roleTestUser@test.test');
        cy.deleteRole('NewRole', 'global-admin');
        cy.deleteRole('TestRole', 'global-admin');
        cy.deleteProject('bf');
    });
    const createRole = () => {
        cy.visit('/admin/roles');
        cy.dataCy('create-role').click();
        cy.dataCy('role-name-input').click().type(roleName);
        cy.dataCy('role-description-input').click().type('description of test role');
        cy.dataCy('role-children-dropdown').click();
        cy.dataCy('role-children-dropdown').find('div').contains('nlu-data:w').click();
        cy.dataCy('role-children-dropdown').find('input').type('{esc}');
        cy.dataCy('save-button').click();
        cy.dataCy('save-button').should('have.text', 'Saved');
    };
    it('should create and delete a role', () => {
        createRole();
        cy.createUser('roleTestUser', 'roleTestUser@test.test', [roleName], 'bf');

        // verify role data was saved
        cy.visit('/admin/roles');
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).click();
        cy.dataCy('role-name-input').find('input').should('have.value', roleName);
        cy.dataCy('role-description-input').find('input').should('have.value', 'description of test role');
        cy.dataCy('role-children-dropdown').find('.ui.label').contains('nlu-data:w').should('exist');

        // delete role
        cy.dataCy('delete-role').click();
        cy.dataCy('select-fallback-role').click();
        cy.dataCy('select-fallback-role').find('.text').contains('global-admin').click();
        cy.dataCy('delete-role-modal').find('.ui.negative.button').contains('Delete').click();

        // verify user role was change to the fallback role
        cy.visit('/admin/roles');
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).should('not.exist');

        cy.visit('/admin/users');
        cy.dataCy('edit-user').last().click();
        cy.dataCy('user-roles-field').find('.label').contains('global-admin').should('exist');
    });
    it('should edit a role', () => {
        createRole();
        cy.createUser('roleTestUser', 'roleTestUser@test.test', [roleName], 'bf');

        cy.visit('/admin/roles');
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).click();
        cy.dataCy('role-name-input').find('input').clear().type(editedRoleName);
        cy.dataCy('save-button').click();
        cy.dataCy('save-button').should('have.text', 'Saved');

        // verfiy that the role was not duplicated
        cy.visit('/admin/roles');
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).should('not.exist');
        cy.dataCy('role-link').contains(editedRoleName).should('exist');
    });
});
