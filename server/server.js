var express = require('express');
var bodyParser = require('body-parser'); // takes JSON and converts to object.

//ES6 destructuring
var {mongoose} = require('./db/mongoose');
var {Todo} =  require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');

var app = express();

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

app.listen(3000, () => {
    console.log('Started on port 3000\n'); 
});

module.exports = {app};