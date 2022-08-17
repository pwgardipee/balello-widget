// Import library functions
const { functions, db } = require("../lib/firebase");
const ShipEngine = require("../lib/shipEngine");
const cors = require("cors")({ origin: true });

// Create request endpoint for validating an address
module.exports = functions.https.onRequest(async (request, response) => {
    cors(request, response, async () => {
        const address = request.body.address

        // Validate input
        if (!address) {
            response.send(
                `address must exist in the request body`
            );
            return;
        }

        // Get all available carriers
        try {
            const result = await ShipEngine.validateAddresses([address]);
            response.send(result);
        } catch (e) {
            response.send({
                error: `There was an issue fetching all carriers`,
                description: e.message,
            });
        }
    });
});
