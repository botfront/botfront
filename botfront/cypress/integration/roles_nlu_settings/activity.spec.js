/* eslint-disable no-undef */

let emailHasPermission = '';
let emailwithoutPermission = '';

describe('Test for permissions', function() {
    before(function() {
        cy.fixture('bf_project_id.txt').as('bf_project_id');
        cy.fixture('bf_model_id.txt').then((modelId) => {
            const commandToAddActivity = `mongo meteor --host localhost:3001 --eval "db.activity.insert({ 
                _id:'TestActivity',
                text: 'bonjour , avez vous un f1 à lyon autour de l apardieu ?',
                intent: 'faq.find_hotel',
                entities:[
            
                ],
                confidence:{
                '$numberDouble' :'0.7438368201255798'
                },
                modelId: '${modelId}',
                createdAt:{
                '$date' :{
                    numberLong: '1557323537346'
                }
                },
                updatedAt:{
                '$date':{
                    '$numberLong': '1557323537346'
                }
                },
                __v:{
                '$numberInt': '0'
                }
            });"`;
            cy.exec(commandToAddActivity);
            // cy.exec(`mongo meteor --host localhost:3001 --eval "db.nlu_models.update({ _id: '${modelId}'}, { $set: { "training.endTime": "123" } });"`); TODO fix this statement
        });
    });


    afterEach(function() {
        cy.logout();
        cy.login();
        cy.deleteUser(emailHasPermission);
        cy.deleteUser(emailwithoutPermission);
    });

    beforeEach(function() {
        cy.login();
    });

    it('Activities should be redered for nlu-data:r', function() {
        emailHasPermission = 'nludatar@test.com';
        cy.createUser('nlu-data:r', emailHasPermission, ['nlu-data:r'], `${this.bf_project_id}`);
        cy.logout();
        cy.loginTestUser(emailHasPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('.nlu-menu-activity').should('exist');
        cy.get('#playground').should('exist');
        cy.get('.ReactTable').should('exist');
    });

    it('A user can only change intent, validate and save only if the user has nlu-data:w permission', function() {
        emailHasPermission = 'nludataw@test.com';
        emailwithoutPermission = 'nludatar@test.com';
        cy.createUser('nlu-data:w', emailHasPermission, 'nlu-data:w', `${this.bf_project_id}`);
        cy.createUser('nlu-data:r', emailwithoutPermission, 'nlu-data:r', `${this.bf_project_id}`);
        cy.logout();
        // For valid user
        cy.loginTestUser(emailHasPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('exist');
        cy.get('.nlu-delete-example').should('exist');
        // TODO: Add test for change entity, currently cypress doen not allow to select text
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').eq(1).should('not.be.disabled');
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('exist');
        cy.logout();
        // For invalid user
        cy.loginTestUser(emailwithoutPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('not.exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').eq(1).should('be.disabled');
        cy.get('[data-cy=intent-dropdown]').should('have.class', 'disabled');
        cy.contains('Save').should('not.exist');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('not.exist');
    });

    it('A user can only re-interpret with nlu-data:r permission', function() {
        emailHasPermission = 'nludataw@test.com';
        emailwithoutPermission = 'nlumetar@test.com';
        cy.createUser('nlu-data:r', emailHasPermission, 'nlu-data:r', `${this.bf_project_id}`);
        cy.createUser('nlu-meta:r', emailwithoutPermission, 'nlu-meta:r', `${this.bf_project_id}`);
        cy.logout();
        // For valid user
        cy.loginTestUser(emailHasPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('exist');
        cy.get('.nlu-delete-example').should('exist');
        // TODO: Add test for change entity, currently cypress does not allow to select text
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').eq(1).should('not.be.disabled');
        cy.get('[data-cy=intent-dropdown]').eq(0).should('not.have.class', 'disabled');
        cy.contains('Save').should('not.have.class', 'disabled');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('exist');
        cy.logout();
        // For invalid user
        cy.loginTestUser(emailwithoutPermission);
        cy.visit(`/project/${this.bf_project_id}/nlu/models`);
        cy.contains('English').click();
        cy.get('.cards>:first-child button.primary').click();
        cy.get('[data-cy=validate-button]').should('not.exist');
        cy.get('.nlu-delete-example').should('not.exist');
        cy.get('[data-cy=intent-label]').trigger('mouseover');
        cy.get('[data-cy=intent-popup]').should('not.exist');
        cy.get('div.rt-td.rt-expandable').click();
        cy.get('[data-cy=example-text-editor-input]').should('be.disabled');
        cy.get('[data-cy=intent-dropdown]').should('have.class', 'disabled');
        cy.contains('Save').should('not.exist');
        cy.contains('New Utterances').should('exist');
        cy.contains('Populate').should('not.exist');
    });
});
