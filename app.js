if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');                               //importuje express (plus method-override), ejs-mate do templatowania i path oraz mongoose (bibliotekę do obsługi mongo), 
const app = express();                                             //session, które posługuje się cookies i pomaga zapamiętywać dane użytkowników, oraz flash do tworzenia powiadomień takich jak udało się utworzyć produkt, flash (connect-flash) bazuje na session a on na cookie-parserze
const methodOverride = require('method-override');                  //do tego passport i powiązane
const ejsMate = require('ejs-mate');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const Uzytkownik = require('./models/uzytkownik');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require("connect-mongo");

//--------------------------------------------------------------------------------------------------------Import routes + funckję ExpressError

const uzytkownik_routes = require('./routes/uzytkownicy');
const kolekcja_letnia_routes = require('./routes/kolekcja_letnia');
const kolekcja_zimowa_routes = require('./routes/kolekcja_zimowa');
const lokalizacje_routes = require('./routes/lokalizacje');
const recenzje_letnie_routes = require('./routes/recenzje_letnie');
const recenzje_zimowe_routes = require('./routes/recenzje_zimowe');

const ExpressError = require('./utils/ExpressError');
const { required } = require('joi');
///
//-------------------------------------------------------------------------------------------------------MongoDB
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/marta-projekt';      
mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//-------------------------------------------------------------------------------------------------------EJS

app.engine('ejs', ejsMate);                                             // mówie ejs by korzystał z naszego silnika do templatingu
app.set('view engine', 'ejs');                                          //ustawiam viewengine na ejs i łącze lokalizacje
app.set('views', path.join(__dirname, 'views'));

//------------------------------------------------------------------------------------------------------Static

app.use(express.static(path.join(__dirname, 'public'))); ////CHWILOWY KOD NA SERWOWANIE LOKALNYCH PLIKOW CSS I ZDJ

//----------------------------------------------------------------------------------------------------Express i methodoverride specyfikacja

app.use(express.urlencoded({ extended: true }));                          //ustawiam by body było we właściwej postaci przy korzystaniu z expressa
app.use(methodOverride('_method'));                                     //dodaję opcje put i delete przy dopisaniu ?_method=PUT lub ?_method=DELETE nadpisujące metodę POST

//------------------------------------------------------------------------------------------------------MongoSanitize = walka z "SQL" injection

app.use(mongoSanitize());               //PAMIĘTAJ NA CAŁE ŻYCIE NAJPIERW PARSING URLENCODED POTEM TO BO INACZEJ NIE SPRAWDZI CI TO BODY

//------------------------------------------------------------------------------------------------------MongoStore + session

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';          //prod (z heroku) vs dev 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret,             
    }
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e);
});

//------------------------------------------------------------------------------------------------------Session + Connect-Flash

const sessionConfig = {
    store,
    name: 'ycsid',                                      //zabezpiecznie to zmiana nazwy z connect.sid czy coś na własną
    secret,                //secret na razie udawany do hashowania (?) cookies
    resave: false,                                      //kolejne dwa to konfiguracje
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                                 //małe zabezpieczenie przed XSS, tylko przegladarka ma dostęp do cookies a skrypty nie
        sameSite: "lax",                                //nie jestem pewien czy tego potrzebuje ale zatrzymalo jakies bledy
        // secure: true,                                  //ważne żeby przy wdrażaniu włączyć by cookies były aktywne tylko przy połączeniu https a http i localhost nie, ale teraz to zepsuje logowanie póki jest lokalnie
        expires: Date.now() + 604800000,                 //tydzień w milisekundach
        maxAge: 604800000
    }
};

app.use(session(sessionConfig));
app.use(flash());

//----------------------------------------------------------------------------------------------------Helmet - zabezpiecznie headerów http

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com"
];
const fontSrcUrls = [ 
    "https://fonts.gstatic.com/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/wisniazkardamonem/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            childSrc: ["blob:"],
            mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/wisniazkardamonem/" ]
        }
    })
);

//----------------------------------------------------------------------------------------------------Uwierzytelnianie (Authentication), passport, passport-local, passport-local-mongoose

app.use(passport.initialize());
app.use(passport.session());                            //umożliwia zachowywanie logowania między kolejnymi dniami, app.use(session) musi być przed tym
passport.use(new LocalStrategy(Uzytkownik.authenticate()));
//dodaje także do req req.user
passport.serializeUser(Uzytkownik.serializeUser());
passport.deserializeUser(Uzytkownik.deserializeUser());

//---------------------------------------------------------------------------------------------------------Flash middleware

app.use((req, res, next) => {                   //dzięki temu zamiast dopisywać np: na koniec router get /:id obok { produkt, msg: req.flash('success')}, każda ścieżka otrzymująca  req.flash bedzie go wykonywać
    res.locals.success = req.flash('success');              //musze jeszcze wyświetlić success w boilerplate
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;          //podobnie dla użytkownika przenoszę jego dane z req na res
    next();
});

//-------------------------------------------------------------------------------------------------------------------------Routing

app.get('/', (req, res) => {                                            //STRONA GŁÓWNA
    res.render('home');
});

app.use('/', uzytkownik_routes);

app.use('/kolekcja_letnia', kolekcja_letnia_routes);

app.use('/kolekcja_zimowa', kolekcja_zimowa_routes);

app.use('/lokalizacje', lokalizacje_routes);

app.use('/kolekcja_letnia/:id/recenzje', recenzje_letnie_routes);

app.use('/kolekcja_zimowa/:id/recenzje', recenzje_zimowe_routes);

//----------------------------------------------------------------------------------------------------------------------------Error Handler + Page not Found

app.all('*', (req, res, next) => {                                               //Wyłapuje wszystkie niepoprawne linki, błędy NIEzwiązane z bazami danych, api, itp.
    next(new ExpressError('Page Not Found', 404));
});


app.use((err, req, res, next) => {                                            //Składnia dla tzn Error Handler
    const { statusCode = 500 } = err;       //{} to destrukturyzacja, umożliwia wyjęcie elementów po przecinku i przypisanie im tej samej nazwy z obiektu po prawej, plus przypisanie default wartości jeżeli obiekt nie będzie takich miał
    if (!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
});




//-----------------------------------------------------------------------------------------------------------------------------------------Serwuje na porcie

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});





















//Zbędny kod                                                    //Na podstawie klas (bazujących na modelach z mongo) tworzę kilka obiektów, które zapisuję i wyświetlam
// app.get('/makelokalizacja', async (req,res) =>{
//     const lok1 = new Lokalizacja({miejscowość: 'Łomża', dostępność: 'pon-pt 10:00-18:00', opis: 'odbiór osobisty do 1.10.2021', miejsce: 'Park im. Jakuba Wagi' });
//     const lok2 = new Lokalizacja({miejscowość: 'Warszawa', dostępność: 'pon-pt 16:00-20:00',opis: 'odbiór osobisty od 2.10.2021', miejsce: 'Plac Trzech Krzyży' });
//     await lok1.save();
//     await lok2.save();
//     res.send([lok1, lok2])
// })

// app.get('/makeZimowyProdukt', async (req, res) =>{
//     const ZProd1 = new ZimowyProdukt(
//         {nazwa: 'Kwiaty',
//         zdjęcie: 'https://source.unsplash.com/collection/3403106',
//         rozmiar: 'M',
//         cena: 30,
//         opis: 'Z kolekcji letniej',
//         dostępność: 'Dostępny'})
//     const ZProd2 = new ZimowyProdukt(
//         {nazwa: 'Liście',
//         zdjęcie: 'https://source.unsplash.com/collection/3403106',
//         rozmiar: 'L',
//         cena: 45,
//         opis: 'Z kolekcji letniej',
//         dostępność: 'Niedostępny'})
//     await ZProd1.save();
//     await ZProd2.save();
//     res.send([ZProd1, ZProd2])
// });
// app.get('/makeLetniProdukt', async (req, res) =>{
//     const LProd1 = new LetniProdukt(
//         {nazwa: 'Pocałunek',
//         zdjęcie: 'https://source.unsplash.com/collection/649278',
//         cena: 30,
//         opis: 'Z kolekcji letniej',
//         dostępność: 'Dostępny'})
//     const LProd2 = new LetniProdukt(
//         {nazwa: 'Miłość',
//         zdjęcie: 'https://source.unsplash.com/collection/649278',
//         cena: 30,
//         opis: 'Z kolekcji Letniej',
//         dostępność: 'Niedostępny'})
//     await LProd1.save();
//     await LProd2.save();
//     res.send([LProd1, LProd2])
// });
