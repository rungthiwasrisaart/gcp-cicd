module.exports = function (app) {
    app.get('/health', function (req, res) {
        return res.json({
            'data': 'health'
        })
    });
}