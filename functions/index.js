// Import all endpoints
const fetchShippingEstimates = require("./endpoints/fetchShippingEstimates");
const createPaymentLink = require("./endpoints/createPaymentLink");
const stripeCheckoutWebhookHandler = require("./endpoints/stripeCheckoutWebhookHandler");
const fetchCarriers = require("./endpoints/fetchCarriers")

// Instantiate all endpoints
exports.fetchShippingEstimates = fetchShippingEstimates;
exports.createPaymentLink = createPaymentLink;
exports.stripeCheckoutWebhookHandler = stripeCheckoutWebhookHandler;
exports.fetchCarriers = fetchCarriers
