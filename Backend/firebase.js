const admin = require("firebase-admin");
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "coachvault-fd797"
});

const bucket = admin.storage().bucket();

module.exports = bucket;