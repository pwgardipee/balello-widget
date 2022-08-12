// Import library functions
const { functions, db } = require("../lib/firebase");
const ShipEngine = require("../lib/shipEngine");
const cors = require("cors")({ origin: true });

// Create request endpoint for getting shipping estimates given a userID and labelSessionID
module.exports = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        // Get all available carriers
        try {
            const result = await ShipEngine.listCarriers();
            response.send(result);
        } catch (e) {
            response.send({
                error: `There was an issue fetching all carriers`,
                description: e.message,
            });
        }
    });
});
