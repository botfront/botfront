'use strict';
const mongoose = require('mongoose');
const expressWinston = require('express-winston');
const winston = require('winston');
const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 8080;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.raw({ limit: '100mb' }));

if (process.env.CORS === '*') {
    app.use(cors());
} else if (process.env.CORS) {
    const allowedOrigins = process.env.CORS.split(',');
    app.use(cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.includes(origin)) {
                return callback(new Error('Disallowed by CORS'), false);
            }
            return callback(null, true);
        },
    }));
}

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
    let retries = 0;
    const mongoConnectInterval = setInterval(async () => {
        retries += 1;
        try {
            await mongoose.connect(config.mongo.host, {
                keepAlive: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            });
            clearInterval(mongoConnectInterval)
            app.listen(port, function() {
                // eslint-disable-next-line no-console
                return console.log('Server running at http://127.0.0.1:' + port);
            });
            app.config = config;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`Connection to MongoDB server failed. Retrying... (#${retries})`);
        }
    }, 1000)
});
module.exports = app;




