var mongoose = require('mongoose');

/**create new User model
* user
* email - require it - trim it - set type - set min length of 1
*/
var User = mongoose.model('User', {
    email: {type: String, required: true, trim: true, minlength: 1}, // trim property removes all leading and trailing white space
});

module.exports = {User};