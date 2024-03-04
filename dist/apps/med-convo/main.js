/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("dotenv");

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("ejs-mate");

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("helmet");

/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = require("@quixo3/prisma-session-store");

/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),
/* 8 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 9 */
/***/ ((module) => {

"use strict";
module.exports = require("express-session");

/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = require("connect-flash");

/***/ }),
/* 11 */
/***/ ((module) => {

"use strict";
module.exports = require("bcrypt");

/***/ }),
/* 12 */
/***/ ((module) => {

"use strict";
module.exports = require("multer");

/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};


/***/ }),
/* 14 */
/***/ ((module) => {

// interface ExpressError extends Error{
//     statusCode ?: number;
// }
class expressErorr extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}
// interface ExpressError {
//     message: string;
//     statusCode?: number;
// }
// class expressErorr extends Error implements ExpressError {
//     constructor(message: string, public statusCode?: number) {
//         super(message);
//     }
// }
module.exports = expressErorr;


/***/ }),
/* 15 */
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const client_1 = __webpack_require__(7);
const prisma = new client_1.PrismaClient();
const { cloudinary } = __webpack_require__(16);
// Convert price to an integer
const priceInt = (conference) => {
    if ('price' in conference) {
        conference.price = parseInt(conference.price);
    }
};
module.exports.index = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conferences = yield prisma.conferenceschema.findMany({
        include: { images: true },
    });
    res.render('conference/index', { conferences });
});
module.exports.renderNewForm = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    res.render('conference/new');
});
module.exports.createConferences = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conferenceData = req.body.conference;
    conferenceData.authors = { connect: { id: req.user.id } };
    priceInt(conferenceData);
    const conference = yield prisma.conferenceschema.create({
        data: conferenceData,
    });
    console.log(conference);
    const images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
        conferenceschemaId: conference.id,
    }));
    // Create images for the conference
    const image = yield prisma.image.createMany({
        data: images,
    });
    console.log(images);
    req.flash('success', 'Successfully made a new conferences');
    return res.redirect(`/conference/${conference.id}`);
});
module.exports.renderShow = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conference = yield prisma.conferenceschema.findUnique({
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
    const isAuthor = conference.authors.some((author) => author.id === currentUser);
    // const isAuthorReview = reviews.author.some(
    //   (author) => review.author === currentUser
    // );
    res.render('conference/show', {
        conference,
        currentUser,
        isAuthor,
        images: conference.images,
    });
});
module.exports.renderEditForm = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conference = yield prisma.conferenceschema.findUnique({
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
});
module.exports.editForm = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conferenceData = req.body.conference;
    const conferenceId = parseInt(req.params.id);
    console.log('req.body:', req.body);
    const files = req.files;
    const public_id = `MedConvo/${files.filename}`;
    // console.log(files);
    priceInt(conferenceData);
    const updatedConference = yield prisma.conferenceschema.update({
        where: { id: conferenceId },
        data: conferenceData,
    });
    if (files && files.length > 0) {
        yield cloudinary.uploader.destroy(public_id);
        yield prisma.image.deleteMany({
            where: { conferenceschemaId: conferenceId },
        });
        const images = files.map((file) => ({
            url: file.path,
            filename: file.filename,
            conferenceschemaId: conferenceId,
        }));
        console.log(images);
        yield prisma.image.createMany({
            data: images,
        });
    }
    req.flash('success', 'Successfully updated the conference');
    res.redirect(`/conference/${updatedConference.id}`);
});
module.exports["delete"] = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id, reviewId } = req.params;
    console.log(id, reviewId);
    yield prisma.review.delete({
        where: {
            conferenceschemaId: parseInt(id),
            id: parseInt(reviewId),
        },
    });
    req.flash('success', 'Successfully delete review');
    res.redirect(`/conference/${id}`);
});


/***/ }),
/* 16 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const cloudinary = (__webpack_require__(17).v2);
const { CloudinaryStorage } = __webpack_require__(18);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'MedConvo',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    },
});
module.exports = {
    cloudinary,
    storage,
};


/***/ }),
/* 17 */
/***/ ((module) => {

"use strict";
module.exports = require("cloudinary");

/***/ }),
/* 18 */
/***/ ((module) => {

"use strict";
module.exports = require("multer-storage-cloudinary");

/***/ }),
/* 19 */
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const client_1 = __webpack_require__(7);
const prisma = new client_1.PrismaClient();
module.exports.addReview = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conferenceId = parseInt(req.params.id);
    const conference = yield prisma.conferenceschema.findUnique({
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
    const review = yield prisma.review.create({
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
});
module.exports.deleteReviw = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield prisma.conferenceschema.delete({
        where: {
            id: parseInt(req.params.id),
        },
    });
    req.flash('success', 'Successfully delete conferences');
    res.redirect('/conferences');
});


/***/ }),
/* 20 */
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const client_1 = __webpack_require__(7);
const prisma = new client_1.PrismaClient();
const bcrypt = __webpack_require__(11);
module.exports.renderRegister = (req, res) => {
    res.render('user/register');
};
module.exports.registerForm = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = yield bcrypt.hash(password, 12);
        yield prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword,
            },
        });
        req.flash('success', 'Please login to continue!');
        return res.redirect('/login');
    }
    catch (e) {
        req.flash('error', 'somthing wrong try again');
        return res.redirect('/register');
    }
});
module.exports.renderLogin = (req, res) => {
    res.render('user/login');
};
module.exports.loginForm = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { username } });
        if (!user) {
            req.flash('error', 'user not found');
            return res.redirect('/login');
        }
        const validPassword = yield bcrypt.compare(password, user.password);
        if (!validPassword) {
            req.flash('error', '  Invalid Username Password  Try Again');
            return res.redirect('/login');
        }
        req.session.userId = user.id;
        req.session.save((err) => {
            if (err)
                throw new Error(err);
            req.flash('success', `Welcome ${username}`);
            res.redirect(req.session.returnTO || '/conferences');
        });
    }
    catch (error) {
        req.flash('error', error.message);
        return res.redirect('/login');
    }
});
module.exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err)
            throw new Error(err);
        return res.redirect('/conferences');
    });
};


/***/ }),
/* 21 */
/***/ ((module) => {

"use strict";
module.exports = require("method-override");

/***/ }),
/* 22 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const BaseJoi = __webpack_require__(23);
const sanitizeHtml = __webpack_require__(24);
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!',
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value)
                    return helpers.error('string.escapeHTML', { value });
                return clean;
            },
        },
    },
});
const Joi = BaseJoi.extend(extension);
module.exports.conferenceSchema = Joi.object({
    conference: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array(),
});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML(),
    }).required(),
});


/***/ }),
/* 23 */
/***/ ((module) => {

"use strict";
module.exports = require("joi");

/***/ }),
/* 24 */
/***/ ((module) => {

"use strict";
module.exports = require("sanitize-html");

/***/ }),
/* 25 */
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const client_1 = __webpack_require__(7);
const prisma = new client_1.PrismaClient();
const ExpressError = __webpack_require__(14);
const { conferenceSchema, reviewSchema } = __webpack_require__(22);
module.exports.isLoggedIn = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    req.session.returnTO = req.originalUrl;
    try {
        // console.log('Inside guard', req.session.userId);
        if (!req.session.userId) {
            req.flash('error', 'You must be signed in');
            return res.redirect('/login');
        }
        const user = yield prisma.user.findUnique({
            where: { id: req.session.userId },
        });
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/login');
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('middelware error', error);
    }
});
module.exports.validateconferences = (req, res, next) => {
    const { error } = conferenceSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};
module.exports.isAuthor = (req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const conference = yield prisma.conferenceschema.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            reviews: true,
            authors: true,
        },
    });
    const currentUser = req.session.userId;
    const isAuthor = conference.authors.some((author) => author.id === currentUser);
    if (!isAuthor) {
        req.flash('error', 'You dont have permission to do that');
        return res.redirect(`/conference/${conference.id}`);
    }
    next();
});
module.exports.validatereviwe = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
if (process.env.NODE_ENV !== 'production') {
    (__webpack_require__(2).config)();
}
console.log(process.env.scret);
const ejsMate = __webpack_require__(3);
const express_1 = tslib_1.__importDefault(__webpack_require__(4));
const helmet_1 = tslib_1.__importDefault(__webpack_require__(5));
const prisma_session_store_1 = __webpack_require__(6);
const client_1 = __webpack_require__(7);
const prisma = new client_1.PrismaClient();
const path = tslib_1.__importStar(__webpack_require__(8));
const session = __webpack_require__(9);
const flash = __webpack_require__(10);
const bcrypt = __webpack_require__(11);
const multer = __webpack_require__(12);
const catchAsync = __webpack_require__(13);
const ExpressError = __webpack_require__(14);
const conferences = __webpack_require__(15);
const reviews = __webpack_require__(19);
const users = __webpack_require__(20);
const { storage } = __webpack_require__(16);
const upload = multer({ storage });
const methodOverride = __webpack_require__(21);
const { conferenceSchema, reviewSchema } = __webpack_require__(22);
const { isLoggedIn, validateconferences, validatereviwe, isAuthor, } = __webpack_require__(25);
// import {  } from './views';
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log('Database connected');
    });
}
main()
    .catch((e) => {
    console.log(e.message);
})
    .finally(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
const app = (0, express_1.default)();
//  for lyaot
app.set('view engine', 'ejs');
// app.use('views', express.static(path.join(__dirname, 'views')));
app.set('views', path.join(__dirname, 'views'));
// app.set('views', path.join(__dirname, 'apps', 'med-convo', 'views'));
app.engine('ejs', ejsMate);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/assets', express_1.default.static(path.join(__dirname, './assets')));
app.use(session({
    cookie: {
        httpOnly: true,
        // secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: 'thisshouldbebettersecret',
    resave: true,
    saveUninitialized: true,
    store: new prisma_session_store_1.PrismaSessionStore(new client_1.PrismaClient(), {
        checkPeriod: 2 * 60 * 1000, //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
    }),
}));
app.use(flash());
app.use((0, helmet_1.default)());
const scriptSrcUrls = [
    'https://stackpath.bootstrapcdn.com',
    'https://api.tiles.mapbox.com',
    'https://api.mapbox.com',
    'https://kit.fontawesome.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net',
];
const styleSrcUrls = [
    'https://kit-free.fontawesome.com',
    'https://stackpath.bootstrapcdn.com',
    'https://api.mapbox.com',
    'https://api.tiles.mapbox.com',
    'https://fonts.googleapis.com',
    'https://use.fontawesome.com',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com',
];
const fontSrcUrls = [];
app.use(helmet_1.default.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ['blob:'],
        objectSrc: [],
        imgSrc: [
            "'self'",
            'blob:',
            'data:',
            'https://res.cloudinary.com/ddle2p6mr/',
            'https://images.unsplash.com',
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
    },
}));
app.use((req, res, next) => {
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
app.post('/conferences', upload.array('image'), isLoggedIn, validateconferences, catchAsync(conferences.createConferences));
app.get('/conference/:id', catchAsync(conferences.renderShow));
app.get('/conferences/:id/edit', isLoggedIn, isAuthor, catchAsync(conferences.renderEditForm));
app.put('/conference/:id', upload.array('image'), isLoggedIn, isAuthor, validateconferences, catchAsync(conferences.editForm));
// Reviws:
app.post('/conference/:id/reviews', validatereviwe, isLoggedIn, catchAsync(reviews.addReview));
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
    if (!err.message)
        err.message = 'Oh No, Somthing Went Wrong ';
    res.status(statusCode).render('error', { err });
    //  res.status(statusCode).send(message);
});
const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

})();

/******/ })()
;