const axios = require("axios").default;

const baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001/balello/us-central1"
    : "https://us-central1-balello.cloudfunctions.net";

const balelloAdapter = axios.create({
  baseURL,
});

class BalelloAPI {
  getEstimates(userID, labelSessionID) {
    return balelloAdapter.get("/fetchShippingEstimates", {
      headers: {
        user_id: userID,
        label_session_id: labelSessionID,
      },
    });
  }

  createPaymentLink(
    userID,
    labelSessionID,
    rateID,
    successURL,
    cancelURL,
    displayScheme
  ) {
    return balelloAdapter.get("/createPaymentLink", {
      headers: {
        user_id: userID,
        label_session_id: labelSessionID,
        rate_id: rateID,
        success_url: successURL,
        cancel_url: cancelURL,
        display_scheme: displayScheme,
      },
    });
  }
}

module.exports = BalelloAPI;
