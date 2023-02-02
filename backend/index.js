const express = require('express');
const fs = require('node:fs');
const mysql = require('mysql2');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const connection = mysql.createConnection({
  host: 'task-manager-db.mysql.database.azure.com',
  user: 'evan',
  password: 'Celtsql01$',
  database: 'nciprotodb',
  port: 3306,
  ssl: { ca: fs.readFileSync('./DigiCertGlobalRootCA.crt.pem') },
});

connection.connect((err) => {
  if (err) {
    console.error(`Error connecting: ` + err.stack);
  }
});

app.get('/posts', (req, res) => {
  connection.query(`SELECT * FROM posts `, (err, results, fields) => {
    if (err) console.log(err);
    res.json(results);
    res.status(200);
  });
});

app.post('/posts/:content', (req, res) => {
  const { content } = req.params;

  connection.execute(
    `insert into posts (content, postDate, likes)
    values (?, now(), 0)`,
    [content],
    (err) => {
      if (err) {
        console.log(err);
        res.status(418).send({
          message: 'Error sending post to database',
        });
      } else {
        res.status(200).send({
          message: 'Successfully Posted',
        });
      }
    }
  );
});

app.post('/post/like/:postId', (req, res) => {
  const { postId } = req.params;
  const sql = 'SELECT * FROM posts where postId = ?';

  // CHECK IF POST EXISTS
  connection.query(sql, [postId], (err, rows, tables) => {
    if (err) {
      res.status(418).send({
        message: `No post found with ID : ${postId}`,
      });
    }

    // UPDATE LIKE COUNT ON POST
    const { likes } = rows[0];
    const sql = 'UPDATE posts SET likes = ? WHERE postId = ?;';

    connection.execute(sql, [likes + 1, postId], (err) => {
      if (err) {
        console.log(err);
        res.status(418).send({
          message: "counldn't update likes",
        });
      }
      res.status(200).send({
        message: 'successfully updated likes',
      });
    });
  });
});

// DELETE ALL  POSTS
app.post('/delete', (req, res) => {
  connection.execute(`DELETE FROM posts WHERE 1=1`, (err) => {
    if (err) {
      console.log(err);
      res.status(418).send({
        message: 'Error Deleting Posts',
      });
    } else {
      res.status(200).send({
        message: 'Successfully Deleted All Posts',
      });
    }
  });
});

app.listen(PORT, () => console.log(`Running on http://localhost:${PORT}`));
