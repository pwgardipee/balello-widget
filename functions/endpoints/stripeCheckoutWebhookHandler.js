// Import library functions
const { functions, db } = require("../lib/firebase");
const ShipEngine = require("../lib/shipEngine");
const cors = require("cors")({ origin: true });

async function completedHandler({ data }) {
  // Get labelID and userID from webhook body
  const { labelSessionID, userID } = data.metadata;

  // Get label session doc from firestore
  const labelSession = await db
    .collection("users")
    .doc(userID)
    .collection("label-sessions")
    .doc(labelSessionID)
    .get();

  // Create Label from label session's rateID
  const label = await ShipEngine.createLabelFromRate({
    rateId: labelSession.data().lastRate.rate_id,
    validateAddress: "no_validation",
    labelLayout: "4x6",
    displayScheme: labelSession.data().displayScheme,
  });

  // Update label session with label information
  labelSession.ref.update({ label });
}

// TODO
function expiredHandler() {}

const handlerFunctionMappings = {
  "checkout.session.completed": completedHandler,
  "checkout.session.expired": expiredHandler,
};

function getHandlerFunction(type) {
  //Get handler function
  const handlerFunction = handlerFunctionMappings[type];

  // Return handler function or log error if no handler exists
  if (handlerFunction) return handlerFunction;
  else console.log(`Unhandled type: ${type}`);
}

module.exports = functions.https.onRequest(async (request, response) => {
  cors(request, response, async () => {
    const handlerFunction = getHandlerFunction(request.body.type);

    if (handlerFunction) {
      await handlerFunction({ data: request.body.data.object });
      response.send({ success: true });
    } else {
      response
        .status(400)
        .send({ error: `Unhandled type: ${request.body.type}` });
    }
  });
});
