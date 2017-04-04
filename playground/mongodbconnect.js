// Object destructure.
// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

// var obj = new ObjectID();
// console.log(obj);

/**In production environment this will connect to an AWS or Heroku url.*/
MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        // return is necessary to stop the program or alternatively remove return and add 'else' statement.
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server.');

    // db.collection('Todos').insertOne({
    //     text: 'Something to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }
    //     console.log(JSON.stringify(result.ops, undefined, 2)); // undefined is placeholder for filter function.
    // });

    // Insert new doc into Users(name, age, location)
    // db.collection('Todos').insertOne({
    //     name: 'Jairo',
    //     age: 37,
    //     location: 'Mansfield'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to isnert todo', err);
    //     }
    //     // console.log(JSON.stringify(result.ops, undefined, 2));
    //     console.log(result.ops[0]._id.getTimestamp());
    // });
    db.close();
}); 


