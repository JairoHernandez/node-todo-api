const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
/**Before each individual 'it' test wipe up db entries since test will assume starting with 0 todos*/
beforeEach(populateTodos);

/** 2 test cases
        when sending correct data as body we get 200 OK, completed doc, and ID.
        if sending bad data send back 400 error object*/
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text}) // the test sends to app
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err); //stops function execution
                }
            
                Todo.find({text}).then((todos) => {
                    // console.log(todos);
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));

            });
    });

    // Second test. No need to make text variable since not passing in text.
    // Make a request like above but instead send 'send' as an empty object to cause test to fail because we wont be able to save model.
    // Then expect a 400 with no body. Assumption for Todo.find() should be zero since code does not create a todo so no todos should be there due to beforeEach().
    it('should not create todo with invalid body data', (done) => {

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err); //stops function execution
                } 

                Todo.find().then((todos) => {
                    // console.log(todos);
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => { // :id passed around 'todo'
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token) // owner of the todo in previous line
            .expect(200)
            .expect((res) => {
                //console.log(res.body.todo.text);
                expect(res.body.todo.text).toBe(todos[0].text); // :id equates to 'todo' from server.js;
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            // authenticaing as first user for a 2nd todo will cause 404
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        //console.log(hexId);
        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token) // owner of the todo in previous line
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .set('x-auth', users[0].tokens[0].token) // owner of the todo in previous line
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => { // :id passed around 'todo'
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err); // stops function execution
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should not remove a todo of a different user', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token) // delete it as 2nd user when it should be 1st user.
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err); // stops function execution
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist(); // delete should not happen so it should sitll exist in DB.
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        //console.log(hexId);
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

/** No need to write test for invalid objectID or object not found since those tests have already been written for the other HTTP methods showing that portion works*/
describe('PATCH /todos/:id', () => { // :id passed around 'todo'
    it('should update the todo', (done) => {
       
       // Grab id of first item
        var hexId = todos[0]._id.toHexString();
        //console.log(hexId);
        var text = 'This should be the new text';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            // update text, set completed true
            .send({completed: true, text}) // some webui checkbox
            .expect(200)
            // assertions about the data coming back
            // text is changed, completed is true, completedAt is a number .toBeA
            .expect((res) => {
                //console.log(res.body);
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
        
    });

    it('should not update the todo created by other user', (done) => {
       
       // Grab id of first item
        var hexId = todos[0]._id.toHexString();
        //console.log(hexId);
        var text = 'This should be the new text';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            // update text, set completed true
            .send({completed: true, text}) // some webui checkbox
            .expect(404)
            .end(done);
        
    });

    it('should clear completedAt when todo is not completed', (done) => {
        // grab id of second todo item
        var hexId = todos[1]._id.toHexString();
        var text = 'This should be the new text!!';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
        // update text, set completed to false
        .send({completed: false, text}) // some webui checkbox
        .expect(200)
        // assertions about the data coming back
        // textis chagned, completed false, completedAt is null .toNotExist
        .expect((res) => {
            //console.log(res.body);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist(); // could also use expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });
});

/** user auth  and user create tests */

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            // sets header(1st value) and value(2nd value which is token value of first user)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        //DONT PROVIDE X-AUTH TOKEN TO EXPECT 401 BACK & EXPECT BODY TO BE EMPTY OBJECT WHICH IT SHOULD BE IF USER NOT AUTHENTICATED. REMBER USE .toEqual AND NOT .toBe WHEN COMPARING AN EMPTY OBJECT(in this case res.body)
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});
    
describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com'        
        var password = '123mb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                // since x-auth has a hyphen u have to use bracket and not dot notation.
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password); // makes sure passwd is hashed
                    done();
                }).catch((e) => done(e));
            });
    })

    it('should return validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({email: 'wrong', password: '123'})
            .expect(400)
            .end(done)
    });

    it('should not create a user if email is use', (done) => {
        request(app)
            .post('/users')
            // data should be valid, but in use.
            .send({email: users[0].email, password: 'Password123!'})
            .expect(400)
            .end(done)
    });
})

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({  // the test sends to app
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({ // toInclude meants "it has at least these properties"
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        //pass in invalid password to test
        request(app)
            .post('/users/login')
            .send({  // the test sends to app
                email: users[1].email,
                password: users[1].password + '1'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    //console.log(user.tokens);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('it should remove auth token on logout', (done) => {
        // DELETE /users/me/token
        // Set x-auth equal to tokens from seed.js var users tokens array value token 
        // 200 
        // Find user, verify that tokens array has length of zero.

        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token) // the route is not only private but it uses that token as token to delete
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                // query findById
                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();

                }).catch((e) => done(e));
            })
    });
});