const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
    // trim property removes all leading and trailing white space
    email: {
        type: String, 
        required: true, 
        trim: true, 
        minlength: 1, 
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
       }
    },
    password: {
        type: String,
        require: true,
        minlength: 6
    },
    // An array and only available for mongodb not SQL/postgres.
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// Chooses only to send back _id and email in response for security vs. password, tokesn.
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject(); // since _.pick requires an object
    return _.pick(userObject, ['_id', 'email']);
};

// Instance method is generateAuthToken and we cannot use ES6 => function since it cannot bind to this.
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    return user.save().then(() => { // return is to allow server.js to chain on to promise.
        return token;
    });
};

// turns everything into model method as oppose to instance method.
UserSchema.statics.findByToken = function (token) {
    var User = this; // capitalized model binding.
    var decoded; // undefined

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        // This reject will cause User.findByToken(token.then(user) => {} in server.js to never fire and will instead fire its attached .catch callback.
        // return new Promise((resolve, reject) => {
        //     reject(); 
        // });
        return Promise.reject(); // equivalent to last 3 lines and more concise. If you pass in a value to reject() it will be used by 'e' in catch call in server.js.
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token, // quotes required when value has a .dot.
        'tokens.access': 'auth'
    });
};

/**create new User model
* user
* email - require it - trim it - set type - set min length of 1 
This will not allow you to attach methods to User, but UserSchema will so you pass it in.*/
var User = mongoose.model('User', UserSchema);

module.exports = {User};