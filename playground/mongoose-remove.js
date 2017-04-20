const {mongoose} =  require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');
const {ObjectID} = require('mongodb');

// Remove all items by passing in empty {}
// Todo.remove({}).then((result) => {
//     console.log(result);
// });


// Queries by more than just _id if you supply it.
//callback is fed into then()
Todo.findOneAndRemove({_id: '58f818311d2b1837958352ee'}).then((todo) => {

});

Todo.findByIdAndRemove('58f818311d2b1837958352ee').then((todo) => {
    console.log(todo);
});
