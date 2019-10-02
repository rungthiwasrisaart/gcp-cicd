module.exports = function (nameDB, mongoose, isConnect, mongoDB) {
    if (!isConnect) return false
    console.log(nameDB, ' : ', mongoDB)
    // Connect Database
    const connectDatabase = mongoose.createConnection(mongoDB, { auto_reconnect: true, useNewUrlParser: true, useUnifiedTopology: true })
    connectDatabase.on('connecting', function () {
        console.log(`connecting to ${nameDB}...`)
    })
    connectDatabase.on('error', function (error) {
        console.error(`Error in ${nameDB} connection: ` + error)
        connectDatabase.close()
        throw new Error(`Error in ${nameDB} connection.`)
    })
    connectDatabase.on('connected', function () {
        console.log(`${nameDB} connected!`)
    })
    connectDatabase.once('open', function () {
        console.log(`${nameDB} connection opened!`)
    })
    connectDatabase.on('disconnected', function () {
        console.log(`${nameDB} disconnected!`)
        connectDatabase.close()
        throw new Error(`Error in ${nameDB} connection.`)
    })

    let Schema = mongoose.Schema

    // create a schema
    let schema = new Schema({
        uuid: {
            type: String,
            required: [true, 'Require field input uuid.']
        },
        uuidPayment: {
            type: String,
            required: [true, 'Require field input uuidPayment.']
        },
        customerId: {
            type: String,
            required: [true, 'Require field input customerId.']
        },
        merchantId: {
            type: String,
            required: [true, 'Require field input merchantId.']
        },
        orderItemId: {
            type: String,
            required: false
        },
        price: {
            type: Number,
            required: [true, 'Require field input price.']
        },
        isPaymentConfirm: {
            type: Boolean,
            default: false
        },
        paymentConfirmId: {
            type: String
        },
        paymentConfirmTxHash: {
            type: String
        },
        paymentConfirmWallet: {
            type: String
        },
        paymentConfirmAmount: {
            type: Number
        }
    }, {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }, { versionKey: false })


    schema.pre('save', function (next) {
        this.updated_at = Date.now()
        next()
    })
    return connectDatabase.model('payments', schema)
}