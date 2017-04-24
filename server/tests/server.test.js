const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [
    {_id: new ObjectID(), text: 'First test todo'},
    {_id: new ObjectID(), text: 'Second test todo', completed: true, completedAt: 333}
]

/**Before each individual 'it' test wipe up db entries since test will assume starting with 0 todos*/
beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done());
});

/** 2 test cases
        when sending correct data as body we get 200 OK, completed doc, and ID.
        if sending bad data send back 400 error object*/
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => { // :id passed around 'todo'
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                //console.log(res.body.todo.text);
                expect(res.body.todo.text).toBe(todos[0].text); // :id equates to 'todo' from server.js;
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        //console.log(hexId);
        request(app)
            .get(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => { // :id passed around 'todo'
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
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

    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        //console.log(hexId);
        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id invalid', (done) => {
        request(app)
            .delete('/todos/123abc')
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

    it('should clear completedAt when todo is not completed', (done) => {
        // grab id of second todo item
        var hexId = todos[1]._id.toHexString();
        var text = 'This should be the new text!!';
        request(app)
            .patch(`/todos/${hexId}`)
        // update text, set completed to false
        .send({completed: false, text}) // some webui checkbox
        .expect(200)
        // assertions about the data coming back
        // textis chagned, completed false, completedAt is null .toNotExist
        .expect((res) => {
            console.log(res.body);
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toNotExist(); // could also use expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });
});