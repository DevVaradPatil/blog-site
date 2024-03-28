// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "@firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBqmwavZ6J66oZbkLMruuKS_jileTgpEI",
  authDomain: "gericht-restaurant-bf76f.firebaseapp.com",
  projectId: "gericht-restaurant-bf76f",
  storageBucket: "gericht-restaurant-bf76f.appspot.com",
  messagingSenderId: "292071791095",
  appId: "1:292071791095:web:095f9b59070fc8e1a576f2",
  measurementId: "G-GY82S76HDN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { storage, app }