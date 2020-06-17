'use strict';
const mongoose = require('mongoose');
const expressWinston = require('express-winston');
const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 8080;
const app = express();
const { winstonInstance, logsTransport } = require('./loggerConfig')
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
  
    app.use(expressWinston.logger({
        winstonInstance: winstonInstance,
        statusLevels: true,
        metaField: null, //this causes the metadata to be stored at the root of the log entry
        responseField: null, // this prevents the response from being included in the metadata (including body and status code)
        requestWhitelist: ['headers', 'query'],  //these are not included in the standard StackDriver httpRequest
        responseWhitelist: ['body'], // this populates the `res.body` so we can get the response size (not required)
        dynamicMeta:  (req, res) => {
            const httpRequest = {}
            const meta = {}
            if (req) {
                meta.httpRequest = httpRequest
                httpRequest.requestMethod = req.method
                httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
                httpRequest.protocol = `HTTP/${req.httpVersion}`
                // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
                httpRequest.remoteIp = req.ip.indexOf(':') >= 0 ? req.ip.substring(req.ip.lastIndexOf(':') + 1) : req.ip   // just ipv4
                httpRequest.requestSize = req.socket.bytesRead
                httpRequest.userAgent = req.get('User-Agent')
                httpRequest.referrer = req.get('Referrer')
            }
    
            if (res) {
                meta.httpRequest = httpRequest
                httpRequest.status = res.statusCode
                httpRequest.latency = {
                    seconds: Math.floor(res.responseTime / 1000),
                    nanos: ( res.responseTime % 1000 ) * 1000000,
                }
                if (res.body) {
                    if (typeof res.body === 'object') {
                        httpRequest.responseSize = JSON.stringify(res.body).length
                    } else if (typeof res.body === 'string') {
                        httpRequest.responseSize = res.body.length
                    }
                }
            }
            return meta
        },
    }));

    app.use('/', routes);

    app.use(
        expressWinston.errorLogger({
            transports: logsTransport,
        }),
    );
 
    // Setup swagger UI
    require('./config/swagger')(app);

  
    let retries = 0;
    const mongoConnectInterval = setInterval(async () => {
        retries += 1;
        try {
            await mongoose.connect(config.mongo.host, {
                keepAlive: 1,
                useUnifiedTopology: 1,
                useFindAndModify: 0,
                useNewUrlParser: 1,
                useCreateIndex: 1,
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




