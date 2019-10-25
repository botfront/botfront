const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');

module.exports = function (app) {
    const openApiSpec = __dirname + '/../openapi.yaml';
    const swaggerDocument = YAML.safeLoad(fs.readFileSync(openApiSpec, 'utf8'));
    const idsToHide = ['apiDocs', 'apiDocsDeps'];
    const customCss =
        '.swagger-ui .topbar { display: none } ' +
        idsToHide.map(id => `#operations-default-${id} { display: none } `).join('');
    var options = { customCss };
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
};
