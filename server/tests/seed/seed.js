const {ObjectID} = require('mongodb');
const {Todo} = require ('./../../models/todo');
const {User} = require ('./../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    //user with valid auth token
    _id: userOneId,
    email: 'jairomh@emc.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    // usr with no auth token
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'UserTwoPass'
}];

// Requires hasshing passwords before saving to DB.
const populateUsers = (done) => {
    User.remove({}).then(() => {
        // 2 promises here
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        // to wait on both promises to succeed
        Promise.all([userOne, userTwo])}).then(() => done());
    };

const todos = [
    {_id: new ObjectID(), text: 'First test todo'},
    {_id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 333}
]

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
}

module.exports = {todos, populateTodos, users, populateUsers};