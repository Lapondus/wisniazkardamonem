const Lokalizacja = require('../models/lokalizacja');                     //Importuje Bazy danych i szablony z lokalizacja.js i produkt.js oba połączone pod mongoose (nie mongo)
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {                            //Wszystkie lokalizacje --- załadowuje stronę z tablicą (?) lokalizacji (każdy z nich jest obiektem)
    const lokalizacje = await Lokalizacja.find({});
    res.render('lokalizacje/index', { lokalizacje });
}
module.exports.renderNewForm = (req, res) => {                            //Z wszystkich lokalizacji --> załadowuje formularz nowej lokalizacji, który odsyła potem do strony nowej lokalizacji
    res.render('lokalizacje/nowa');
}
module.exports.createLokalizacja = async (req, res) => {                           //Z formularza nowej lokalizacji --> do strony nowej lokalizacji (pokaz)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.lokalizacja.miejscowość + ' ' + req.body.lokalizacja.miejsce,
        limit: 1
    }).send();
    const lokalizacja = new Lokalizacja(req.body.lokalizacja);          // pobiera obiekt z req i zapisuje go jako nową lokalizację
    lokalizacja.geometry = geoData.body.features[0].geometry;
    lokalizacja.author = req.user._id;
    await lokalizacja.save();
    req.flash('success', 'Pomyślnie dodano nową lokalizację!');
    res.redirect(`/lokalizacje/${lokalizacja._id}`);                    //REDIRECT do pokaz (bo przy tworzeniu nie można się powołać na nieistniejące id (w przeciwieństwie do edytuj)
}
module.exports.showLokalizacja = async (req, res) => {                         //Z wszystkich lokalizacji --> załadowuje stronę wybranej (poprzez link na nazwie)
    const lokalizacja = await Lokalizacja.findById(req.params.id).populate({
        path: 'author',
        select: ['username', 'role']
    });              // uniwersalny szablon dla wszystkich pokazów produktów//populate sprawia ze tablice z id recenzji zmieniaja sie w tablice recenzji dolaczony do objektu produktu letniego
    if (!lokalizacja) {
        req.flash('error', 'Szukana lokalizacja nie istnieje!');
        return res.redirect('/lokalizacje');
    }
    res.render('lokalizacje/pokaz', { lokalizacja });
}
module.exports.renderEditForm = async (req, res) => {                 //Ze strony danej lokalizacji (pokaz)--> do formularza z edycją owej lokalizacji
    const lokalizacja = await Lokalizacja.findById(req.params.id)       // przy pomocy id elementu załadowanego w pokaz
    if (!lokalizacja) {
        req.flash('error', 'Szukana lokalizacja nie istnieje!');
        return res.redirect('/lokalizacje');
    }
    res.render('lokalizacje/edytuj', { lokalizacja });                    // uniwersalny szablon dla wszystkich edycji lokalizacji
}
module.exports.updateLokalizacja = async (req, res) => {                        //Z formularza edycji lokalizacji --> do strony uaktualnionej lokalizacji (pokaz)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.lokalizacja.miejscowość + ' ' + req.body.lokalizacja.miejsce,
        limit: 1
    }).send();
    const { id } = req.params;
    const lokalizacja = await Lokalizacja.findByIdAndUpdate(id, { ...req.body.lokalizacja })          //Uaktualnienie lokalizacji w bazie danych
    lokalizacja.geometry = geoData.body.features[0].geometry;
    await lokalizacja.save();
    req.flash('success', 'Pomyślnie zaktualizowano lokalizację!');
    res.redirect(`/lokalizacje/${id}`);                    //REDIRECT do pokaz
}
module.exports.destroyLokalizacja = async (req, res) => {                       //Z strony pokazowej lokalizacji do wszystkich lokalizacji
    await Lokalizacja.findByIdAndDelete(req.params.id);                            //usunięcie lokalizacji z bazy danych
    req.flash('success', 'Pomyślnie usunięto lokalizację!');
    res.redirect('/lokalizacje');                                       //REDIRECT do wszystkich lokalizacji
}