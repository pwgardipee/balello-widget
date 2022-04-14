// Import all endpoints
const fetchShippingEstimates = require("./endpoints/fetchShippingEstimates");
const createPaymentLink = require("./endpoints/createPaymentLink");
const stripeCheckoutWebhookHandler = require("./endpoints/stripeCheckoutWebhookHandler");

// Instantiate all endpoints
exports.fetchShippingEstimates = fetchShippingEstimates;
exports.createPaymentLink = createPaymentLink;
exports.stripeCheckoutWebhookHandler = stripeCheckoutWebhookHandler;
