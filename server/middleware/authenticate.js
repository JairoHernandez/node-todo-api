var {User} = require('./../models/user');

//middleware will make routes private
var authenticate = (req, res, next) => {
    // grab token
    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject(); // will cause catch(e) to now execute.
        }

        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
        // no need to put next() here since we dont want app.get() to send back user.
    });    
};

module.exports = {authenticate};