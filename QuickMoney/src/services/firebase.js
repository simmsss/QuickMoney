import firebase from 'firebase';

var firebaseConfig = {
    apiKey: "AIzaSyCGy68oNuTqMiqa0RpoVaL48L3hxENe41o",
    authDomain: "QuickMoney420.firebaseapp.com",
    databaseURL: "https://QuickMoney420.firebaseio.com",
    projectId: "QuickMoney420",
    storageBucket: "QuickMoney420.appspot.com",
    messagingSenderId: "882980311650",
    appId: "1:882980311650:web:1ee8ab611c797520bff73b",
    measurementId: "G-PL1565E667"
  };

firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth;
export const db = firebase.database();