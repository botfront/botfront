/* global cy */

const commitAndPushWithMessage = (message) => {
    cy.dataCy('git-dropdown').should('exist').click();
    cy.dataCy('commit-and-push').click();
    cy.dataCy('commit-message-input').focus().type(`${message}{enter}`);
    cy.get('.s-alert-success', { timeout: 8000 }).should('be.visible');
};
const getCommitList = () => {
    cy.dataCy('git-dropdown').click();
    cy.dataCy('revert-to-previous').click();
};
const revertToithCommit = (n, i, expected = 'success') => {
    cy.get('.row').should('have.length', n)
        .eq(i)
        .findCy('revert-to-this-commit')
        .click({ force: true });
    cy.get(`.s-alert-${expected}`, { timeout: 8000 }).should('be.visible');
};

describe('Git Integration', function() {
    beforeEach(function() {
        cy.createProject('bf').then(() => cy.login());
        cy.setUpGitRepo();
        cy.get('@gitRepo').then(gitRepo => cy.setTestGitSettings(gitRepo));
        cy.visit('/project/bf/dialogue');
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
        cy.get('@gitRepo').then(gitRepo => cy.tearDownGitRepo(gitRepo));
    });

    it('shoud obfuscate git settings', function() {
        cy.visit('/project/bf/settings/git-credentials');
         //we use this obfuscation because it matches the  validation regex, thus no error are shown when obfuscating
        cy.dataCy('git-string').find('input').should('have.value','https://******:******@******.******#******')
        cy.dataCy('public-ssh-key').find('input').should('have.value','**********************')
        cy.dataCy('private-ssh-key').find('textarea').should('have.value','**********************')
        cy.dataCy('reveal-button').click()
        cy.dataCy('git-string').find('input').should('not.have.value','https://******:******@******.******#******')
        cy.dataCy('public-ssh-key').find('input').should('not.have.value','**********************')
        cy.dataCy('private-ssh-key').find('textarea').should('not.have.value','**********************')
            
    });

    it('should commit, and revert to a commit only when current project state differs', function() {
        // push v1
        commitAndPushWithMessage('initial commit -- this is a test');

        getCommitList();
        cy.window().then(({ Meteor }) => {
            const { profile: { firstName, lastName } } = Meteor.user();
            cy.get('.row').should('have.length', 2)
                .first()
                .should('contain.text', 'this is a test')
                .should('contain.text', `by ${firstName} ${lastName}`);
        });
        cy.escapeModal();

        // craft and push v2
        cy.deleteStoryOrGroup('Farewells', 'rule');
        cy.renameStoryOrGroup('Example group', 'The real deal');
        commitAndPushWithMessage('rename example group, remove farewells rule');

        getCommitList();
        // try to revert to freshly minted commit
        // expect warning saying commit is no different from current project state
        revertToithCommit(3, 0, 'warning');
        // revert to second commit, expect success
        revertToithCommit(3, 1, 'success');
        cy.dataCy('story-group-menu-item', 'Example group').should('exist');
        cy.dataCy('story-group-menu-item', 'The real deal').should('not.exist');
        cy.dataCy('story-group-menu-item', 'Farewells').should('exist');
        // try to revert to same commit just reverted to, expect warning
        revertToithCommit(4, 2, 'warning');
        // revert again
        revertToithCommit(4, 1, 'success');
        cy.dataCy('story-group-menu-item', 'Example group').should('not.exist');
        cy.dataCy('story-group-menu-item', 'The real deal').should('exist');
        cy.dataCy('story-group-menu-item', 'Farewells').should('not.exist');
    });
    it('should commit and push a pre-revert commit when outstanding changes exist', function() {
        getCommitList();
        revertToithCommit(1, 0, 'success');
        cy.get('.row').should('have.length', 3)
            .eq(1)
            .should('contain.text', 'Project state before revert');
    });
});
