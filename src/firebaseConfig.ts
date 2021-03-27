import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDYkwrsInkHG8QDPXvcxk-RrYopgg00xiM",
  authDomain: "serwer-zaliczenie.firebaseapp.com",
  projectId: "serwer-zaliczenie",
  storageBucket: "serwer-zaliczenie.appspot.com",
  messagingSenderId: "761901257432",
  appId: "1:761901257432:web:c95b516a33f901909bbdad"
};

const app = firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();