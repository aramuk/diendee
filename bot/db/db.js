const mongoose = require('mongoose');

connectToDB = () => {
    mongoose.connect()

    return mongoose.connection;
}

module.exports = {
    connectToDB,
}