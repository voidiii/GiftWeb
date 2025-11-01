// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARu6JdhiVLcjo2VdMS_0xpAYGvY3E0yc8",
  authDomain: "gift-34a09.firebaseapp.com",
  projectId: "gift-34a09",
  storageBucket: "gift-34a09.firebasestorage.app",
  messagingSenderId: "943967953464",
  appId: "1:943967953464:web:2186b46511d01e6c72bccd",
  measurementId: "G-5M7Q6VJCL8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);