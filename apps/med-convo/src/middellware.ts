import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const ExpressError = require('./utils/expressErorr');
const { conferenceSchema, reviewSchema } = require('./convoschema');

module.exports.isLoggedIn = async (req, res, next) => {
  req.session.returnTO = req.originalUrl;
  try {
    // console.log('Inside guard', req.session.userId);

    if (!req.session.userId) {
      req.flash('error', 'You must be signed in');
      return res.redirect('/login');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
    });

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/login');
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('middelware error', error);
  }
};

module.exports.validateconferences = (req, res, next) => {
  const { error } = conferenceSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const conference = await prisma.conferenceschema.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      reviews: true,
      authors: true,
    },
  });
  const currentUser = req.session.userId;
  const isAuthor = conference.authors.some(
    (author) => author.id === currentUser
  );
  if (!isAuthor) {
    req.flash('error', 'You dont have permission to do that');
    return res.redirect(`/conference/${conference.id}`);
  }
  next();
};

module.exports.validatereviwe = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
