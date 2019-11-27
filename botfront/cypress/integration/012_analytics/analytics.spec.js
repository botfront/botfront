/* eslint-disable no-undef */
const ExpectedCellData = {
    conversationLength: [
        {
            table: 0, row: 0, column: 0, contents: 1,
        },
        {
            table: 0, row: 0, column: 1, contents: 1,
        },
        {
            table: 0, row: 0, column: 2, contents: '25%',
        },
        {
            table: 0, row: 1, column: 0, contents: 2,
        },
        {
            table: 0, row: 1, column: 1, contents: 2,
        },
        {
            table: 0, row: 1, column: 2, contents: '50%',
        },
        {
            table: 0, row: 2, column: 0, contents: 3,
        },
        {
            table: 0, row: 2, column: 1, contents: 1,
        },
        {
            table: 0, row: 2, column: 2, contents: '25%',
        },
    ],
    topIntents: [
        {
            table: 1, row: 0, column: 0, contents: 'test1',
        },
        {
            table: 1, row: 0, column: 1, contents: 5,
        },
        {
            table: 1, row: 0, column: 2, contents: '62.5%',
        },
        {
            table: 1, row: 1, column: 0, contents: 'test2',
        },
        {
            table: 1, row: 1, column: 1, contents: 2,
        },
        {
            table: 1, row: 1, column: 2, contents: '25%',
        },
    ],
    conversationDuration: [
        {
            table: 2, row: 0, column: 0, contents: '< 30',
        },
        {
            table: 2, row: 0, column: 1, contents: 1,
        },
        {
            table: 2, row: 0, column: 2, contents: '25%',
        },
        {
            table: 2, row: 1, column: 0, contents: '120 < 180',
        },
        {
            table: 2, row: 1, column: 1, contents: 2,
        },
        {
            table: 2, row: 1, column: 2, contents: '50%',
        },
        {
            table: 2, row: 2, column: 0, contents: '> 180',
        },
        {
            table: 2, row: 2, column: 1, contents: 1,
        },
        {
            table: 2, row: 2, column: 2, contents: '25%',
        },
    ],
    fallbackHourly: [
        {
            table: 3, row: 0, column: 0, contents: '00:00 - 00:59',
        },
        {
            table: 3, row: 0, column: 1, contents: 0,
        },
        {
            table: 3, row: 0, column: 2, contents: '0%',
        },
        {
            table: 3, row: 17, column: 0, contents: '17:00 - 17:59',
        },
        {
            table: 3, row: 17, column: 1, contents: 1,
        },
        {
            table: 3, row: 17, column: 2, contents: '50%',
        },
    ],
    fallbackThreeDay: [
        {
            table: 3, row: 0, column: 0, contents: '03/11/2019',
        },
        {
            table: 3, row: 0, column: 1, contents: 0,
        },
        {
            table: 3, row: 0, column: 2, contents: '0%',
        },
        {
            table: 3, row: 1, column: 0, contents: '04/11/2019',
        },
        {
            table: 3, row: 1, column: 1, contents: 1,
        },
        {
            table: 3, row: 1, column: 2, contents: '25%',
        },
        {
            table: 3, row: 2, column: 0, contents: '05/11/2019',
        },
        {
            table: 3, row: 2, column: 1, contents: 0,
        },
        {
            table: 3, row: 2, column: 2, contents: '0%',
        },
    ],
    fallbackLong: [
        {
            table: 3, row: 0, column: 0, contents: '15/08/2019',
        },
        {
            table: 3, row: 0, column: 1, contents: 0,
        },
        {
            table: 3, row: 0, column: 2, contents: '0%',
        },
        {
            table: 3, row: 1, column: 0, contents: '16/08/2019',
        },
        {
            table: 3, row: 1, column: 1, contents: 0,
        },
        {
            table: 3, row: 1, column: 2, contents: '0%',
        },
    ],
    VisitsHourly: [
        {
            table: 4, row: 0, column: 0, contents: '00:00 - 00:59',
        },
        {
            table: 4, row: 0, column: 1, contents: 0,
        },
        {
            table: 4, row: 0, column: 2, contents: 0,
        },
        {
            table: 4, row: 0, column: 3, contents: '0%',
        },
        {
            table: 4, row: 16, column: 0, contents: '16:00 - 16:59',
        },
        {
            table: 4, row: 16, column: 1, contents: 1,
        },
        {
            table: 4, row: 16, column: 2, contents: 1,
        },
        {
            table: 4, row: 16, column: 3, contents: '100%',
        },
    ],
};

describe('analytics tables', function() {
    // const importProject = () => {
    //     cy.visit('/project/bf/settings');
    //     cy.dataCy('project-settings-more')
    //         .click();
    //     cy.dataCy('admin-settings-menu')
    //         .find('a')
    //         .contains('Docker Compose')
    //         .click();
    //     cy.dataCy('docker-api-host')
    //         .click();
    //     cy.dataCy('docker-api-host')
    //         .find('input')
    //         .clear()
    //         .type(`${Cypress.env('API_URL')}{enter}`);
    //     cy.visit('/project/bf/settings');
    //     cy.contains('Import/Export').click();
    //     cy.dataCy('import-type-dropdown')
    //         .click();
    //     cy.dataCy('import-type-dropdown')
    //         .find('span')
    //         .contains('Botfront')
    //         .click();
    //     cy.fixture('analytics_test_project.json', 'utf8').then((content) => {
    //         cy.get('.file-dropzone').upload(content, 'data.json');
    //     });
    //     cy.dataCy('export-with-conversations')
    //         .click();
    //     cy.dataCy('import-button')
    //         .click();
    //     cy.dataCy('project-import-success').should('exist');
    // };

    beforeEach(function() {
        cy.deleteProject('bf');
        cy.createProject('bf', 'My Project', 'en').then(() => {
            cy.login();
        });
        cy.importProject('bf', 'analytics_test_project.json'); // replace with cy.importProject once it has been fixed
    });

    afterEach(function() {
        cy.logout();
        cy.deleteProject('bf');
    });

    const verifyCellData = ({
        table, column, row, contents,
    }) => {
        cy.dataCy('analytics-chart')
            .eq(table)
            .find('.rt-tr-group')
            .eq(row)
            .find('.rt-td')
            .eq(column)
            .contains(contents)
            .should('exist');
    };
    const selectTableChart = (cardIndex) => {
        cy.dataCy('table-chart-button')
            .eq(cardIndex)
            .click();
    };
    it('should display the correct data in the conversation length table', function() {
        cy.visit('/project/bf/analytics');
        cy.pickDateRange(0, '5/11/2019', '4/11/2019');
        selectTableChart(0);
        ExpectedCellData.conversationLength.forEach((cellData) => {
            verifyCellData(cellData);
        });
    });

    
    it('should display the correct data in the top 10 intents  table', function() {
        cy.visit('/project/bf/analytics');
        cy.pickDateRange(1, '5/11/2019', '4/11/2019');
        selectTableChart(1);
        ExpectedCellData.topIntents.forEach((cellData) => {
            verifyCellData(cellData);
        });
    // RE-ENABLE THIS TEST WHEN NULL INTENT IS REMOVED
    //     cy.dataCy('analytics-chart')
    //         .find('.rt-td')
    //         .each((element) => {
    //                 cy.expect(element[0].childNodes[0].data.length).not.to.be.equal(0);
    //         });
    });
    it('should display the correct data in the conversation duration table', function() {
        cy.visit('/project/bf/analytics');
        cy.pickDateRange(2, '5/11/2019', '4/11/2019');
        selectTableChart(2);
        ExpectedCellData.conversationDuration.forEach((cellData) => {
            verifyCellData(cellData);
        });
    });
    
    it('should display the correct data in the fallback table', function() {
        cy.visit('/project/bf/analytics');
        cy.log('visit analytics');
        cy.pickDateRange(3, '5/11/2019', '4/11/2019');
        cy.log('selected one day date range');
        selectTableChart(3);
        cy.log('switched to table view (one day)');
        // test 1 day range
        cy.dataCy('analytics-chart')
            .eq(3)
            .find('.rt-tr-group')
            .should('have.length', 24);
        cy.log('verified data length (oneDay)');
        ExpectedCellData.fallbackHourly.forEach((cellData, index) => {
            verifyCellData(cellData);
            cy.log(`verifiedDataStep ${index} (oneDay)`);
        });
        cy.log('verified one day table data');
        // test 3 day range
        cy.pickDateRange(3, '3/11/2019', '5/11/2019');
        cy.log('selected 3 day range');
        cy.dataCy('analytics-chart')
            .eq(3)
            .find('.rt-tr-group')
            .should('have.length', 3);
        cy.log('switched to table view (3day)');
        ExpectedCellData.fallbackThreeDay.forEach((cellData, index) => {
            cy.log(`verifiedDataStep ${index} (threeDay)`);
            verifyCellData(cellData);
        });
        cy.log('verified data table (3day)');
        // test 91 day range
        cy.pickDateRange(3, '15/8/2019', '29/11/2019');
        cy.log('selected 90 day range');
        ExpectedCellData.fallbackLong.forEach((cellData, index) => {
            verifyCellData(cellData);
            cy.log(`verifiedDataStep ${index} (90Day)`);
        });
        cy.log('verified table dat 90 day');
    });

    it('should display the correct data in the engagement table', function() {
        cy.visit('/project/bf/analytics');
        cy.log('visited analytics(engagement)');
        cy.pickDateRange(4, '5/11/2019', '4/11/2019');
        cy.log('selected one day range(engagement)');
        selectTableChart(4);
        cy.log('switched to table view(engagement)');
        ExpectedCellData.VisitsHourly.forEach((cellData, index) => {
            cy.log(`verify cell data ${index} (engagement)`);
            verifyCellData(cellData);
        });
    });
});
