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

    // deleteMany
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
    //     console.log(result.result);
    // });

    // deleteOne
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
    //     console.log(result.result);
    // });

    // findOneAndDelete to say which one was deleted(PERSONAL FAVORITE)
    // db.collection('Todos').findOneAndDelete({completed: true}).then((result) => {
    //     console.log(result);
    // });

    //delete Andrew(s) and different one by id.
    db.collection('Users').deleteMany({name: 'Andrew'});
    db.collection('Users').findOneAndDelete({_id: new ObjectID('58e3d67b2c6dae5b43be08b2')}).then((result) => {
        console.log(JSON.stringify(result, undefined, 2)); 
    });

    db.close();
}); 
