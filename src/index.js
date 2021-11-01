const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Username not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const id = uuidv4();

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return response.status(400).send({ error: "Username already exists" });
  }

  const data = {
    id,
    name,
    username,
    todos: [],
  };

  users.push(data);

  response.status(201).send(data);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const id = uuidv4();

  const data = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(data);

  response.status(201).send(data);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo Not Found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.send(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo Not Found" });
  }

  todo.done = true;

  response.send(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).send({ error: "Todo Not Found" });
  }

  user.todos.splice(todo, 1);

  response.status(204).send();
});

module.exports = app;
