module.exports = func => {                                      //programowanie funkcyjne, funkcja pozwoli na otaczanie funkcji wywoływanych podczas wyszukiwań
    return (req, res, next) => {                                  //try blokiem i dodanie do tego catch czyli funkcja bierze za argument funkcje z app.js np. przy GET
        func(req, res, next).catch(next);                       //i zamienia ją w taką otoczoną tryb blokiem i z dołączonym catch w tym pliku
    }                                                           //tak naprawde to nie dodaje try a tylko appenduje catch bo bezposrednie appendowanie nie wymaga try
}