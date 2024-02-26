/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
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
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressErorr');
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

app.get(
  '/conferences',
  catchAsync(async (req, res) => {
    const conferences = await prisma.conferenceschema.findMany({});
    res.render('conference/index', { conferences });
  })
);

app.get(
  '/conferences/new',
  isLoggedIn,
  catchAsync(async (req: any, res) => {
    res.render('conference/new');
  })
);

app.post(
  '/conferences',
  isLoggedIn,
  validateconferences,
  catchAsync(async (req, res, next) => {
    const conferenceData = req.body.conference;
    conferenceData.authors = { connect: { id: req.user.id } };
    priceInt(conferenceData);
    const conference = await prisma.conferenceschema.create({
      data: conferenceData,
    });
    req.flash('success', 'Successfully made a new conferences');
    return res.redirect(`/conference/${conference.id}`);
  })
);

app.get(
  '/conference/:id',
  catchAsync(async (req, res) => {
    const conference = await prisma.conferenceschema.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        reviews: {
          include: {
            author: true,
          },
        },
        authors: true,
      },
    });
    const currentUser = parseInt(req.session.userId);

    if (!conference) {
      req.flash('error', 'Cannot find that conference');
      return res.redirect('/conferences');
    }
    const isAuthor = conference.authors.some(
      (author) => author.id === currentUser
    );

    // console.log(isAuthor);

    // const isAuthorReview = conference.reviews.map((review) =>
    //   review.author.filter((author) => {
    //     console.log('author', author);

    //     return author.id === currentUser;
    //   })
    // );
    const isAuthorReview = conference.reviews
      .flatMap((review) => review.author) // Flatten the array of arrays
      .map((author) => author.id);
    console.log('Author IDs:', isAuthorReview);
    const isCurrentUserReview = isAuthorReview.map((id) => id === currentUser);
    console.log(isCurrentUserReview);

    res.render('conference/show', {
      conference,
      currentUser,
      isAuthor,
      isAuthorReview,
      isCurrentUserReview,
    });
  })
);

app.get(
  '/conferences/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const conference = await prisma.conferenceschema.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (!conference) {
      req.flash('error', 'Cannot find that conference');
      return res.redirect('/conferences');
    }

    res.render('conference/edit', { conference });
  })
);

app.put(
  '/conference/:id',
  isLoggedIn,
  isAuthor,
  validateconferences,
  catchAsync(async (req, res) => {
    const conferenceData = req.body.conference;

    priceInt(conferenceData);

    const conference = await prisma.conferenceschema.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: conferenceData,
    });

    req.flash('success', 'Successfully updated the conference');
    res.redirect(`/conference/${conference.id}`);
  })
);

// Reviws:
app.post(
  '/conference/:id/reviews',
  validatereviwe,
  isLoggedIn,
  catchAsync(async (req, res) => {
    const conferenceId = parseInt(req.params.id);
    const conference = await prisma.conferenceschema.findUnique({
      where: {
        id: conferenceId,
      },
      include: {
        reviews: true,
        authors: true,
      },
    });
    // console.log(conference);

    const currentUser = req.user;
    const { body, rating } = req.body.review;
    const review = await prisma.review.create({
      data: {
        body: body,
        rating: parseInt(rating),
        conferenceschemaId: conferenceId,
        author: { connect: { id: currentUser.id } },
      },
      include: {
        author: true,
      },
    });

    req.flash('success', 'Successfully made a new review');
    res.redirect(`/conference/${conferenceId}`);
  })
);

// delete
app.delete(
  '/conference/:id',
  catchAsync(async (req, res) => {
    await prisma.conferenceschema.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    req.flash('success', 'Successfully delete conferences');
    res.redirect('/conferences');
  })
);

app.delete(
  '/conference/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    console.log(id, reviewId);

    await prisma.review.delete({
      where: {
        conferenceschemaId: parseInt(id),
        id: parseInt(reviewId),
      },
    });
    req.flash('success', 'Successfully delete review');
    res.redirect(`/conference/${id}`);
  })
);

// Auth
app.get('/register', (req, res) => {
  res.render('user/register');
});

app.post(
  '/register',
  catchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hashedPassword,
        },
      });

      req.flash('success', 'Please login to continue!');
      return res.redirect('/login');
    } catch (e) {
      req.flash('error', 'somthing wrong try again');
      return res.redirect('/register');
    }
  })
);

app.get('/login', (req, res) => {
  res.render('user/login');
});

app.post(
  '/login',
  catchAsync(async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        req.flash('error', 'user not found');
        return res.redirect('/login');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        req.flash('error', '  Invalid Username Password  Try Again');
        return res.redirect('/login');
      }
      req.session.userId = user.id;

      req.session.save((err) => {
        if (err) throw new Error(err);

        req.flash('success', `Welcome ${username}`);
        res.redirect(req.session.returnTO || '/conferences');
      });
    } catch (error) {
      req.flash('error', error.message);
      return res.redirect('/login');
    }
  })
);

app.get('/logout', (req: any, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err);
    return res.redirect('/conferences');
  });
});

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
