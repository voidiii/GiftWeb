// Firebase Configuration
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
firebase.initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = firebase.firestore();
const storage = firebase.storage();

console.log('Firebase initialized successfully!');