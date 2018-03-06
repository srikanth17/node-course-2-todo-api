const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let pass = '123abc';

// bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(pass, salt, (err, hash) => {
//         console.log(hash);
//     });
// });

let hashedPassword = '$2a$10$tG6swx/yHIfRp8DPjOIAKuiym7RCpHBKMMPk6c5kObF7N13yGxM4a';

bcrypt.compare(pass, hashedPassword, (err, res) => {
    console.log(res);
});

// let message = 'I am user';
// let hash = SHA256(message).toString();

// let data = {
//     id: 10
// };
//
// let token = jwt.sign(data, '123abc');
// console.log(token);
//
// let decoded = jwt.verify(token, '123abc');
// console.log(decoded);