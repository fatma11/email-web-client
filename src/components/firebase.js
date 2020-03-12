import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyCSn00N_cgodPJ16Y3h68BDSEOhvk8E-ro",
    authDomain: "email-5e941.firebaseapp.com",
    databaseURL: "https://email-5e941.firebaseio.com",
    projectId: "email-5e941",
    storageBucket: "email-5e941.appspot.com",
    messagingSenderId: "114050396172",
    appId: "1:114050396172:web:7b7cc77cf48f84dc3e7e29"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase