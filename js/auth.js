/* ── Auth Component ── */

const Auth = {
  user: null,
  isLoginMode: true,

  async init() {
    return new Promise((resolve) => {
      const { authOps, auth, dbOps, db } = window.firebaseClient;
      authOps.onAuthStateChanged(auth, async (user) => {
        if (user) {
          let extraData = {};
          try {
            const docSnap = await dbOps.getDoc(dbOps.doc(db, 'users', user.uid));
            if (docSnap.exists()) {
              extraData = docSnap.data();
            }
          } catch(e) { console.error("Error fetching profile", e); }

          // Keep a simple user object
          this.user = {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            role: (user.email === 'admin@medstore.com' || user.email === 'admin@menstore.com') ? 'admin' : 'user', // simple admin check for now
            ...extraData
          };
        } else {
          this.user = null;
        }
        this.renderHeader();
        resolve();
      });
    });
  },

  openModal() {
    this.isLoginMode = true;
    this.updateModalUI();
    document.getElementById('auth-error').style.display = 'none';
    document.getElementById('auth-backdrop').classList.add('open');
  },

  closeModal() {
    document.getElementById('auth-backdrop').classList.remove('open');
  },

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.updateModalUI();
  },

  updateModalUI() {
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nameField = document.getElementById('auth-name-group');
    const submitBtn = document.getElementById('auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');

    document.getElementById('auth-error').style.display = 'none';

    if (this.isLoginMode) {
      title.textContent = 'Welcome Back';
      subtitle.textContent = 'Sign in to access your account and orders.';
      nameField.style.display = 'none';
      submitBtn.textContent = 'Sign In';
      toggleText.innerHTML = `New to PADMAVATI MEDICALS? <a onclick="Auth.toggleMode()">Create an account</a>`;
    } else {
      title.textContent = 'Create Account';
      subtitle.textContent = 'Join PADMAVATI MEDICALS for exclusive discounts.';
      nameField.style.display = 'block';
      submitBtn.textContent = 'Register';
      toggleText.innerHTML = `Already have an account? <a onclick="Auth.toggleMode()">Sign In</a>`;
    }
  },

  async handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const errEl = document.getElementById('auth-error');
    errEl.style.display = 'none';

    const { authOps, auth } = window.firebaseClient;

    try {
      if (this.isLoginMode) {
        await authOps.signInWithEmailAndPassword(auth, email, password);
        Toast.show('Signed in successfully!');
      } else {
        const userCredential = await authOps.createUserWithEmailAndPassword(auth, email, password);
        await authOps.updateProfile(userCredential.user, { displayName: name });
        // The onAuthStateChanged listener will catch the update, but we might want to manually set the name temporarily
        this.user = { ...this.user, name: name }; 
        Toast.show('Account created!');
      }

      this.closeModal();
      Router.init();
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      let msg = `Authentication failed: ${err.message || err.code}`;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') msg = 'Invalid credentials.';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  },

  async logout() {
    const { authOps, auth } = window.firebaseClient;
    try {
      await authOps.signOut(auth);
      Toast.show('Logged out');
      if (window.location.hash === '#/admin' || window.location.hash === '#/orders') {
        Router.go('#/');
      }
    } catch (err) {
      console.error(err);
    }
  },

  renderHeader() {
    const authArea = document.getElementById('header-auth');
    if (!authArea) return;

    if (this.user) {
      authArea.innerHTML = `
        <div style="position:relative;cursor:pointer" onclick="this.querySelector('.dropdown').classList.toggle('open')">
          <div style="display:flex;align-items:center;gap:8px;font-weight:600">
            <div style="width:32px;height:32px;background:var(--primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px">
              ${this.user.name.charAt(0).toUpperCase()}
            </div>
            <span>Hi, ${this.user.name.split(' ')[0]}</span>
          </div>
          <div class="dropdown" style="position:absolute;top:40px;right:0;background:#fff;border:1px solid var(--b1);border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.1);padding:8px 0;width:150px;display:none;z-index:100">
            ${this.user.role === 'admin' ? `<a href="#/admin" style="display:block;padding:8px 16px;color:var(--t1)">Admin Panel</a>` : ''}
            <a href="#/profile" style="display:block;padding:8px 16px;color:var(--t1)">My Profile</a>
            <a onclick="Auth.logout()" style="display:block;padding:8px 16px;color:var(--danger);cursor:pointer">Log Out</a>
          </div>
        </div>
        <style>
          .dropdown.open { display: block !important; }
          .dropdown a:hover { background: var(--bg2); }
        </style>
      `;
    } else {
      authArea.innerHTML = `
        <button class="btn btn--primary" onclick="Auth.openModal()" style="padding:8px 16px">Sign In</button>
      `;
    }
  }
};
