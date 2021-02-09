/* global cy:true */

describe('stories', function() {
    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    beforeEach(function() {
        cy.createProject('bf', 'My Project', 'fr').then(() => cy.login());
    });
    
    it('should autosave stories as you edit them', function() {
        cy.visit('/project/bf/dialogue');
        cy.dataCy('toggle-yaml').click({ force: true });
        cy.browseToStory('Greetings');
        cy.dataCy('story-editor')
            .get('textarea')
            .last().focus()
            .clear()
            .type('{selectAll}{backSpace}{selectAll}{backSpace}- intent: ha', { force: true });
        cy.wait(200);
        cy.browseToStory('Farewells');
        cy.wait(200);
        cy.browseToStory('Greetings');
        cy.contains('- intent: ha').should('exist');
    });

    it('should list all linkable stories', function() {
        cy.visit('/project/bf/dialogue');
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm1' });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm2' });
        cy.dataCy('stories-linker').click({ force: true });
        // the double children() reach the spans containing the names of stories
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .children()
            .should('have.lengthOf', 1);
    });

    it('should be only possible to link of leaf stories', function() {
        cy.visit('/project/bf/dialogue');
        cy.dataCy('toggle-yaml').click({ force: true });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm1' });
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 4);
        cy.dataCy('branch-label')
            .eq(1)
            .click({ force: true })
            .click({ force: true })
            .click({ force: true });
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('branch-label')
            .first().click({ force: true });
        cy.dataCy('stories-linker').should('not.exist');
        cy.dataCy('branch-label')
            .eq(1)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
        cy.dataCy('branch-label')
            .first().click({ force: true });
        cy.dataCy('branch-label').should('have.length', 4);
        cy.dataCy('branch-label')
            .eq(2)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
        cy.dataCy('branch-label')
            .eq(3)
            .click({ force: true });
        cy.dataCy('stories-linker').should('not.have.class', 'disabled');
    });

    it('should be possible to link and unlink stories, and change the linked story', function() {
        cy.visit('/project/bf/dialogue');
        cy.dataCy('toggle-yaml').click({ force: true });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm1' });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm3' });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm2' });
        cy.dataCy('story-footer').should('not.have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Select story');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Hmm1');
        cy.dataCy('stories-linker')
            .find('i')
            .click({ force: true });
        cy.dataCy('story-footer').should('not.have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Select story');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .first()
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Hmm1');
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Hmm1');
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div')
            .children()
            .eq(1)
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('stories-linker')
            .find('div')
            .first()
            .should('have.text', 'Hmm3');
    });

    it('should be possible to self link when a story has branches', function() {
        cy.visit('/project/bf/dialogue');
        cy.dataCy('toggle-yaml').click({ force: true });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm1' });
        cy.dataCy('stories-linker')
            .find('div.item')
            .should('have.lengthOf', 0);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('exist');
        cy.dataCy('stories-linker')
            .find('div.item')
            .should('have.lengthOf', 1);
        cy.dataCy('stories-linker').click({ force: true });
        cy.dataCy('stories-linker')
            .find('div.item')
            .click({ force: true });
        cy.dataCy('story-footer').should('have.class', 'linked');
        cy.dataCy('story-footer')
            .find('div.active')
            .should('have.text', 'Hmm1');
    });

    it('should disable the delete button in the branch tab for a linked branch and its parent branches', function () {
        cy.visit('/project/bf/dialogue');
        cy.dataCy('toggle-yaml').click({ force: true });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm1' });
        cy.createFragmentInGroup({ groupName: 'Example group', fragmentName: 'Hmm2' });
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 2);
        cy.dataCy('create-branch').click({ force: true });
        cy.dataCy('branch-label').should('have.length', 4);
        cy.dataCy('single-story-editor').should('have.length', 3);
        cy.dataCy('story-footer').should('contain.text', 'Hmm2>New Branch 1>New Branch 1');
        cy.wait(1000); // out of options
        cy.get('.trash.small')
            .should('have.length', 4)
            .filter('.disabled')
            .should('have.length', 0);
        cy.linkStory('Hmm2', 'Hmm1');
        cy.get('.trash.small')
            .should('have.length', 4)
            .filter('.disabled')
            .should('have.length', 4);
    });
});
