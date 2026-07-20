require('dotenv').config(); //Load .env file
const express = require('express');
const logRequest = require('./middlewares/logger.js'); //Import logger middleware
const validateTodo = require('./middlewares/validator.js'); //Import validator middleware
const errorHandler = require('./middlewares/errorHandler.js'); //Import error handler middleware
const app = express();


//body parsing middleware
app.use(express.json());
app.use(logRequest); //Use logger middleware

let todos = [
    {id: 1, task: 'Learn Node.js', completed: false},
    {id: 2, task: 'Build a CRUD API', completed: false}
];

//GET ALL - Read
app.get('/todos', (req, res, nex) => {
    try {
        res.status(200).json(todos); // Send array as JSON
    } catch (error) {
        next(error); //Pass error to error handling middleware
    }
});

app.get('/todos/active', (req, res, next) => {
        const activeTodos = todos.filter((t) => t.completed ===false);
        res.status(200).json(activeTodos);
    
});

app.get('/todos/:id', (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if(isNaN(id)) {
            throw new Error('Invalid ID');
        }
        const todo = todos.find(t => t.id === id);
        if (!todo) return res.status(404).json({ message: 'Todo not found' });
        res.status(200).json(todo);
    } catch (error) {
        next(error);
    }
});
// POST New - Create
app.post('/todos', validateTodo, (req, res, next) => {
    try {
    const newTodo = {id: todos.length + 1, ...req.body}; //Auto-ID
    todos.push(newTodo);
    res.status(201).json(newTodo); // Echo back | Send the new todo as JSON
    } catch (error) {
        next(error); //Pass error to error handling middleware
    }
});


//PATCH Update - Partial
app.patch('/todos/:id', (req, res, next) => {
    try {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({ message: 'Todo not found' });
    Object.assign(todo, req.body); //Merge : e.g {completed: true}
    res.status(200).json(todo);
    } catch (error) {
        next(error);
    }
});

// DELETE - Remove
app.delete('/todos/:id', (req, res, next) => {
    try{
    const id = parseInt(req.params.id);
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== id); //Array.filter() - non-destructive
    if (todos.length === initialLength) return res.status(404).json({ error: 'Not found' });
    res.status(204).send(); //Silent success
    } catch (error) {
        next(error);
    }
});

//Bonus route
app.get('/todos/completed', (req, res, next) => {
    try {const completed = todos.filter((t) => t.completed);
    res.json(completed);
} catch (error) {
    next(error);
}
}); 

//Error handling
app.use(errorHandler); //Use error handler middleware

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => { 
    console.log(`Server is running on port ${PORT}`);
}); 