const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UzytkownikSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    }
});
UzytkownikSchema.plugin(passportLocalMongoose);                     //dodaje automatycznie do schema'y pole na login i haslo, oraz kilka metod

// handling the unique email error
UzytkownikSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000 && error.keyValue.email) {
        next(new Error('Email address was already taken, please choose a different one.'));
    } else {
        next(error);
    }
});

module.exports = mongoose.model('Uzytkownik', UzytkownikSchema);