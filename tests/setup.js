const TIMEOUT_SECONDS = 30;
jest.setTimeout(Math.floor(TIMEOUT_SECONDS * 1000));

require("@models/User");

const mongoose = require('mongoose');
const keys = require ("@config/keys");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });