var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
/**Better than MongoClient native driver since it does not require a callback(see mongodbconnect.js). 
 * It keeps track of connection status and will not allow next lines of code to run until we have a connection. */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose}; // ES6 equivalent {mongoose: mongoose}