const express = require('express');
const router = express.Router();
const lokalizacje = require('../controllers/lokalizacje');            //controllers, MVC - Model, Views, Controllers

const { isLoggedIn, isAdmin, validateLokForm } = require('../middleware')

const catchAsync = require('../utils/catchAsync');

//-----------------------------------------------------------------------------------------------------------Routes

router.route('/')
    .get(catchAsync(lokalizacje.index))
    .post(isLoggedIn, isAdmin, validateLokForm, catchAsync(lokalizacje.createLokalizacja))

router.get('/nowa', isLoggedIn, isAdmin, lokalizacje.renderNewForm);

router.route('/:id')
    .get(catchAsync(lokalizacje.showLokalizacja))
    .put(isLoggedIn, isAdmin, validateLokForm, catchAsync(lokalizacje.updateLokalizacja))
    .delete(isLoggedIn, isAdmin, catchAsync(lokalizacje.destroyLokalizacja))

router.get('/:id/edytuj', isLoggedIn, isAdmin, catchAsync(lokalizacje.renderEditForm));

module.exports = router;