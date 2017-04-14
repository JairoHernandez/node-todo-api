var express = require('express');
var bodyParser = require('body-parser'); // takes JSON and converts to object.

//ES6 destructuring
var {mongoose} = require('./db/mongoose');
var {Todo} =  require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json()); // returns a function

// Generate POST with postman.
app.post('/todos', (req, res) => {
    // console.log(req.body); // body stored by body-parser
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};