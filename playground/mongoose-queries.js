const {mongoose} =  require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');
const {ObjectID} = require('mongodb');

var id = '58e5ab7d031bb612a1d9a713';

if (!ObjectID.isValid(id)) {
    console.log('ID not valid');
}

//Get's array of docuuments. If empty returns empty array.
// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// });

// // Get's single document. If not found returns null.
// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// });

// Todo.findById(id).then((todo) => {

//     if (!todo) { // valid id that is not found.
//         return console.log('Id not found');
//     }
//     console.log('Todo By Id', todo);
// }).catch((e) => console.log(e)); // catch statement if for an invalid id.

User.findById('58e5ab7d031bb612a1d9a713').then((user) => {
    if (!user) {
        return console.log('Id not found');
    }
    console.log(JSON.stringify(user, undefined, 2));

}).catch((e) => console.log(e));