const express = require('express');
const router = express.Router();
const letnieprodukty = require('../controllers/letnieprodukty');            //controllers, MVC - Model, Views, Controllers
const multer = require('multer');                                           //i multer dla dodawania zdj
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { isLoggedIn, isAdmin, validateLForm } = require('../middleware');

const catchAsync = require('../utils/catchAsync');

//-----------------------------------------------------------------------------------------------------------Routes

router.route('/')
    .get(catchAsync(letnieprodukty.index))
    .post(isLoggedIn, isAdmin, upload.array('zdjęcia'), validateLForm, catchAsync(letnieprodukty.createProdukt));               //zamienić validate form z upload

router.get('/nowy', isLoggedIn, isAdmin, letnieprodukty.renderNewForm);

router.route('/:id')
    .get(catchAsync(letnieprodukty.showProdukt))
    .put(isLoggedIn, isAdmin, upload.array('zdjęcia'), validateLForm, catchAsync(letnieprodukty.updateProdukt))                 //zamienić validate form z upload
    .delete(isLoggedIn, isAdmin, catchAsync(letnieprodukty.destroyProdukt));

router.get('/:id/edytuj', isLoggedIn, isAdmin, catchAsync(letnieprodukty.renderEditForm));

module.exports = router;