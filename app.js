// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC21Bp-pwTT7d1YZiCOAnsCANyqtaMlEjo",
  authDomain: "tp5n-5a424.firebaseapp.com",
  databaseURL: "https://tp5n-5a424-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tp5n-5a424",
  storageBucket: "tp5n-5a424.firebasestorage.app",
  messagingSenderId: "938534529938",
  appId: "1:938534529938:web:b131c51d979c2ec7beef4b",
  measurementId: "G-HFVH0MJ7MM"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
    app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    db = getFirestore(app);
    auth = getAuth(app);

    // Enable offline persistence
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support persistence.');
        }
    });
} catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
   // alert("Erreur d'initialisation de l'application. Veuillez rafraîchir la page.");
}

// Définir les fonctions globalement
window.toggleAuthForms = function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');
};

window.login = async function() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
     //   alert('Connexion réussie !');
    } catch (error) {
        console.error('Erreur de connexion:', error);
     //   alert('Erreur lors de la connexion: ' + error.message);
    }
};

window.register = async function() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        await createUserWithEmailAndPassword(auth, email, password);
     //   alert('Inscription réussie !');
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
     //   alert('Erreur lors de l\'inscription: ' + error.message);
    }
};

// Définir la fonction de déconnexion globalement
window.deconnexion = async function() {
    try {
        console.log("Déconnexion en cours...");
        await signOut(auth);
    ///    alert('Déconnexion réussie !');
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    ///    alert('Erreur lors de la déconnexion: ' + error.message);
    }
};

window.postMessage = async function() {
    if (!auth.currentUser) {
    //    alert('Vous devez être connecté pour poster un message');
        return;
    }

    const content = document.getElementById('message-content').value;
    if (!content.trim()) return;

    try {
        await addDoc(collection(db, "messages"), {
            content: content,
            author: auth.currentUser.email,
            timestamp: serverTimestamp()
        });
        document.getElementById('message-content').value = '';
    } catch (error) {
        console.error('Erreur d\'envoi du message:', error);
       // alert('Erreur lors de l\'envoi du message: ' + error.message);
    }
};

// Fonction pour afficher les messages
function displayMessages() {
    const messagesContainer = document.getElementById('messages-container');
    if (!messagesContainer) {
        console.error("Container 'messages-container' not found");
        return;
    }

    try {
        const messagesQuery = query(
            collection(db, "messages"),
            orderBy("timestamp", "desc")
        );

        onSnapshot(messagesQuery, (snapshot) => {
            messagesContainer.innerHTML = '';

            snapshot.forEach((doc) => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                
                const date = message.timestamp ? new Date(message.timestamp.toDate()) : new Date();
                const formattedDate = date.toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                messageElement.innerHTML = `
                    <div class="message-header">
                        <span class="author">${message.author || 'Anonyme'}</span>
                        <span class="date">${formattedDate}</span>
                    </div>
                    <div class="message-content">${message.content}</div>
                `;

                messagesContainer.appendChild(messageElement);
            });
        }, (error) => {
            console.error("Erreur lors de la récupération des messages:", error);
            messagesContainer.innerHTML = '<div class="error">Erreur lors du chargement des messages. Veuillez rafraîchir la page.</div>';
        });
    } catch (error) {
        console.error("Erreur lors de la configuration de l'affichage des messages:", error);
        messagesContainer.innerHTML = '<div class="error">Erreur lors de la configuration de l\'affichage des messages.</div>';
    }
}

// Observer l'état de l'authentification
onAuthStateChanged(auth, (user) => {
    const authContainer = document.getElementById('auth-container');
    const messageForm = document.getElementById('message-form');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');

    if (user) {
        // Utilisateur connecté
        authContainer.classList.add('hidden');
        messageForm.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = `Connecté en tant que : ${user.email}`;
    } else {
        // Utilisateur déconnecté
        authContainer.classList.remove('hidden');
        messageForm.classList.add('hidden');
        userInfo.classList.add('hidden');
        userEmail.textContent = '';
    }
});

// Initialiser l'affichage des messages
document.addEventListener('DOMContentLoaded', () => {
    try {
        displayMessages();
        // Afficher le formulaire de connexion par défaut
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');

        // Attacher l'événement de déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            console.log("Bouton de déconnexion trouvé");
            logoutBtn.addEventListener('click', window.deconnexion);
        } else {
            console.error("Bouton de déconnexion non trouvé");
        }
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    //    alert("Erreur lors de l'initialisation de l'application. Veuillez rafraîchir la page.");
    }
});
