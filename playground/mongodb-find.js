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

    // // Fetch all, convert to array and print.
    // // db.collection('Todos').find().toArray().then((docs) => {
    // // db.collection('Todos').find({completed: false}).toArray().then((docs) => {
    db.collection('Todos').find({_id: new ObjectID('58e2c7b41ba4509790a8d8ab')}).toArray().then((docs) => {
        console.log('Todos');
        console.log('-----');
        console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch todos', err);
    });

    db.close();
}); 


