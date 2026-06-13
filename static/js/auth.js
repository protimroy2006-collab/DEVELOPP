import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    RecaptchaVerifier, 
    signInWithPhoneNumber,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC-OAGtnOqptiDwKqYTMLXPsSTP0YMsPp4",
    authDomain: "develop-4f593.firebaseapp.com",
    projectId: "develop-4f593",
    storageBucket: "develop-4f593.firebasestorage.app",
    messagingSenderId: "53408019177",
    appId: "1:53408019177:web:b46163471159de7ff73678"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authModal = document.getElementById('auth-modal');
const openAuthBtn = document.getElementById('open-auth-btn');
const closeModal = document.querySelector('.close-modal');

const googleLoginBtn = document.getElementById('btn-google-login');
const phoneLoginBtn = document.getElementById('btn-phone-login');
const verifyOtpBtn = document.getElementById('btn-verify-otp');
const phoneInput = document.getElementById('phone-input');
const otpInput = document.getElementById('otp-input');
const phoneSection = document.getElementById('phone-auth-section');
const otpSection = document.getElementById('otp-section');
const errorMsg = document.getElementById('auth-error-msg');
const successMsg = document.getElementById('auth-success-msg');

let confirmationResult = null;

function showMessage(msg, isError = false) {
    if (isError) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
    } else {
        successMsg.textContent = msg;
        successMsg.style.display = 'block';
        errorMsg.style.display = 'none';
    }
}

// Modal Logic
if (openAuthBtn && authModal && closeModal) {
    openAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // If already logged in, click implies logout
        if (auth.currentUser) {
            signOut(auth).then(() => {
                openAuthBtn.innerHTML = '<i class="fas fa-user-circle"></i> Login';
                showMessage("Logged out successfully.");
            });
            return;
        }
        
        authModal.classList.add('show');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
    });

    closeModal.addEventListener('click', () => {
        authModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('show');
        }
    });
}

// Watch Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        const displayName = user.displayName || user.phoneNumber || "User";
        openAuthBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout (${displayName})`;
        authModal.classList.remove('show');
    } else {
        // User is signed out
        openAuthBtn.innerHTML = '<i class="fas fa-user-circle"></i> Login';
    }
});

// Google Sign-In
googleLoginBtn.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            showMessage(`Welcome ${user.displayName}!`, false);
            setTimeout(() => authModal.classList.remove('show'), 1000);
        })
        .catch((error) => {
            showMessage(error.message, true);
        });
});

// Initialize Recaptcha (Required for Phone Auth)
function setupRecaptcha() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA solved
            }
        });
    }
}

// Send OTP
phoneLoginBtn.addEventListener('click', () => {
    const phoneNumber = phoneInput.value.trim();
    if (!phoneNumber) {
        showMessage("Please enter a valid phone number", true);
        return;
    }
    
    if (!phoneNumber.startsWith('+')) {
        showMessage("Please include your country code (e.g., +91 for India)", true);
        return;
    }

    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;

    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((result) => {
            confirmationResult = result;
            phoneSection.style.display = 'none';
            otpSection.style.display = 'block';
            showMessage("OTP sent successfully!", false);
        })
        .catch((error) => {
            showMessage(error.message, true);
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        });
});

// Verify OTP
verifyOtpBtn.addEventListener('click', () => {
    const code = otpInput.value.trim();
    if (!code) {
        showMessage("Please enter the OTP.", true);
        return;
    }

    confirmationResult.confirm(code).then((result) => {
        const user = result.user;
        showMessage("Successfully logged in!", false);
        setTimeout(() => {
            authModal.classList.remove('show');
            phoneSection.style.display = 'block';
            otpSection.style.display = 'none';
        }, 1000);
    }).catch((error) => {
        showMessage("Invalid OTP code.", true);
    });
});

// Contact Form Submission (Firestore)
const inquiryForm = document.getElementById('inquiry-form');
const inqSuccessMsg = document.getElementById('inquiry-success');
const inqErrorMsg = document.getElementById('inquiry-error');

if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = inquiryForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        inqSuccessMsg.style.display = 'none';
        inqErrorMsg.style.display = 'none';

        const name = document.getElementById('inq-name').value.trim();
        const email = document.getElementById('inq-email').value.trim();
        const phone = document.getElementById('inq-phone').value.trim();
        const message = document.getElementById('inq-message').value.trim();

        try {
            await addDoc(collection(db, "inquiries"), {
                name: name,
                email: email,
                phone: phone,
                message: message,
                status: 'new',
                createdAt: serverTimestamp()
            });

            inquiryForm.reset();
            inqSuccessMsg.style.display = 'block';
        } catch (error) {
            console.error("Error adding document: ", error);
            inqErrorMsg.textContent = "Error sending message: " + error.message;
            inqErrorMsg.style.display = 'block';
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}
