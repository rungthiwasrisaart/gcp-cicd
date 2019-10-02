module.exports = function (client) {
    const credentials = new client.UserCredentials("admin", "GdcEdLwsLZTRJbshhyKDYxwsiXsoXr"),
        settings = {},
        endpoint = process.env.EVENTSTORE || 'tcp://eventstore.default:1113',
        connection = client.createConnection(settings, endpoint)

    connection.connect().catch(err => console.log(err))

    connection.on('heartbeatInfo', heartbeatInfo => {
        console.log('Connected to endpoint', heartbeatInfo.remoteEndPoint)
        console.log('Heartbeat latency', heartbeatInfo.responseReceivedAt - heartbeatInfo.requestSentAt)
    })

    connection.on("error", error =>
        console.log(`Error occurred on connection: ${error}`)
    )

    connection.on("closed", reason =>
        console.log(`Connection closed, reason: ${reason}`)
    )

    return {
        connection,
        credentials
    }
}