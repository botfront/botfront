// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const { join } = require('path');
const JSZip = require('jszip');
const glob = require('glob');
const fs = require('fs');
const { Octokit } = require('@octokit/rest');
const generatePair = require('keypair');
const sshpk = require('sshpk');

const generateZip = (folder, config) => {
    const zip = new JSZip();
    const toZip = join(config.fixturesFolder, folder);

    const paths = glob.sync(join('**', '*'), {
        nodir: true,
        cwd: toZip,
    });
    // garanty order
    paths.sort((a, b) => {
        if (a.firstname < b.firstname) { return -1; }
        if (a.firstname > b.firstname) { return 1; }
        return 0;
    });
    paths.forEach(path => zip.file(path, fs.readFileSync(join(toZip, path), 'utf8')));
    const b64 = zip.generateAsync({ type: 'base64' });
    return b64;
};


// module.exports = (on, config) => {
//     // `on` is used to hook into various events Cypress emits
//     // `config` is the resolved Cypress config
// };

module.exports = (on, config) => {
    on('task', {
        log (message) { console.log(message); return null; },
        zipFolder(path) {
            return generateZip(path, config);
        },
        generatePair: () => {
            const pair = generatePair();
            return {
                privateKey: pair.private,
                publicKey: sshpk.parseKey(pair.public, 'pem').toString('ssh').replace(' (unnamed)', ''),
            };
        },
        octoRequest: (args) => {
            const octokit = new Octokit({ auth: process.env.CYPRESS_GITHUB_TOKEN });
            return octokit.request(...args);
        },
    });
};
