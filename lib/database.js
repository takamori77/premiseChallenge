// database.js
// Basic database connection functionality
(function (database) {
    var mongodb = require("mongodb");
    var mongoUrl = "mongodb://ph_user:ph_user@ds025439.mlab.com:25439/phchallenge";
    var theDb = null;

    database.getDb = function (next) {
        if (!theDb) {
            // connect to the database
            mongodb.MongoClient.connect(mongoUrl, function (err, db) {
                if (err) {
                    next(err, null);
                } else {
                    theDb = {
                        db: db,
                        users: db.collection("users")
                    };
                    next(null, theDb);
                }
            });
        } else {
            next(null, theDb);
        }
    }

})(module.exports);
