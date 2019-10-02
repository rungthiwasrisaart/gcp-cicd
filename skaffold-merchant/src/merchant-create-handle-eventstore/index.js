require('dotenv').config()
const mongoose = require('mongoose'),
    to = require('await-to-js').default,
    {
        Merchant
    } = require(process.env.DATABASE_PATH || './config/db')(mongoose, {
        MerchantConnect: true
    }),
    socket_merchant = process.env.SOCKET_URI || 'http://merchant-socket.socket:9443',
    io = require('socket.io-client'),
    socket = io(socket_merchant, {
        path: process.env.SOCKET_PATH || '/merchant/socket.io/',
        reconnect: true
    }),
    uuidv5 = require('uuid/v5');
const MY_NAMESPACE = '04dab6b7-f13e-4eb6-a6a8-b23fec5ce436';

async function moveFile(customerId, merchantId, itemImage) {
    // [START storage_move_file]
    // Imports the Google Cloud client library
    const { Storage } = require('@google-cloud/storage');
    // Creates a client
    const storage = new Storage({
        keyFilename: process.env.STORAGE_GCP_PATH || './config/storage-gcp.json',
        projectId: 'vertobase-dev'
    });
    await storage
        .bucket('mcon-vertobase-dev')
        .file(`${customerId}/tmp/${itemImage}`)
        .move(`merchant/${merchantId}/${itemImage}`);

    console.log('move file success')
    // [END storage_move_file]
}

// eventstore setting
const client = require("node-eventstore-client"),
    { connection, credentials } = require(process.env.EVENTSTORE_PATH || './eventStore.js')(client)

const belongsToAUserAggregate = event => {
    return event.originalEvent.eventStreamId.startsWith("user-") &&
        event.originalEvent.eventType === "MerchantCreate"
}

const eventAppeared = async (subscription, event) => {
    if (belongsToAUserAggregate(event)) {
        try {
            const data = JSON.parse(event.originalEvent.data.toString())
            // console.log('data : ', data)
            const { uuid, merchantImage } = data
            console.log('uuid : ', uuid)
            const [errCreateMerchant, createMerchant] = await to(
                Merchant.create({
                    customerId: data.customerId,
                    merchantInfo: data.merchantInfo,
                    merchantName: data.merchantName,
                    merchantImage,
                    uuid: uuid,
                })
            )
            if (errCreateMerchant) throw errCreateMerchant
            const { _id: merchantId, customerId } = createMerchant
            await moveFile(customerId, merchantId, merchantImage)
            const uuidWallet = uuidv5(merchantId.toString(), MY_NAMESPACE)
            socket.emit('sent-message', {
                uuid,
                uuidWallet,
                data: createMerchant
            })
            const dataCreate = {
                uuid: uuidWallet,
                merchantId,
                customerId
            }
            console.log('dataCreate : ', dataCreate)
            // Every user has their own stream of events:
            const newEvent = client.createJsonEventData(
                uuidWallet,
                dataCreate,
                null,
                "MerchantWalletCreate"
            )
            const streamName = `user-${customerId}`
            connection.appendToStream(streamName, client.expectedVersion.any, newEvent)
                .then(result => {
                    console.log("Event stored.")
                })
                .catch(error => {
                    throw error
                })
        } catch (err) {
            console.log('err : ', err)
        }
    }
}

const subscriptionDropped = (subscription, reason, error) =>
    console.log(error ? error : "Subscription dropped.")

connection.once("connected", tcpEndPoint => {
    console.log(`Connected to eventstore at ${tcpEndPoint.host}:${tcpEndPoint.port}`)
    connection.subscribeToAll(
        false,
        eventAppeared,
        subscriptionDropped,
        credentials
    ).then(subscription => {
        console.log(`subscription.isSubscribedToAll: ${subscription.isSubscribedToAll}`)
    })
})