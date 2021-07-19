const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const firebaseConfig = {
  apiKey: "AIzaSyAwjU4JVUbUk02rnK26GuwJc1cdyM2j-qs",
  authDomain: "social-app-tutorial-349fb.firebaseapp.com",
  projectId: "social-app-tutorial-349fb",
  storageBucket: "social-app-tutorial-349fb.appspot.com",
  messagingSenderId: "746181337169",
  appId: "1:746181337169:web:e3e6b0c5cf10dd5c6a1870",
};

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userhandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.log(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  // persist newScream object in the database
  db.collection("screams")
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully.` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong." });
      console.error(err);
    });
});

// Signup Route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        // Sign up user
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
