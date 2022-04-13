const functions = require("firebase-functions");
const ShipEngine = require("shipengine");
const shipengine = new ShipEngine(functions.config().ship_engine.api_key);

module.exports = shipengine;
