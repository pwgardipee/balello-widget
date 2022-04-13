// Import library functions
const { functions, db } = require("../lib/firebase");
const ShipEngine = require("../lib/shipEngine");

// Create request endpoint for getting shipping estimates given a userID and labelSessionID
module.exports = functions.https.onRequest(async (request, response) => {
  // Parse data from request headers
  const userID = request.headers.user_id;
  const labelSessionID = request.headers.label_session_id;

  // Validate input
  if (!(userID && labelSessionID)) {
    response.send(
      `user_id and label_session_id headers must exist on the request`
    );
    return;
  }

  // Get label data from Firestore
  const labelSession = await db
    .collection("users")
    .doc(userID)
    .collection("label-sessions")
    .doc(labelSessionID)
    .get();

  // Verify that label exists
  if (!labelSession.exists) {
    response.send(
      `User ${userID} and/or Label ${labelSessionID} doesn't exist`
    );
    return;
  }

  // Get all available carriers
  let carriers;
  try {
    const result = await ShipEngine.listCarriers();
    carriers = result;
  } catch (e) {
    response.send("Internal Server Error!");
    return;
  }

  // Construct params object to send to Ship Engine
  const { shipTo, shipFrom, weight, height } = labelSession.data();
  const params = {
    rateOptions: {
      carrierIds: carriers
        .map((carrier) => carrier.carrierId)
        .filter((carrierId) => carrierId !== "se-1086304"), //FexEx doesn't work right now
    },
    shipment: {
      validateAddress: "no_validation",
      shipTo,
      shipFrom,
      packages: [
        {
          weight,
          height,
        },
      ],
    },
  };

  // Send request to ShipEngine and return to user
  try {
    const result = await ShipEngine.getRatesWithShipmentDetails(params);
    response.send(result);
  } catch (e) {
    response.send({
      error: `There is an issue with label session: ${labelSessionID}`,
      description: e.message,
    });
  }
});
