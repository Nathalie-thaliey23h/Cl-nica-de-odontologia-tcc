// Importações do Firebase SDK (usando CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

// Sua configuração do Firebase (copiada do console)
const firebaseConfig = {
  apiKey: "AIzaSyBXg6GKmgyIgaKfs6Wbxq3yJ__9cV0aTHk",
  authDomain: "clinica-odontologica-c166f.firebaseapp.com",
  projectId: "clinica-odontologica-c166f",
  storageBucket: "clinica-odontologica-c166f.firebasestorage.app",
  messagingSenderId: "310420107761",
  appId: "1:310420107761:web:bc50c846870f2f7e0b1450",
  measurementId: "G-LTQM0ZRYBE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase inicializado com sucesso!");

export { auth, db };