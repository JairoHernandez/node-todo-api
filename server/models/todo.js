var mongoose = require('mongoose');

//Create mongoose model(aka collection)
var Todo = mongoose.model('Todo', {
    text: {type: String, required: true, minlength: 1, trim: true}, // trim property removes all leading and trailing white space
    /**default values will be written to DB if instance object does not use them */
    completed: {type: Boolean, default: false}, // A new task will always be set to false at first.
    completedAt: {type: Number, default: null}, // A new task completed timestamp will be null at first.
    _creator: {type: mongoose.Schema.Types.ObjectId, required: true} // _creator underscore is just naming convention because it maps to a user's id.
});

module.exports = {Todo};