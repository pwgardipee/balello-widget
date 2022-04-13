const functions = require("firebase-functions");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin");

//Initialize App
initializeApp();

module.exports = {
  functions,
  db: getFirestore(),
};
