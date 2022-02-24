const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true}};

const LokalizacjaSchema = new Schema({                                  //tworzę nowy szablon (przedstawia wygląd danych w danym dokumencie)
    miejscowość: String,
    miejsce: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    dostępność: String,
    opis: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Uzytkownik'
    }
}, opts)  //dzięki temu właściwości wirtualnej klasy po konwersji z obiekt json na obiekt js będą rzeczywiście przeniesione na ten obiekt a nie tylko dostępne na obiekcie json (z mongoose), gdyż mongoose normalnie nie zapewnia tej funkcjonalności

LokalizacjaSchema.virtual('properties.popUpMarkup').get(function () {                  //virtualna klasa chyba z js, żeby mapbox otrzymywał objekt z dodatkową właściwością . properties
    return `<strong><a class="text-decoration-underline" href="/lokalizacje/${this._id}">${this.miejscowość}</a></strong>
    <p>${this.miejsce}</p>`;
});

module.exports = mongoose.model('Lokalizacja', LokalizacjaSchema)       //tworze model, co równoznaczne jest z utworzeniem kolekcji Model--> models