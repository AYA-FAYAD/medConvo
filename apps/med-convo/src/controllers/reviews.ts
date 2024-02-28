import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

module.exports.addReview = async (req, res) => {
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

  const currentUser = req.user.id;
  const { body, rating } = req.body.review;
  const review = await prisma.review.create({
    data: {
      body: body,
      rating: parseInt(rating),
      conferenceschemaId: conferenceId,
      authorId: currentUser,
    },
    include: {
      author: true,
    },
  });

  req.flash('success', 'Successfully made a new review');
  res.redirect(`/conference/${conferenceId}`);
};

module.exports.deleteReviw = async (req, res) => {
  await prisma.conferenceschema.delete({
    where: {
      id: parseInt(req.params.id),
    },
  });
  req.flash('success', 'Successfully delete conferences');
  res.redirect('/conferences');
};
