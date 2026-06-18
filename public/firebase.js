import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyC8RXF6RZ3miooXvQgA6G15TvZEjIT69SY",
    authDomain: "pdf-merge-pro-62f22.firebaseapp.com",
    projectId: "pdf-merge-pro-62f22",
    storageBucket: "pdf-merge-pro-62f22.firebasestorage.app",
    messagingSenderId: "942110418632",
    appId: "1:942110418632:web:7b884344e5c10d650be7fd"

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

const auth =
getAuth(app);

export {
    db,
    auth,
    collection,
    addDoc
};