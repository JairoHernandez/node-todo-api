const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

/**Wipe up db entries since test will assume starting with 0 todos*/
beforeEach((done) => {
    Todo.remove({}).then(() => done());
});

/** 2 test cases
        when sending correct data as body we get 200 OK, completed doc, and ID.
        if sending bad data send back 400 error object*/
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err); //stops function execution
                }
            
                Todo.find().then((todos) => {
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });

    });
});