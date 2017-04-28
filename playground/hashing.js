const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

//salt and hashing
// 10 rounds means stronger algorithm, some use 128 so no one can bruteforce it.
bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
}); 

// compare hash from a DB to plain text password from user login, which is what we do when someone logs in
var hashedPassword = '$2a$10$9tXmk8DOsE.ZGj64IOSsp.yHPlP4KTCKILoINcCZdiiAmhLugdeRi';
bcrypt.compare(password, hashedPassword, (err, res) => {
    console.log(res);
});

// var data = {
//     id: 10
// }

// // takes the object(data w/ userid) and signs it to create hash and returns token value
// var token = jwt.sign(data, '123abc'); // sent back to user and to be stored in tokens array in user.js. Also, '123abc' is the secret.
// console.log(token);

//  // Changing to token + '1'  or changing secret '123abc' will cause failure with invalid signature.
// var decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);

// // does the opppsite by taking token and secret to make sure data was not manipulated.
// // jwt.verify


// var message = "I am user number 3";
// var hash = SHA256(message).toString(); // covert object to string.

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// /** THIS WHOLE MANUAL CODE IS EASILY HANDLED BY A JSON WEB TOKEN TO MAKE REALY EASY. */
// var data = {
//     id: 4
// };

// // sent to user
// var token = {
//     data,
//     // Used to check if data was manipulated by client and therefore invalid data.
//     // salt('somesecret') the hash prevents trickery by not allowing someone to change data and rehashing the new data with a new hash to trick us.
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString() 
// }

// // Man in the middle attack
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data).toString());

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
//     console.log('Data was not changed');
// } else {
//     console.log('Data was changed do not trust.')
// }

