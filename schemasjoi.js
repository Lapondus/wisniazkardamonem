const BaseJoi = require('joi');                                             //Javascript validator, czy coś, pomoże weryfikować poprawność i kompletność formularzy
const sanitizeHtml = require('sanitize-html');

//żeby uniknąć problemu XSS np. na show page lokalizacji gdzie ejs ma <%- zamiast <%= więc nie ucieka htmlowii można teoretycznie w nazwie lokalizacji dodać skrypt który uruchomi się na mapie
//mógłbym zamiast joi użyć expressvalidator ale ponoć ma słaby syntax więc napisałem własne rozszerzenie do joi
//generalnie dopisuję zgodnie z docsami nową funkcję do joi.string()

const extension = (joi) =>({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML:{
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {                                                     //to też zewnętrzny dependency, który wywala ze stringów elementy html css czy js
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !==value) return helpers.error('string.escapeHTML', {value});
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension);

const zimowyProduktSchema = Joi.object({                                            //schema dla joi, dla formularzy z kolekcji zimowej
    produkt: Joi.object({                                                           //definiuję że produkt to musi być obiekt
        nazwa: Joi.string().required().escapeHTML(),
        rozmiar: Joi.string().required().escapeHTML(),
        cena: Joi.number().required().min(0),
        // zdjęcie: Joi.string().required().escapeHTML(),
        opis: Joi.string().required().escapeHTML(),
        dostępność: Joi.string().required().escapeHTML(),
    }).required(),                                                                   //definiuję że produkt musi w ogóle być
    zdjęcia: Joi.array(),
    usuńZdjęcia: Joi.array()
});

const letniProduktSchema = Joi.object({                                            //schema dla joi, dla formularzy z kolekcji letniej
    produkt: Joi.object({                                                           //definiuję że produkt to musi być obiekt
        nazwa: Joi.string().required().escapeHTML(),
        // zdjęcie: Joi.string().required().escapeHTML(),
        cena: Joi.number().required().min(0),
        opis: Joi.string().required().escapeHTML(),
        dostępność: Joi.string().required().escapeHTML(),
    }).required(),
    zdjęcia: Joi.array(),
    usuńZdjęcia: Joi.array()                                                                 //definiuję że produkt musi w ogóle być
});

const lokalizacjaSchema = Joi.object({
    lokalizacja: Joi.object({
        miejscowość: Joi.string().required().escapeHTML(),
        dostępność: Joi.string().required().escapeHTML(),
        opis: Joi.string().required().escapeHTML(),
        miejsce: Joi.string().required().escapeHTML(),
    }).required()
});

const uzytkownikRSchema = Joi.object({
    username: Joi.string().required().escapeHTML(),
    email: Joi.string().required().email().escapeHTML(),
    password: Joi.string().required().min(8).escapeHTML(),
});

const uzytkownikLSchema = Joi.object({
    username: Joi.string().required().escapeHTML(),
    password: Joi.string().required().escapeHTML(),
});

module.exports.zimowyProduktSchema = zimowyProduktSchema;
module.exports.letniProduktSchema = letniProduktSchema;
module.exports.lokalizacjaSchema = lokalizacjaSchema;
module.exports.uzytkownikRSchema = uzytkownikRSchema;
module.exports.uzytkownikLSchema = uzytkownikLSchema;
module.exports.recenzjaSchema = Joi.object({
    recenzja: Joi.object({
        ocena: Joi.number().required().min(1).max(5).integer(),
        body: Joi.string().required().escapeHTML()
    }).required()
});
