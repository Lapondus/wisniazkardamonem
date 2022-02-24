const Recenzja = require('../models/recenzja');                     //Importuje Bazy danych i szablony z lokalizacja.js i produkt.js oba połączone pod mongoose (nie mongo)
const LetniProdukt = require('../models/letni_produkt');                     //Importuje Bazy danych i szablony z lokalizacja.js i produkt.js oba połączone pod mongoose (nie mongo)

module.exports.createRecenzja = async (req, res) => {
    const produkt = await LetniProdukt.findById(req.params.id);
    const recenzja = new Recenzja(req.body.recenzja);
    recenzja.author = req.user._id;
    produkt.recenzje.push(recenzja);
    await recenzja.save();
    await produkt.save();
    req.flash('success', 'Pomyślnie dodano nową recenzję!');
    res.redirect(`/kolekcja_letnia/${produkt._id}`);
}
module.exports.destroyRecenzja = async (req, res) => {
    const { id, recenzjaId } = req.params;
    await LetniProdukt.findByIdAndUpdate(id, { $pull: { recenzje: recenzjaId } });                            ////$pull jakis specyficzny dla mongoose element pozwalający robić to co po lewej
    await Recenzja.findByIdAndDelete(recenzjaId);
    req.flash('success', 'Pomyślnie usunięto recenzję!');
    res.redirect(`/kolekcja_letnia/${id}`);
}