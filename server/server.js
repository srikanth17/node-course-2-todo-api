require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
let {authenticate} = require('./middleware/authenticate');

let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    let todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    let id = req.params.id;
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    try {
        const todo = await Todo.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        });
        if(!todo) {
            return res.status(404).send();
        }
        res.status(200).send({todo});
    } catch (e) {
        res.status(400).send();
    }
    // Todo.findOneAndRemove({
    //     _id: id,
    //     _creator: req.user._id
    // }).then((todo) => {
    //     if(!todo) {
    //         return res.status(404).send();
    //     }
    //     res.status(200).send({todo});
    // }).catch((e) => {
    //     res.status(400).send();
    // });
});

app.patch('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
        if(!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });
});

app.post('/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = new User({
            email: body.email,
            password: body.password
        });
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
    // user.save().then(() => {
    //     return user.generateAuthToken();
    // }).then((token) => {
    //     res.header('x-auth', token).send(user);
    // }).catch((e) => {
    //     res.status(400).send(e);
    // });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }

    // User.findByCredentials(body.email, body.password).then((user) => {
    //     return user.generateAuthToken().then((token) => {
    //         res.header('x-auth', token).send(user);
    //     });
    // }).catch((e) => {
    //     res.status(400).send();
    // });
});

app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(400).send();
    }
    // req.user.removeToken(req.token).then(() => {
    //     res.status(200).send();
    // }, () => {
    //     res.status(400).send();
    // });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
};