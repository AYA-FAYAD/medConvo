import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

module.exports.isLoggedIn = async (req, res, next) => {
  req.session.returnTO = req.originalUrl;
  try {
    console.log('Inside guard', req.session.userId);

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
