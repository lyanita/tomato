var express = require('express');
var mysql = require('mysql');
const http = require("https");

const {
  Client
} = require('pg');

const pool = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect();

var bodyParser = require('body-parser');
var request = require('request');
var cors = require('cors');

var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout: 'other'
});
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//app.set('port', 4099);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}
app.listen(port);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE,, PATCH, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Content-Type, application/json");
  next();
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.use(cors({
  origin: '*'
}));

app.get('/create-login-table', function (req, res, next) {
  var context = {};
  console.log("Test");
  pool.query("DROP TABLE IF EXISTS users", function (err) {
    var createString = "CREATE TABLE users(" +
      "id SERIAL PRIMARY KEY," +
      "username VARCHAR(255) NOT NULL," +
      "password VARCHAR(255) NOT NULL," +
      "email VARCHAR(255) NOT NULL," +
      "question VARCHAR(255) NOT NULL," +
      "answer VARCHAR(255) NOT NULL," +
      "type VARCHAR(255) NOT NULL)";
    console.log('Reset');
    console.log(createString);
    pool.query(createString, function (err) {
      context.results = "Table reset";
      //res.render('home', context);
      var string = "Users table created";
      res.send(string);
    });
  });
});

app.get('/forgot', function(req,res){
  var context = {};
  pool.query('SELECT * FROM users WHERE username=$1', [req.query.username], function (err, rows, fields, rowCount) {
    console.log(rows);
    string = JSON.stringify(rows);
    if (Number(rows.rowCount) > Number(0)) {
      res.send(string);
    } else {
      res.send(string);
    }
  });
});

app.get('/security', function(req,res){
  var context = {};
  pool.query('SELECT * FROM users WHERE username=$1 AND answer=$2', [req.query.username, req.query.answer], function (err, rows, fields, rowCount) {
    console.log(rows);
    string = JSON.stringify(rows);
    if (err) {
        res.send(string);
    } else {
      if (Number(rows.rowCount) > Number(0)) {
        res.send(string);
      } else {
        res.send(string);
      }
    }
  });
});

app.get('/login', function (req, res) {
  var qParams = [];
  var context = {}
  pool.query('SELECT * FROM users WHERE username=$1 AND password=$2', [req.query.username, req.query.password], function (err, rows, fields, rowCount) {
    if (err) {
      //next(err);
      //return;
      var string = "Error occured. Please try again."
    } else {
      console.log(rows);
      console.log(rows.rowCount);
      if (Number(rows.rowCount) === Number(0)) {
        var string = "Username and password combination are incorrect. Please try again."
      } else {
        var string = JSON.stringify(rows);
        //var string = "Login successful."
      }
    }
    console.log(string);
    res.send(string);
  });
});

app.post('/update', function(req, res, next) {
  var context = {};
  console.log(req.query.password);
  var promise = new Promise(function (resolve, reject) {
    pool.query("UPDATE users SET password=$1 WHERE username=$2", [req.query.password, req.query.username], function(err, rows, fields, rowCount) {
      if (err) {
        var string = "Error. Please try again.";
        resolve(string);
      } else {
        var string = "Password updated successfully.";
        resolve(string);
      }
    });
  });
  promise.then(function (result) {
    res.send(result);
  }).catch(function (err) {
    res.send(err);
  });
});

app.post('/insert-login', function (req, res, next) {
  var context = {};
  console.log(req.query.username);
  console.log(req.query.email);
    var promise = new Promise(function (resolve, reject) {
      pool.query("SELECT * FROM users WHERE username=$1 OR email=$2", [req.query.username, req.query.email], function (err, rows, fields, rowCount) {
        console.log(rows);
        console.log(rows.rowCount);
        console.log(rows['rowCount']);
        if (Number(rows.rowCount) > Number(0)) {
          var string = "User already exists. Please try again.";
          resolve(string);
        } else {
          pool.query("INSERT INTO users (username, password, email, question, answer, type) VALUES ($1, $2, $3, $4, $5, $6)",
            [req.query.username, req.query.password, req.query.email, req.query.question, req.query.answer, req.query.type],
            function (err, result) {
              if (err) {
                var string = "Error occured. Please try again.";
                resolve(string);
                return string;
              } else {
                var string = "New user created successfully. Please login.";
                resolve(string);
                return string;
              }
            });
        }
      });
    });
  promise.then(function(result) {
    res.send(result);
  }).catch(function(err) {
    res.send(err);
  });
});


/*app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS library", function(err){
    var createString = "CREATE TABLE library("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "acronym VARCHAR(255) NOT NULL,"+
    "term VARCHAR(255) NOT NULL,"+
    "definition VARCHAR(255) NOT NULL,"+
    "ranking INT)";
    console.log('Reset');
    console.log(createString);
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home', context);
    })
  });
});*/

app.get('/', function (req, res) {
  var qParams = [];
  var context = {};
  pool.query('SELECT * FROM library ORDER BY ranking DESC, acronym ASC, term ASC, definition ASC', function (err, rows, fields) {
    if (err) {
      next(err);
      return;
    }
    string = JSON.stringify(rows);
    var results = JSON.parse(string);
    context.results = string;
    console.log(string);
    res.send(string);
  });
});

app.post('/', function (req, res, next) {
  var context = {};
  console.log(req.query.acronym);
  pool.query("SELECT * FROM library WHERE acronym=$1 AND term=$2", [req.query.acronym, req.query.term], function (err, rows, fields, rowCount) {
    console.log(rows);
    if (rowCount > 0) {
      return;
    } else {
      pool.query("INSERT INTO library (acronym, term, definition, ranking) VALUES ($1, $2, $3, $4)",
        [req.query.acronym, req.query.term, req.query.definition, req.query.ranking],
        function (err, result) {
          if (err) {
            next(err);
            return;
          }
          pool.query("SELECT * FROM library ORDER BY ranking DESC, acronym ASC, term ASC, definition ASC", function (err, result) {
            console.log(result);
            string = result;
            res.send(string);
          });
        });
    }
  });
});

app.get('/delete', function (req, res, next) {
  var context = {};
  var idVar = req.query.id;
  pool.query("DELETE FROM library WHERE id = $1;", [req.query.id], function (err, result) {
    console.log(typeof req.query.id);
    console.log(err);
    if (err) {
      next(err);
      return;
    }
    context.results = "Deleted " + result.changedRows + " rows.";
    string = "Deleted " + result.changedRows + " rows.";
    res.send(string);
  });
});


app.get('/update', function (req, res, next) {
  var context = {};
  pool.query("SELECT * FROM library WHERE id = $1", [req.query.id], function (err, result) {
    if (err) {
      next(err);
      return;
    }
    console.log(result);
    if (result.rowCount === 1) {
      var curVals = result.rows[0];
      console.log(curVals);
      pool.query("UPDATE library SET acronym=$1, term=$2, definition=$3, ranking=$4 WHERE id=$5",
        [req.query.acronym || curVals.acronym, req.query.term || curVals.term, req.query.definition || curVals.definition, req.query.ranking || curVals.ranking, req.query.id],
        function (err, result) {
          if (err) {
            next(err);
            return;
          }
          pool.query("SELECT * FROM library ORDER BY ranking DESC, acronym ASC, term ASC, definition ASC", function (err, result) {
            console.log(result);
            string = result;
            res.send(string);
          });
        });
    }
  });
});

//Error Handling
app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

//Port
app.listen(app.get('port'), function () {
  console.log('Express started' + '; press Ctrl-C to terminate.');
});
