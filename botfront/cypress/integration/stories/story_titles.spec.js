/* eslint-disable no-undef */

const storyGroupOne = 'storyGroupOne';
const editedGroupOne = 'editedGroupOne';
const storyGroupTwo = 'storyGroupTwo';
const editedGroupTwo = 'editedGroupTwo';
const storyGroupThree = 'storyGroupThree';
const editedGroupThree = 'editedGroupThree';
const newStoryName = 'newStoryName';
const newBranchNameOne = 'newBranchNameOne';
const newBranchNameTwo = 'newBranchNameTwo';

describe('story title editing', function() {
    afterEach(function() {
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });

    const clickFirstBranchTitle = () => {
        cy.dataCy('branch-label')
            .first()
            .click({ force: true })
            .wait(1000)
            .find('span')
            .click({ force: true });
    };
    it('should create a new story group on enter', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupOne}{enter}`);
        cy.dataCy('browser-item')
            .find('span')
            .contains(storyGroupOne)
            .should('exist');
    });

    it('should create a new story group on blur', function() {
        cy.visit('/project/bf/stories');
        cy.wait(100);
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupTwo}`)
            .blur();
        cy.wait(100);
        cy.dataCy('browser-item')
            .find('span')
            .contains(storyGroupTwo)
            .should('exist');
    });

    it('should not create a new story group on esc', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('add-item').click({ force: true });
        cy.dataCy('add-item-input')
            .find('input')
            .type(`${storyGroupThree}{esc}{Enter}`);
        cy.dataCy('browser-item')
            .find('span')
            .contains(storyGroupThree)
            .should('not.exist');
        cy.dataCy('add-item-input').should('not.exist');
    });

    it('should have consistant behaviour', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('ellipsis-menu').click({ force: true });
        cy.dataCy('edit-menu').click({ force: true });
        cy.dataCy('edit-name')
            .find('input')
            .clear()
            .type(`${editedGroupOne}{enter}`);
        cy.dataCy('browser-item')
            .find('span')
            .contains(editedGroupOne)
            .should('exist');

        cy.dataCy('ellipsis-menu').click({ force: true });
        cy.dataCy('edit-menu').click({ force: true });
        cy.dataCy('edit-name')
            .find('input')
            .clear()
            .type(`${editedGroupTwo}`)
            .blur();
        cy.dataCy('browser-item')
            .find('span')
            .contains(editedGroupTwo)
            .should('exist');

        cy.dataCy('ellipsis-menu').click({ force: true });
        cy.dataCy('edit-menu').click({ force: true });
        cy.dataCy('edit-name')
            .find('input')
            .clear()
            .type(`${editedGroupThree}{esc}{Enter}`);
        cy.dataCy('browser-item')
            .find('span')
            .contains(editedGroupThree)
            .should('not.exist');
        cy.dataCy('edit-name').should('not.exist');
    });

    it('should edit story name on enter', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title')
            .click({ force: true })
            .clear()
            .type(`${newStoryName}{enter}`);
        cy.dataCy('story-title').should('have.value', newStoryName);
    });

    it('should edit story name on blur', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title')
            .click({ force: true })
            .clear()
            .type(`${newStoryName}`)
            .blur();
        cy.dataCy('story-title').should('have.value', newStoryName);
    });

    it('should not edit story name on esc', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('story-title')
            .clear()
            .type(`${newStoryName}{Enter}`)
            .type('edit{esc}{Enter}');
        cy.wait(100);
        cy.dataCy('story-title').should('have.value', newStoryName);
    });
    it('should save branch title on blur and Enter, discard on esc', function() {
        cy.visit('/project/bf/stories');
        cy.dataCy('create-branch').click({ force: true });

        // test Enter
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameOne}{Enter}`);
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameOne)
            .should('exist');

        // test blur
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .clear()
            .type(`${newBranchNameTwo}`)
            .blur();
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameTwo)
            .should('exist');

        // test esc
        clickFirstBranchTitle();
        cy.dataCy('branch-label')
            .find('input')
            .click()
            .type('edited{esc}{Enter}');
        cy.dataCy('branch-label')
            .first()
            .find('span')
            .contains(newBranchNameTwo)
            .should('exist')
            .contains(`${newBranchNameTwo}edited`)
            .should('not.exist');
    });
});
