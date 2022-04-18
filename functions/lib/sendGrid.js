const functions = require("firebase-functions");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(functions.config().send_grid.api_key);

module.exports = sgMail;
