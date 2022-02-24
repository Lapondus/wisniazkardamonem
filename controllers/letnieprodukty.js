const LetniProdukt = require('../models/letni_produkt');                    //Importuje Bazy danych i szablony z lokalizacja.js i produkt.js oba połączone pod mongoose (nie mongo)
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {                               //Wszystkie produkty --- załadowuje stronę z tablicą (?) produktów (każdy z nich jest obiektem)
    const produkty = await LetniProdukt.find({});
    res.render('kolekcja_letnia/index', { produkty });
}
module.exports.renderNewForm = (req, res) => {                                 //Z wszystkich produktów --> załadowuje formularz nowego produktu, który odsyła potem do strony nowego produktów
    res.render('kolekcja_letnia/nowy');
}
module.exports.createProdukt = async (req, res) => {                              //Z formularza nowego produktu --> do strony nowego produktu (pokaz)
    const produkt = new LetniProdukt(req.body.produkt);                      // pobiera obiekt z req i zapisuje go jako nowy produkt
    produkt.zdjęcia = req.files.map(f => ({ url: f.path, filename: f.filename }));                  ////!!!!!!!!!!!!!!!ZROBIĆ walidację na ilość zdjęć max, oraz ich rozmiar
    produkt.author = req.user._id;
    await produkt.save();
    req.flash('success', 'Pomyślnie utworzono nowy produkt!');
    res.redirect(`/kolekcja_letnia/${produkt._id}`);                           //REDIRECT do pokaz (bo przy tworzeniu nie można się powołać na nieistniejące id (w przeciwieństwie do edytuj)
}
module.exports.showProdukt = async (req, res) => {                            //Z wszystkich produktów --> załadowuje stronę wybranego (poprzez link na nazwie)
    const produkt = await LetniProdukt.findById(req.params.id).populate({
        path: 'recenzje',
        populate: {
            path: 'author',
            select: ['username', 'role'],
        }
    }).populate({
        path: 'author',
        select: ['username', 'role']
    });              // uniwersalny szablon dla wszystkich pokazów produktów//populate sprawia ze tablice z id recenzji zmieniaja sie w tablice recenzji dolaczony do objektu produktu letniego
    if (!produkt) {
        req.flash('error', 'Szukany produkt nie istnieje!');
        return res.redirect('/kolekcja_letnia');
    }
    res.render('kolekcja_letnia/pokaz', { produkt });
}
module.exports.renderEditForm = async (req, res) => {                     //Ze strony danego produktu (pokaz)--> do formularza z edycją owego produktu
    const produkt = await LetniProdukt.findById(req.params.id)               // przy pomocy id elementu załadowanego w pokaz
    if (!produkt) {
        req.flash('error', 'Szukany produkt nie istnieje!');
        return res.redirect('/kolekcja_letnia');
    }
    res.render('kolekcja_letnia/edytuj', { produkt });                           // uniwersalny szablon dla wszystkich edycji produktów
}
module.exports.updateProdukt = async (req, res) => {                           //Z formularza edycji produktu --> do strony uaktualnionego produktu (pokaz)
    const { id } = req.params;
    const produkt = await LetniProdukt.findByIdAndUpdate(id, { ...req.body.produkt });                 //Uaktualnienie produktu w bazie danych 
    const zdjęcia = req.files.map(f => ({ url: f.path, filename: f.filename }));        ////!!!!!!!!!!!!!!!ZROBIĆ walidację na ilość zdjęć max, oraz ich rozmiar
    produkt.zdjęcia.push(...zdjęcia);                                               //to nazywa się spread i pozwala dołączać po jednym elementcie zamiast wepchnąć całą tablicę jako jeden element
    await produkt.save();
    if (req.body.usuńZdjęcia) {
        for (let filename of req.body.usuńZdjęcia) {
            await cloudinary.uploader.destroy(filename);
        }
        await produkt.updateOne({ $pull: { zdjęcia: { filename: { $in: req.body.usuńZdjęcia } } } });
    }
    req.flash('success', 'Pomyślnie uaktualniono nowy produkt!');
    res.redirect(`/kolekcja_letnia/${id}`);                                    //REDIRECT do pokaz
}
module.exports.destroyProdukt = async (req, res) => {                        //Z strony pokazowej produktu do wszystkich produktów
    await LetniProdukt.findByIdAndDelete(req.params.id);                     //usunięcie produktu z bazy danych, pamiętać że mongoose middleware powiązane jest z specyficznym operatorem find... tutaj i zmiana jego wymaga zmiany middleware
    req.flash('success', 'Pomyślnie usunięto produkt!');
    res.redirect('/kolekcja_letnia');                                          //REDIRECT do wszystkich produktów
}