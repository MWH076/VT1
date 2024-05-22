// script.js
const firebaseConfig = {
    apiKey: "AIzaSyDWCgxs5Bha9pkZvqyAtqtzr3i64a6iBx0",
    authDomain: "vote12-781f5.firebaseapp.com",
    projectId: "vote12-781f5",
    storageBucket: "vote12-781f5.appspot.com",
    messagingSenderId: "581220240192",
    appId: "1:581220240192:web:17948fbd9e9663737a48a5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const loginButton = document.getElementById('login-btn');
const voteForm = document.getElementById('voteForm');
const resultsContainer = document.getElementById('results');

loginButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(result => {
        const user = result.user;
        checkIfUserHasVoted(user.uid);
    }).catch(error => {
        console.error(error);
    });
});

function checkIfUserHasVoted(userId) {
    db.collection('votes').doc(userId).get().then(doc => {
        if (doc.exists) {
            alert('You have already voted!');
        } else {
            voteForm.style.display = 'block';
            loginButton.style.display = 'none';
        }
    });
}

voteForm.addEventListener('submit', event => {
    event.preventDefault();
    const formData = new FormData(voteForm);
    const selectedOption = formData.get('vote');
    if (!selectedOption) {
        alert('Please select an option to vote!');
        return;
    }
    const userId = auth.currentUser.uid;
    db.collection('votes').doc(userId).set({
        option: selectedOption
    }).then(() => {
        updateVoteCount(selectedOption);
    });
});

function updateVoteCount(selectedOption) {
    const optionDoc = db.collection('options').doc(selectedOption);
    optionDoc.update({
        count: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        alert('Vote recorded successfully!');
        voteForm.style.display = 'none';
        showResults();
    });
}

function showResults() {
    db.collection('options').get().then(querySnapshot => {
        let totalVotes = 0;
        const results = {};
        querySnapshot.forEach(doc => {
            results[doc.id] = doc.data().count;
            totalVotes += doc.data().count;
        });
        for (const option in results) {
            const percentage = ((results[option] / totalVotes) * 100).toFixed(2);
            document.getElementById(`progress-${option}`).style.width = `${percentage}%`;
            document.getElementById(`percentage-${option}`).innerText = `${percentage}%`;
        }
    });
}

auth.onAuthStateChanged(user => {
    if (user) {
        checkIfUserHasVoted(user.uid);
    }
});

document.addEventListener('DOMContentLoaded', showResults);