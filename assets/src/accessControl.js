module.exports = function (app, helmet) {
    app.use(helmet())
    app.disable('x-powered-by')
    app.use(async function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', '*')
        res.setHeader('AllowHeaders', 'Authorization')
        res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization')
        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            return res.status(200).json()
        } else {
            next()
        }
    })
}