import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAe_wcOvRKuBagkPM6sZ9aQtyxXe9I1LiE",
    authDomain: "email-d1762.firebaseapp.com",
    databaseURL: "https://email-d1762.firebaseio.com",
    projectId: "email-d1762",
    storageBucket: "email-d1762.appspot.com",
    messagingSenderId: "205986578330",
    appId: "1:205986578330:web:9a8f5729a300a4b5e80423"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase