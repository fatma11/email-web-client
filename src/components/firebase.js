import firebase from 'firebase/app'
import 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAni7NU8bOOkCSYUeLYhrnMHl24MXQ2OOQ",
    authDomain: "email-ac4fc.firebaseapp.com",
    databaseURL: "https://email-ac4fc.firebaseio.com",
    projectId: "email-ac4fc",
    storageBucket: "email-ac4fc.appspot.com",
    messagingSenderId: "778820633967",
    appId: "1:778820633967:web:3162a31b3546b42528949a"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase