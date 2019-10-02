// Set up mongoose connection
module.exports = function (mongoose, {
    MerchantConnect = false,
    AddressWalletConnect = false,
    PaymentConnect = false,
    PaymentConfirmConnect = false,
    MerchantItemConnect = false,
    PosConnect = false,
    orderItemConnect = false,
    WithdrawConnect = false
}) {
    // console.log('MerchantConnect : ', MerchantConnect)
    // console.log('AddressWalletConnect : ', AddressWalletConnect)
    // console.log('PaymentConnect : ', PaymentConnect)
    // console.log('PaymentConfirmConnect : ', PaymentConfirmConnect)
    // console.log('MerchantItemConnect : ', MerchantItemConnect)
    // console.log('PosConnect : ', PosConnect)
    // console.log('orderItemConnect : ', orderItemConnect)

    const MerchantUrlDb = process.env.MONGODB_MERCHANT || 'mongodb://merchant:merchantpassword@merchant-mongodb.database:27017/merchantdb'
    const AddressWalletUrlDb = process.env.MONGODB_ADDRESS_WALLET || 'mongodb://merchant:merchantpassword@address-wallet-mongodb.database:27017/merchantdb'
    const PaymentUrlDb = process.env.MONGODB_PAYMENT || 'mongodb://merchant:merchantpassword@payment-mongodb.database:27017/merchantdb'
    const PaymentConfirmUrlDb = process.env.MONGODB_PAYMENT_CONFIRM || 'mongodb://merchant:merchantpassword@payment-confirm-mongodb.database:27017/merchantdb'
    const MerchantItemUrlDb = process.env.MONGODB_MERCHANT_ITEM || 'mongodb://merchant:merchantpassword@merchant-item-mongodb.database:27017/merchantdb'
    const PosUrlDb = process.env.MONGODB_POS || 'mongodb://merchant:merchantpassword@pos-mongodb.database:27017/merchantdb'
    const orderItemUrlDb = process.env.MONGODB_ORDER_ITEM || 'mongodb://merchant:merchantpassword@order-item-mongodb.database:27017/merchantdb'
    const WithdrawUrlDb = process.env.MONGODB_WITHDRAW || 'mongodb://merchant:merchantpassword@withdraw-mongodb.database:27017/merchantdb'

    const Merchant = require('./models/Merchant')(
        'Merchant', mongoose, MerchantConnect, MerchantUrlDb
    )
    const AddressWallet = require('./models/AddressWallet')(
        'AddressWallet', mongoose, AddressWalletConnect, AddressWalletUrlDb
    )
    const Payment = require('./models/Payment')(
        'Payment', mongoose, PaymentConnect, PaymentUrlDb
    )
    const PaymentConfirm = require('./models/PaymentConfirm')(
        'PaymentConfirm', mongoose, PaymentConfirmConnect, PaymentConfirmUrlDb
    )
    const MerchantItem = require('./models/MerchantItem')(
        'MerchantItem', mongoose, MerchantItemConnect, MerchantItemUrlDb
    )
    const Pos = require('./models/Pos')(
        'Pos', mongoose, PosConnect, PosUrlDb
    )
    const orderItem = require('./models/orderItem')(
        'orderItem', mongoose, orderItemConnect, orderItemUrlDb
    )
    const Withdraw = require('./models/Withdraw')(
        'Withdraw', mongoose, WithdrawConnect, WithdrawUrlDb
    )
    return {
        Merchant,
        AddressWallet,
        Payment,
        PaymentConfirm,
        MerchantItem,
        Pos,
        orderItem,
        Withdraw
    }
}