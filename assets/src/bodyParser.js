module.exports = function (app, bodyParser) {
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())

    //  error handler formatted JSON
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError) return res.status(400).send({
            error: "Invalid JSON"
        })
        console.error(err);
        res.status(500).send();
    })
}