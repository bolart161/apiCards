let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;
let mongo = require('mongodb');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/cards', (req, res) => {
  let card = req.body;

  db.collection('cardsForQr').insertOne(card, function (err) {
    if (err) {
      console.log(err);
      return res.sendStatus(404);
    }
    return res.json({url: 'http://localhost:3012/getCard/' + card._id});
  });
});

app.get('/getCard/:id', (req, res) => {
  let id = new mongo.ObjectId(req.params.id);

  db.collection('cardsForQr').findOneAndDelete({ _id: id })
    .then(foundedCard => {
      return res.status(200).json(foundedCard);
    })
    .catch(err => console.log(err));
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

MongoClient.connect('mongodb://localhost:27017/myapi', { useNewUrlParser: true }, function (err, database) {
  if (err) {
    return console.log(err);
  }
  db = database.db('cards');

  app.listen(3013, function () {
    console.log('Api app started');
  })
});

module.exports = app;
