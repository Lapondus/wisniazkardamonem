const Recenzja = require('./models/recenzja');                     //Importuje Bazy danych i szablony z lokalizacja.js i produkt.js oba połączone pod mongoose (nie mongo)
const { uzytkownikRSchema, uzytkownikLSchema, letniProduktSchema, zimowyProduktSchema, lokalizacjaSchema, recenzjaSchema } = require('./schemasjoi');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAdmin = async (req, res, next) => {
    if (!(req.user.role == 'admin')) {
        req.flash('error', 'Nie możesz tego zrobić');
        return res.redirect('/');
    }
    next();
};

module.exports.isReviewAuthorOrAdmin = async (req, res, next) => {
    const { recenzjaId } = req.params;
    const recenzja = await Recenzja.findById(recenzjaId);
    if (!((recenzja.author.equals(req.user._id)) || req.user.role == 'admin')) {
        req.flash('error', 'Nie możesz tego zrobić');
        return res.redirect('/');
    }
    next();
};

module.exports.validateURForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = uzytkownikRSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateULForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = uzytkownikLSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateLForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = letniProduktSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateZForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = zimowyProduktSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateLokForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = lokalizacjaSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

module.exports.validateRForm = (req, res, next) => {                                                 //sprawdzam poprawność
    const { error } = recenzjaSchema.validate(req.body);
    if (error) {                                                                        //sprawdzam czy nie wyskoczył error
        const msg = error.details.map(el => el.message).join(',');                      //ehh generalnie error ma informacje o sb w formie tablicy a map wyświetli to po przecinku 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};