const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const uzytkownicy = require('../controllers/uzytkownicy');
const { validateURForm, validateULForm, isLoggedIn } = require('../middleware');

router.route('/register')
    .get(uzytkownicy.renderRegister)
    .get(validateURForm, catchAsync(uzytkownicy.register));

router.route('/login')
    .get(uzytkownicy.renderLogin)
    .post(validateULForm, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), uzytkownicy.login);

router.get('/logout', isLoggedIn, uzytkownicy.logout);

module.exports = router;