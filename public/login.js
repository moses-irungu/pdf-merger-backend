import { auth }
from "./firebase.js";

import {
    signInWithEmailAndPassword
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const loginForm =
document.getElementById("loginForm");

loginForm.addEventListener(
"submit",
async (e) => {

    e.preventDefault();

    const email =
    document.getElementById("username").value;

    const password =
    document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        location.href = "admin.html";

    } catch (error) {

        alert("Invalid Login");

    }

});
