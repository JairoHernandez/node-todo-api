var env = process.env.NODE_ENV || 'development' // Seen as production environment by Heroku.
//console.log('env *****', env);

// Production environment already setup via process.env.PORT(below) and process.env.MONGODB_URI in mongoose.sj
if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}