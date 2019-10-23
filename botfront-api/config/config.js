const Joi = require('joi');

// module.exports = config;
module.exports = async function() {
    console.log('hoy')
    // require and configure dotenv, will load vars in .env in PROCESS.ENV
    require('dotenv').config();
    console.log('hoy')
    // define validation for all the env vars
    const envVarsSchema = Joi.object({
        NODE_ENV: Joi.string()
            .allow(['development', 'production', 'test', 'provision'])
            .default('development'),
        PORT: Joi.number().default(4040),
        MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
            is: Joi.string().equal('development'),
            then: Joi.boolean().default(true),
            otherwise: Joi.boolean().default(false),
        }),
        MONGO_URL: Joi.string()
            .required()
            .description('Mongo DB host url'),
    })
        .unknown()
        .required();
        console.log('hoy')
    const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }
    console.log('hoy')
    if (envVars.NODE_ENV === 'test') {
        console.log('a')
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('b')
        const mongod = new MongoMemoryServer();
        console.log('c')
        envVars.MONGO_URL = await mongod.getConnectionString();
        console.log('d')
        envVars.MONGO_URL = await mongod.getConnectionString();
        console.log('e')
        envVars.MONGO_PORT = await mongod.getPort();
        console.log('f')
    }
    console.log('hoy')
    return {
        env: envVars.NODE_ENV,
        port: envVars.PORT,
        mongooseDebug: envVars.MONGOOSE_DEBUG,
        mongo: {
            host: envVars.MONGO_URL,
        },
    };
};
