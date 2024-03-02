import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const { cloudinary } = require('../cloudinary/index');

// Convert price to an integer
const priceInt = (conference) => {
  if ('price' in conference) {
    conference.price = parseInt(conference.price);
  }
};
module.exports.index = async (req, res) => {
  const conferences = await prisma.conferenceschema.findMany({
    include: { images: true },
  });
  res.render('conference/index', { conferences });
};

module.exports.renderNewForm = async (req: any, res) => {
  res.render('conference/new');
};

module.exports.createConferences = async (req, res, next) => {
  const conferenceData = req.body.conference;

  conferenceData.authors = { connect: { id: req.user.id } };
  priceInt(conferenceData);

  const conference = await prisma.conferenceschema.create({
    data: conferenceData,
  });
  console.log(conference);

  const images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
    conferenceschemaId: conference.id,
  }));

  // Create images for the conference
  const image = await prisma.image.createMany({
    data: images,
  });
  console.log(images);

  req.flash('success', 'Successfully made a new conferences');
  return res.redirect(`/conference/${conference.id}`);
};

module.exports.renderShow = async (req, res) => {
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
      images: true,
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

  // const isAuthorReview = reviews.author.some(
  //   (author) => review.author === currentUser
  // );

  res.render('conference/show', {
    conference,
    currentUser,
    isAuthor,
    images: conference.images,
  });
};

module.exports.renderEditForm = async (req, res) => {
  const conference = await prisma.conferenceschema.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
    include: {
      images: true,
    },
  });
  if (!conference) {
    req.flash('error', 'Cannot find that conference');
    return res.redirect('/conferences');
  }

  res.render('conference/edit', { conference, images: conference.images });
};

module.exports.editForm = async (req: any, res) => {
  const conferenceData = req.body.conference;
  const conferenceId = parseInt(req.params.id);
  console.log('req.body:', req.body);

  const files = req.files;
  const public_id = `MedConvo/${files.filename}`;

  // console.log(files);

  priceInt(conferenceData);
  const updatedConference = await prisma.conferenceschema.update({
    where: { id: conferenceId },
    data: conferenceData,
  });

  if (files && files.length > 0) {
    await cloudinary.uploader.destroy(public_id);
    await prisma.image.deleteMany({
      where: { conferenceschemaId: conferenceId },
    });
    const images = files.map((file) => ({
      url: file.path,
      filename: file.filename,
      conferenceschemaId: conferenceId,
    }));
    console.log(images);
    await prisma.image.createMany({
      data: images,
    });
  }

  req.flash('success', 'Successfully updated the conference');
  res.redirect(`/conference/${updatedConference.id}`);
};

module.exports.delete = async (req, res) => {
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
};
