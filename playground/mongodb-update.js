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

    // Google the 2nd parameter 'mongodb update operator' for findOneAndUpdate,
    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('58e4131b2c6dae5b43be0ee7')
    // }, {
    //     $set: {completed: true, name: "Jairo"}
    // }, {
    //     returnOriginal: false // returns updated data.
    // }).then((result) => {
    //     console.log(result);
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('58e51a507402e440ce61199a')
    }, {
        $set: {name: "Jairo"},
        $inc: {age: 1}
    }, {
        returnOriginal: false // returns new object back aka updated data.
    }).then((result) => {
        console.log(result);
    });

    db.close();
}); 
