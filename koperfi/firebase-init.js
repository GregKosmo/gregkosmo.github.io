// Shared Firebase setup for the Koperfi pages.
//
// Uses the Firebase v10 compat builds (loaded via classic <script> tags in
// the page) so the existing pages can stay classic scripts with their
// inline onclick handlers untouched.
//
// Auth gate:
//   - Signed out  -> shows a "Sign in with Google" button; no data loads.
//   - Signed in with an email outside ALLOWED_EMAILS -> shows a
//     "not authorized" message and loads no data.
//   - Signed in with an allowlisted email -> the page's init runs via
//     KoperfiAuth.onAuthorized().
// The Firestore security rules are the real enforcement; this gate only
// controls what the UI loads and shows.
//
// The shared state lives in a single Firestore document, koperfi/config,
// in the same shape the app previously kept in localStorage:
//   { incomeStreams, fixedExpenses, fluctuatingExpenses,
//     expectedSpendingItems }
(function () {
    var firebaseConfig = {
        apiKey: 'AIzaSyDTMYsigxbNTOt_ZE3CdV6Uv02LW36gmvk',
        authDomain: 'koperfi.firebaseapp.com',
        projectId: 'koperfi',
        storageBucket: 'koperfi.firebasestorage.app',
        messagingSenderId: '554340948606',
        appId: '1:554340948606:web:9cd85d9c1f411fdfacd62f'
    };
    var ALLOWED_EMAILS = ['gkosmacek@gmail.com', 'janniepham2003@gmail.com'];

    firebase.initializeApp(firebaseConfig);
    var auth = firebase.auth();
    var db = firebase.firestore();
    var configDoc = db.doc('koperfi/config');

    // --- Auth bar UI (inserted above the page nav) -----------------------
    var bar = document.createElement('div');
    bar.id = 'koperfi-auth-bar';
    bar.style.cssText = 'padding:10px 14px;margin-bottom:12px;border:1px solid #ccc;border-radius:6px;font-family:inherit;';
    document.body.insertBefore(bar, document.body.firstChild);

    function renderBar(state, email, message) {
        if (state === 'signed-out') {
            bar.innerHTML = '';
            var text = document.createElement('span');
            text.textContent = 'Sign in to load your shared sinking fund. ';
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Sign in with Google';
            button.onclick = function () {
                auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function (err) {
                    console.error('Koperfi sign-in failed:', err);
                    renderBar('error', null, 'Sign-in failed. Please try again.');
                });
            };
            bar.append(text, button);
        } else if (state === 'unauthorized') {
            bar.innerHTML = '';
            var denied = document.createElement('span');
            denied.textContent = 'Signed in as ' + email + ', but this account is not authorized for this shared fund. ';
            var signOut = document.createElement('button');
            signOut.type = 'button';
            signOut.textContent = 'Sign out';
            signOut.onclick = function () {
                auth.signOut().then(function () { location.reload(); });
            };
            bar.append(denied, signOut);
        } else if (state === 'authorized') {
            bar.innerHTML = '';
            var signedIn = document.createElement('span');
            signedIn.textContent = 'Signed in as ' + email + '. ';
            var out = document.createElement('button');
            out.type = 'button';
            out.textContent = 'Sign out';
            out.onclick = function () {
                auth.signOut().then(function () { location.reload(); });
            };
            bar.append(signedIn, out);
        } else if (state === 'error') {
            bar.textContent = message || 'Something went wrong with sign-in.';
        }
    }

    // --- Auth gate --------------------------------------------------------
    var authorizedUser = null;
    var pendingCallbacks = [];

    function onAuthorized(callback) {
        if (authorizedUser) {
            callback(authorizedUser);
        } else {
            pendingCallbacks.push(callback);
        }
    }

    auth.onAuthStateChanged(function (user) {
        if (!user) {
            authorizedUser = null;
            renderBar('signed-out');
        } else if (ALLOWED_EMAILS.indexOf(user.email) === -1) {
            authorizedUser = null;
            renderBar('unauthorized', user.email);
        } else {
            authorizedUser = user;
            renderBar('authorized', user.email);
            var callbacks = pendingCallbacks.splice(0);
            callbacks.forEach(function (cb) { cb(user); });
        }
    });

    // --- Shared data access ----------------------------------------------
    window.KoperfiAuth = { onAuthorized: onAuthorized, allowedEmails: ALLOWED_EMAILS };
    window.KoperfiDB = {
        // Returns the config object, or null when the document does not exist.
        loadConfig: async function () {
            var snap = await configDoc.get();
            return snap.exists ? snap.data() : null;
        },
        // Writes the whole config object (same shape as the old localStorage
        // value) to the shared document.
        saveConfig: async function (config) {
            await configDoc.set(config);
        }
    };
})();
