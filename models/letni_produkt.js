const mongoose = require('mongoose');
const Recenzja = require('./recenzja');
const Schema = mongoose.Schema;

const ZdjęcieSchema = new Schema({                                  //oddzielny schema ale nie model
    url: String,
    filename: String
});

ZdjęcieSchema.virtual('thumbnail').get(function () {                  //virtualna klasa chyba z js, żeby zdj z cloudinary przychodziły w określonej zmniejszonej wielkości dla edit form
    return this.url.replace('/upload', '/upload/w_200,h_200');                //korzystamy z replace dla array typu string ale możnaby korzytsać z regular expressions (z którego on chyba też korzystać może???)
});

const LetniProduktSchema = new Schema({                                      //tworzę nowy szablon (przedstawia wygląd danych w danym dokumencie)
    nazwa: String,
    zdjęcia: [ZdjęcieSchema],
    cena: Number,
    opis: String,
    dostępność: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Uzytkownik'
    },
    recenzje: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Recenzja'
        }
    ]
});

LetniProduktSchema.post('findOneAndDelete', async function (doc) {                   //middleware ale dla mongoose a nie express skomplikowane jeszcze bardziej, to akurat służy usunięciu komentarzy przy usunięciu produktu
    if (doc) {                                                                //doc na początku to odnaleziony usunięty obiekt
        await Recenzja.deleteMany({
            _id: {
                $in: doc.recenzje
            }
        })
    }
});

module.exports = mongoose.model('LetniProdukt', LetniProduktSchema)               //tworze model, co równoznaczne jest z utworzeniem kolekcji Model--> models