/* global cy */

const roleName = 'TestRole';
const roleDesc = 'description of test role';
const permission = 'nlu-data:w';
const editedRoleName = 'NewRole';

const createRole = () => {
    cy.visit('/admin/roles');
    cy.dataCy('create-role').click();
    cy.dataCy('role-name-input').click().type(roleName);
    cy.dataCy('role-description-input').click().type(roleDesc);
    cy.dataCy('role-children-dropdown').click();
    cy.dataCy('role-children-dropdown').find('div').contains(permission).click();
    cy.dataCy('role-children-dropdown').find('input').type('{esc}');
    cy.dataCy('save-button').click();
    cy.dataCy('save-button').should('have.text', 'Saved');
};

describe('can create, edit, and delete a role', () => {
    beforeEach(() => {
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
            createRole();
            cy.createUser('roleTestUser', 'roleTestUser@test.test', [roleName], 'bf');
        });
    });
    afterEach(function() {
        cy.logout();
        cy.deleteUser('roleTestUser@test.test');
        cy.deleteRole(editedRoleName, 'global-admin');
        cy.deleteProject('bf');
    });
    it('should create, edit and delete a role', () => {
        cy.visit('/admin/roles');

        // verify role data was saved
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).click();
        cy.dataCy('role-name-input').find('input').should('have.value', roleName);
        cy.dataCy('role-description-input').find('input').should('have.value', roleDesc);
        cy.dataCy('role-children-dropdown').find('.ui.label').contains(permission).should('exist');

        // edit role
        cy.dataCy('role-name-input').find('input').clear().type(editedRoleName);
        cy.dataCy('save-button').click();
        cy.dataCy('save-button').should('have.text', 'Saved');

        // verfiy that the role was not duplicated
        cy.visit('/admin/roles');
        cy.get('.-btn').contains('Next').click();
        cy.dataCy('role-link').contains(roleName).should('not.exist');
        cy.dataCy('role-link').contains(editedRoleName).should('exist').click();

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
});
