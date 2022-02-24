class ExpressError extends Error {                  //klasa pozwalająca na customizowanie Errorów na bazie podstawowej klasy
    constructor(message, statusCode) {
        super();                                    //powołuje się na konstruktor z klasy Error
        this.message = message;                     //przypisujemy na starcie nowe właściwości reprezentantom naszej klasy
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;