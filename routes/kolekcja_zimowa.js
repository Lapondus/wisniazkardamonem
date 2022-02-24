const express = require('express');
const router = express.Router();
const zimoweprodukty = require('../controllers/zimoweprodukty');            //controllers, MVC - Model, Views, Controllers
const multer = require('multer');                                           //i multer dla dodawania zdj
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const { isLoggedIn, isAdmin, validateZForm } = require('../middleware')

const catchAsync = require('../utils/catchAsync');

//-----------------------------------------------------------------------------------------------------------Routes

router.route('/')
    .get(catchAsync(zimoweprodukty.index))
    .post(isLoggedIn, isAdmin, upload.array('zdjęcia'), validateZForm, catchAsync(zimoweprodukty.createProdukt));               //zamienić validate form z upload

router.get('/nowy', isLoggedIn, isAdmin, zimoweprodukty.renderNewForm);

router.route('/:id')
    .get(catchAsync(zimoweprodukty.showProdukt))
    .put(isLoggedIn, isAdmin, upload.array('zdjęcia'), validateZForm, catchAsync(zimoweprodukty.updateProdukt))               //zamienić validate form z upload
    .delete(isLoggedIn, isAdmin, catchAsync(zimoweprodukty.destroyProdukt));


router.get('/:id/edytuj', isLoggedIn, isAdmin, catchAsync(zimoweprodukty.renderEditForm));

module.exports = router;