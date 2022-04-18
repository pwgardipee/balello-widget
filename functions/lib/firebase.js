const functions = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");

//Initialize App
admin.initializeApp();

module.exports = {
  functions,
  db: getFirestore(),
};
