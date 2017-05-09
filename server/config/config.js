var env = process.env.NODE_ENV || 'development' // Seen as production environment by Heroku.
//console.log('env *****', env);

if (env === 'development' || env === 'test') {
    var config = require('./config.json'); // By default JSON file is assigned as object.
    var envConfig = config[env];
    
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
        //console.log(`yo ${process.env[key]}`);
    });
}

