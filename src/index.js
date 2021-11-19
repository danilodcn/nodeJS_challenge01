const express = require("express");
const cors = require("cors");

const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  let user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: "user already exists" });
  }

  const userAccount = {
    id: uuid(),
    name,
    username,
    todos: [],
  };

  users.push(userAccount);
  return response.status(201).json(userAccount);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  // console.log(user)
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const id = request.params.id;
  const todoUpdate = request.body;

  let todo = user.todos.find((t) => t.id === id);
  if (!todo) {
    return response.status(404).json({ error: "todo not found" });
  }

  todo = { ...todo, ...todoUpdate };
  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const id = request.params.id;

  let todo = user.todos.find((t) => t.id === id);
  if (!todo) {
    return response.status(404).json({ error: "todo not found" });
  }
  todo.done = true;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const id = request.params.id;

  let index;
  let todo = user.todos.find((t, i) => {
    index = i
    return t.id === id
  });
  if (!todo) {
    return response.status(404).json({ error: "todo not found" });
  }

  // user.todos = user.todos.filter((t) => t != todo)

  user.todos.splice(index, 1);
  // delete todo
  return response.status(204).json();
});

module.exports = app;
