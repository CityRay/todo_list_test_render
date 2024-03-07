const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [];

const server = http.createServer((req, res) => {
  console.info(req.url);
  console.log(req.method);

  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  };

  let body = "";

  req.on('data', chunk => {
    body += chunk;
  });



  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos
    }));
    res.end();
    return;
  }

  if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;

        if (!title) {
          throw new Error('Title is required');
        }

        const todo = { id: uuidv4(), title };
        todos.push(todo);

        res.writeHead(200, headers);
        res.write(JSON.stringify({
          "status": "success",
          "data": todos
        }));
        res.end();
      } catch (error) {
        console.error(error.message);
        errorHandle(res, error);
      }
    });

    return;
  }

  if (req.url === '/todos' && req.method === 'DELETE') {
    // clear all todos
    todos.length = 0;

    res.writeHead(200, headers);
    res.write(JSON.stringify({
      "status": "success",
      "data": todos,
      "message": "Delete success"
    }));
    res.end();
    return;
  }

  if (req.url.startsWith('/todo/') && req.method === 'DELETE') {
    try {
      // get id from url
      const id = req.url.split('/').pop();
      if (!id) {
        throw new Error('ID is required');
      }

      // find todo index by id
      const findIdx = todos.findIndex(todo => todo.id === id);
      if (findIdx === -1) {
        throw new Error('ID not found');
      }

      // remove todo by id
      todos.splice(findIdx, 1);

      res.writeHead(200, headers);
      res.write(JSON.stringify({
        "status": "success",
        "data": todos,
        "message": "Delete success"
      }));
      res.end();
    } catch (error) {
      console.error(error.message);
      errorHandle(res, error);
    }

    return;
  }

  if (req.url.startsWith('/todo/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const id = req.url.split('/').pop();
        if (!id) {
          throw new Error('ID is required');
        }

        const todoTitle = JSON.parse(body).title;
        const findIdx = todos.findIndex(todo => todo.id === id);
        if (!todoTitle || findIdx === -1) {
          throw new Error('ID or Title not found');
        }

        todos[findIdx].title = todoTitle;
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          "status": "success",
          "data": todos[findIdx]
        }));
        res.end();
      } catch (error) {
        console.error(error.message);
        errorHandle(res, error);
      }
    });

    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    return;
  }

  // res.statusCode = 404;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Not found 404 ~');
  res.writeHead(404, headers);
  res.write(JSON.stringify({
    "status": "false",
    "message": "Not found 404 ~"
  }));
  res.end();
});

server.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});
