const functions = require("firebase-functions");
const ShipEngine = require("shipengine");
const config_1 = require("shipengine/cjs/config");
const client_1 = require("shipengine/cjs/client");

class BalelloShipEngine extends ShipEngine {
  async getRateByID(id, config) {
    const mergedConfig = config_1.NormalizedConfig.merge(this.config, config);
    const response = await client_1.get(`/v1/rates/${id}`, mergedConfig);
    return response;
  }
}

const shipengine = new BalelloShipEngine(
  functions.config().ship_engine.api_key
);

module.exports = shipengine;
