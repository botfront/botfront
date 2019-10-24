'use strict';
const mongoose = require('mongoose');
const expressWinston = require('express-winston');
const winston = require('winston');
const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');

const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.raw({ limit: '100mb' }));


config().then(async config => {

    const routes = require('./routes/index.js');
    app.use('/', routes);
    // Setup swagger UI
    require('./config/swagger')(app);

    app.use(
        expressWinston.logger({
            transports: [new winston.transports.Console()],
        }),
    );
    for (let i = 1; i < Number.MAX_VALUE; ++i) {
        try {
            await mongoose.connect(config.mongo.host, {
                keepAlive: true,
                useNewUrlParser: true,
                useFindAndModify: false,
            });
            break;
        } catch (error) {
            if (i === 1 || i % 1000 === 0)
                console.log(`Connection to ${config.mongo.host} failed. Retrying... (#${i})`);
        }
    }

    app.listen(port, function() {
        // eslint-disable-next-line no-console
        return console.log('Server running at http://127.0.0.1:' + port);
    });
    app.config = config;
});
module.exports = app;




