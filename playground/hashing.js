const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

// let message = 'I am user';
// let hash = SHA256(message).toString();

let data = {
    id: 10
};

let token = jwt.sign(data, '123abc');
console.log(token);

let decoded = jwt.verify(token, '123abc');
console.log(decoded);