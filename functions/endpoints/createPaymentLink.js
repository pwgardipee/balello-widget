// Import library functions
const { functions, db } = require("../lib/firebase");
const stripe = require("../lib/stripe");
const ShipEngine = require("../lib/shipEngine");

module.exports = functions.https.onRequest(async (request, response) => {
  // Parse data from request headers
  const userID = request.headers.user_id;
  const labelSessionID = request.headers.label_session_id;
  const rateID = request.headers.rate_id;
  const successURL = request.headers.success_url;
  const cancelURL = request.headers.cancel_url;
  const labelLayout = request.headers.label_layout;

  // Validate input
  if (
    !(
      userID &&
      labelSessionID &&
      rateID &&
      successURL &&
      cancelURL &&
      labelLayout
    )
  ) {
    response.send(
      `user_id, label_session_id, rate_id, success_url, and cancel_url, label_layout headers must exist on the request`
    );
    return;
  }

  //Verify that the label hasn't already been paid created for this session
  const labelSession = await db
    .collection("users")
    .doc(userID)
    .collection("label-sessions")
    .doc(labelSessionID)
    .get();

  if (!labelSession.exists) {
    response.send({
      error: `Label Session ${labelSessionID} doesn't exist`,
    });
    return;
  }

  if (labelSession.data().label) {
    response.send({
      error: `Label Session ${labelSessionID} already has a label`,
    });
    return;
  }

  // Estimate label cost given the carrier ID
  let labelPrice;
  let rate;
  try {
    rate = await ShipEngine.getRateByID(rateID);
    labelPrice = rate.shipping_amount.amount * 100; //convert to USD for Stripe
  } catch (e) {
    response.send({
      error: `Error fetching rate ${rateID}`,
      description: e.message,
    });
    return;
  }

  // Update label session with rate and label layout
  try {
    await db
      .collection("users")
      .doc(userID)
      .collection("label-sessions")
      .doc(labelSessionID)
      .update({ lastRate: rate, labelLayout });
  } catch {
    response.send({
      error: `Internal Server Error`,
    });
    return;
  }

  // Get the Balello fee (price and currency) the config stored in the database
  const balelloConfig = await db.collection("config").doc("config").get();
  if (!balelloConfig.exists) {
    response.send({
      error: `Internal Server Error`,
    });
    return;
  }
  const {
    currency,
    labelFee,
    stripe_label_line_item_name,
    stripe_fee_line_item_name,
  } = balelloConfig.data();

  // Get the user object from the userID
  const user = await db.collection("users").doc(userID).get();
  if (!user.exists) {
    response.send({
      error: `user ${userID} does not exist`,
    });
    return;
  }
  const customer_email = user.data().email;

  // Generate the payment link from Stripe
  try {
    const session = await stripe.checkout.sessions.create({
      success_url: successURL,
      cancel_url: cancelURL,
      customer_email,
      mode: "payment",
      metadata: {
        labelSessionID,
        userID,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            unit_amount: labelPrice,
            currency,
            product_data: {
              name: stripe_label_line_item_name,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            unit_amount: labelFee,
            currency,
            product_data: {
              name: stripe_fee_line_item_name,
            },
          },
        },
      ],
    });

    // Return the payment link as the response
    response.send({ paymentLink: session.url });
  } catch (err) {
    response.send(err);
  }
});
