import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
  const isAuthorReview = conference.reviews
    .flatMap((review) => review.author) // flatten the array of arrays
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

  res.render('conference/edit', { conference });
};

module.exports.editForm = async (req: any, res) => {
  const { conference: conferenceData, files } = req.body;
  const conferenceId = parseInt(req.params.id);

  console.log(files);

  // Update conference data
  priceInt(conferenceData);
  const updatedConference = await prisma.conferenceschema.update({
    where: { id: conferenceId },
    data: conferenceData,
  });

  // Update images if files are provided
  if (files && files.length > 0) {
    // Delete existing images associated with the conference
    await prisma.image.deleteMany({
      where: { conferenceschemaId: conferenceId },
    });

    // Create new images for the conference
    const images = files.map((file) => ({
      url: file.path,
      filename: file.filename,
      conferenceschema: { connect: { id: conferenceId } }, // Associate the image with the conference
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
