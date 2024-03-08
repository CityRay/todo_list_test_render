const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [];

const headers = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json'
};

const sendResponse = (res, status = 200, data, message = '') => {
  res.writeHead(status, headers);
  res.write(JSON.stringify({
    status,
    data,
    message
  }));
  res.end();
};

const requestListener = (req, res) => {
  let body = "";

  req.on('data', chunk => {
    body += chunk;
  });

  if (req.url === '/todos' && req.method === 'GET') {
    sendResponse(res, 200, todos, "");
    return;
  }

  if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const { title } = JSON.parse(body);

        if (!title) {
          throw new Error('Title is required');
        }

        const todo = { id: uuidv4(), title };
        todos.push(todo);

        sendResponse(res, 200, todos, "success");
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
    sendResponse(res, 200, todos, "Delete success");
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
      sendResponse(res, 200, todos, "Delete success");
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

        const { title } = JSON.parse(body);
        if (!title) {
          throw new Error('Title is required');
        }

        const findIdx = todos.findIndex(todo => todo.id === id);
        if (findIdx === -1) {
          throw new Error('Todo not found');
        }

        todos[findIdx].title = title;
        sendResponse(res, 200, todos[findIdx], "Update success");
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

  sendResponse(res, 404, null, "404 Not found!");
};

// create server
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3001);
