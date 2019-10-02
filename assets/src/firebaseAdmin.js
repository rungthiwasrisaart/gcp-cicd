module.exports = function (app, to, firebaseAdmin, helmet) {
    if (!firebaseAdmin.apps.length) {
        const serviceAccount = require(process.env.SERVICE_ACCOUNT_FIREBASE_AUTH_PATH || './config/firebase-auth.json')
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert(serviceAccount),
            databaseURL: process.env.DATABASE_URL_FIREBASE_ADMIN
        })
    }
    app.use(helmet())
    app.disable('x-powered-by')
    app.use(async function (req, res, next) {
        try {
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.setHeader('Access-Control-Allow-Methods', '*')
            res.setHeader('AllowHeaders', 'Authorization')
            res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization')
            // intercept OPTIONS method
            if ('OPTIONS' == req.method) {
                return res.status(200).json()
            } else {

                let idToken = req.headers.authorization
                if (idToken == undefined || idToken == '') {
                    return res.status(401).json({
                        messages: 'Unauthorized.'
                    })
                }

                const [errDecodedToken, decodedToken] = await to(
                    firebaseAdmin.auth().verifyIdToken(idToken)
                )
                if (errDecodedToken) {
                    if (errDecodedToken.code != 'auth/id-token-expired') {
                        console.warn(errDecodedToken)
                    }
                    return res.status(401).json({
                        messages: 'Verify ID token fail.'
                    })
                }
                req.decodedToken = decodedToken
                next()
            }
        } catch (err) {
            console.log('err : ', err)
            return res.status(401).json({
                messages: 'Unauthorized.'
            })
        }
    })
}