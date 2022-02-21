
module.exports = (app) => {
    var cors = require('cors')

    //app.use(cors())

    app.use(
        function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        }
    );

    app.options('*', cors())
}