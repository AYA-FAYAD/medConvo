/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

console.log(process.env.scret);

const ejsMate = require('ejs-mate');
import express from 'express';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as path from 'path';
import { error } from 'console';
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const multer = require('multer');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressErorr');
const conferences = require('./controllers/conferences');
const reviews = require('./controllers/reviews');
const users = require('./controllers/users');
const { storage } = require('./cloudinary/index');
const upload = multer({ storage });
const methodOverride = require('method-override');
const { conferenceSchema, reviewSchema } = require('./convoschema');
const {
  isLoggedIn,
  validateconferences,
  validatereviwe,
  isAuthor,
} = require('./middellware');

// import {  } from './views';

async function main() {
  console.log('Database connected');
}
main()
  .catch((e) => {
    console.log(e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const app = express();
//  for lyaot
app.set('view engine', 'ejs');
// app.use('views', express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'apps', 'med-convo', 'views'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/assets', express.static(path.join(__dirname, './assets')));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: 'thisshouldbebettersecret',
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

app.use(flash());

app.use((req: any, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.session.userId;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// Convert price to an integer
const priceInt = (conference) => {
  if ('price' in conference) {
    conference.price = parseInt(conference.price);
  }
};
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/conferences', catchAsync(conferences.index));

app.get('/conferences/new', isLoggedIn, catchAsync(conferences.renderNewForm));

app.post(
  '/conferences',
  upload.array('image'),
  isLoggedIn,
  validateconferences,
  catchAsync(conferences.createConferences)
);

app.get('/conference/:id', catchAsync(conferences.renderShow));

app.get(
  '/conferences/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(conferences.renderEditForm)
);

app.put(
  '/conference/:id',
  upload.array('image'),
  isLoggedIn,
  isAuthor,
  // validateconferences,
  catchAsync(conferences.editForm)
);

// Reviws:
app.post(
  '/conference/:id/reviews',
  validatereviwe,
  isLoggedIn,
  catchAsync(reviews.addReview)
);

// delete
app.delete('/conference/:id', catchAsync(reviews.deleteReviw));

app.delete('/conference/:id/reviews/:reviewId', catchAsync(conferences.delete));

// Auth
app.get('/register', users.renderRegister);

app.post('/register', catchAsync(users.registerForm));

app.get('/login', users.renderLogin);

app.post('/login', catchAsync(users.loginForm));

app.get('/logout', users.logout);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh No, Somthing Went Wrong ';
  res.status(statusCode).render('error', { err });
  //  res.status(statusCode).send(message);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
