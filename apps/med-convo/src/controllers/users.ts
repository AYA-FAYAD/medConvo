import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

module.exports.renderRegister = (req, res) => {
  res.render('user/register');
};

module.exports.registerForm = async (req, res) => {
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
};

module.exports.renderLogin = (req, res) => {
  res.render('user/login');
};

module.exports.loginForm = async (req, res) => {
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
};

module.exports.logout = (req: any, res) => {
  req.session.destroy((err) => {
    if (err) throw new Error(err);
    return res.redirect('/conferences');
  });
};
