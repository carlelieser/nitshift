import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
	apiKey: "AIzaSyD3o-JNRi2pjhm5oMkoGBZdy0hqf5N5J0M",
	authDomain: "blinder-73755.firebaseapp.com",
	projectId: "blinder-73755",
	storageBucket: "blinder-73755.appspot.com",
	messagingSenderId: "966990150901",
	appId: "1:966990150901:web:cfe3f758a602d5dcc519bc",
	measurementId: "G-W3JM6JRF9Y",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
