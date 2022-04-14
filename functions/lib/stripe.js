const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.api_key);

module.exports = stripe;
