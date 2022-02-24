const Uzytkownik = require('../models/uzytkownik');
module.exports.renderRegister = (req, res) => {
    res.render('uzytkownicy/register');
}
module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const uzytkownik = await new Uzytkownik({ email, username });
        const zarejestrowany = await Uzytkownik.register(uzytkownik, password);
        req.login(zarejestrowany, err => {
            if (err) return next(err);
            req.flash('success', 'Witaj w Wiśni z kardamonem!');
            res.redirect('/')
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    };
}
module.exports.renderLogin = (req, res) => {
    res.render('uzytkownicy/login');
}
module.exports.login = (req, res) => {
    req.flash('success', 'Witaj ponownie!');
    const redirectUrl = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}
module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "Do zobaczenia!");
    res.redirect('/');
}