const express = require('express');
const router = express.Router({ mergeParams: true });               //Bardzo ważne ponieważ express router zabrał id do prefixu to nie mamy do niego dostępu bez mergowania wszystkich params

const recenzje = require('../controllers/zimowerecenzje');

const { isLoggedIn, isReviewAuthorOrAdmin, validateRForm } = require('../middleware')

const catchAsync = require('../utils/catchAsync');

//-----------------------------------------------------------------------------------------------------------Routes

router.post('/', isLoggedIn, validateRForm, catchAsync(recenzje.createRecenzja));

router.delete('/:recenzjaId', isLoggedIn, isReviewAuthorOrAdmin, catchAsync(recenzje.destroyRecenzja));

module.exports = router;