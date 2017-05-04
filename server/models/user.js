const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    // trim property removes all leading and trailing white space
    email: {
        type: String, 
        required: true, 
        trim: true, 
        minlength: 1, 
        unique: true,
        validate: [{
            validator: (value) => {
                return validator.isEmail(value);
            }, 
            message: '{VALUE} is not a valid email'
        }]
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

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({  // return allows to chain to server.js line 151.
        $pull: 
        {
            tokens: {token} // ES6 version equivalent to tokens: {token: token}
        }
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

// used by POST /users/login
UserSchema.statics.findByCredentials = function(email, password) {
    var User = this;

    return User.findOne({email}).then((user) => {
        if (!user) { // caught by .cacth(e) in server.js when user does not exist
            return Promise.reject();
        }

        return new Promise((resolve, reject) => { // reject triggers .catch(e) in serve.js
            // Use bcrypt.compare to compare passwor and user.password
            // pass in password, hashed, password, callback
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user); // executes '=> {res.send(user)}' in line 140,1 server.js'
                } else {
                    reject();
                }
            });
        });
    });
};

// Before running save() from serverjs.js of doc to DB we want to make changes to it.
UserSchema.pre('save', function(next) {
    var user = this;

    // checks if password was modified. If it was modified hash(true) password
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next(); // allows to move on and save the doc.
            });
        });
    } else {
        next();
    }
});

/**create new User model
* user
* email - require it - trim it - set type - set min length of 1 
This will not allow you to attach methods to User, but UserSchema will so you pass it in.*/
var User = mongoose.model('User', UserSchema);

module.exports = {User};