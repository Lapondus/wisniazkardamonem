const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recenzjaSchema = new Schema({
    ocena: Number,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Uzytkownik'
    }
});

module.exports = mongoose.model("Recenzja", recenzjaSchema);