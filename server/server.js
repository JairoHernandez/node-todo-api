require('./config/config');

const express = require('express');
const bodyParser = require('body-parser'); // takes JSON and converts to object.

//ES6 destructuring
var {mongoose} = require('./db/mongoose');
var {Todo} =  require('./models/todo');
var {User} = require('./models/user');
//console.log('YO: ', {User});
//console.log(User);
const {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;
const _ = require('lodash');

app.use(bodyParser.json()); // returns a function

// Generate POST with postman.
app.post('/todos', (req, res) => {
    // console.log(req.body); // body stored by body-parser
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc); // res.send is reponse.
    }, (e) => {
        res.status(400).send(e); // sends back 400 error with empty message
    });
});

app.get('/todos', (req, res) => {

    Todo.find().then((todos) => {
        // better to pass in ES6 {todos} object becaues of all the accessible properties rather than passing a todos array. Sets more flexible future.
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET /todos/1234324
// parameter :id can be any name
app.get('/todos/:id', (req, res) => {
    //res.send(req.params); // Use to test API is responding in postman.
    var id = req.params.id;

    // Validate using isValid or send 404 NotFound with empty body
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // findById Section 7 Lecture 78
    Todo.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.status(400));
});

app.delete('/todos/:id', (req, res) => {
    // get id
    var id = req.params.id;    

    // not valid? return 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    //remove todo by id
    Todo.findByIdAndRemove(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => res.status(400));
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;

    // Chooses which properties a user can update. In this case only 'text' and 'completed'.
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // update completedAt property if body.completed is a boolean AND if boolean is true
    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime(); // unix epoch
    } else {
        body.completed = false;
        body.completedAt = null; // when you want to remove from db always set to null.
    }

    // {new: true} same returnOriginal: false  from mongodb-update.js because that's how mongo developers wrote it.
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});

    }).catch((e) => {
        res.status(400).send();
    });
});

// POST /users to create users(aka signUP for users)
app.post('/users', (req, res) => {

    var body = _.pick(req.body, ['email', 'password']);
    //console.log(body); --> { email: 'jairomh@emc.com', password: 'abc123' }
    var user = new User(body);
 
    user.save().then(() => { // user can be anything like 'doc'
        return user.generateAuthToken(); // return since we are returning a chaining promise
    }).then((token) => {
        res.header('x-auth', token).send(user); // res.send is response
    }).catch((e) => {
        res.status(400).send(e); // sends back 400 error with empty message
    });
});

// middleware arrow function authenticate in middleware/authenticate.js will make route private
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login {email, password}
// no need to call 'authenticte' since we dont have a token yet this function will try to get one.
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then((user) => {
        // res.send(user);
        return user.generateAuthToken().then((token) => { // return keeps chain alive so that catch(e) cant still run if need be
            res.header('x-auth', token).send(user); // res.send is response with token just generated and its user.
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started up on port ${port}`); 
});

module.exports = {app};