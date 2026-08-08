/* ── Profile Page ── */

const ProfilePage = {
  render() {
    const app = document.getElementById('app');
    if (!Auth.user) {
      Auth.openModal();
      Router.go('#/');
      return;
    }

    const { email, name, phone = '', address1 = '', address2 = '', address3 = '', pincode = '' } = Auth.user;

    app.innerHTML = `
      <div class="container">
        <div class="profile-page fade-in">
          <h1 class="profile-page__title">My Profile</h1>
          <div class="profile-card">
            <form class="profile-form" id="profile-form" onsubmit="ProfilePage.handleSave(event)">
              
              <div class="profile-form__row">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" id="prof-name" value="${name}" required>
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" value="${email}" readonly>
                </div>
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" id="prof-phone" value="${phone}" placeholder="10-digit mobile number" pattern="[0-9]{10}" required>
              </div>

              <div class="form-group">
                <label>Address Line 1 (Flat/House No., Building)</label>
                <input type="text" id="prof-addr1" value="${address1}" placeholder="e.g. Flat 101, Sea View Apartments" required>
              </div>

              <div class="form-group">
                <label>Address Line 2 (Street, Area, Sector)</label>
                <input type="text" id="prof-addr2" value="${address2}" placeholder="e.g. MG Road, Sector 14" required>
              </div>

              <div class="form-group">
                <label>Address Line 3 (Landmark/City/State)</label>
                <input type="text" id="prof-addr3" value="${address3}" placeholder="e.g. Near City Mall, Mumbai, Maharashtra" required>
              </div>

              <div class="form-group">
                <label>Pincode</label>
                <input type="text" id="prof-pincode" value="${pincode}" placeholder="6-digit pincode" pattern="[0-9]{6}" required>
              </div>

              <div class="profile-form__actions">
                <button type="submit" class="btn btn--primary btn--block btn--lg" id="prof-submit">Save Profile</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
    window.scrollTo({ top: 0 });
  },

  async handleSave(e) {
    e.preventDefault();
    const btn = document.getElementById('prof-submit');
    const oldText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
      const name = document.getElementById('prof-name').value;
      const phone = document.getElementById('prof-phone').value;
      const address1 = document.getElementById('prof-addr1').value;
      const address2 = document.getElementById('prof-addr2').value;
      const address3 = document.getElementById('prof-addr3').value;
      const pincode = document.getElementById('prof-pincode').value;

      const { dbOps, db } = window.firebaseClient;
      const userRef = dbOps.doc(db, 'users', Auth.user.uid);
      
      const profileData = {
        name,
        phone,
        address1,
        address2,
        address3,
        pincode,
        profileCompleted: true
      };

      await dbOps.setDoc(userRef, profileData, { merge: true });

      // Update local state
      Auth.user = { ...Auth.user, ...profileData };
      
      // Update Auth header in case name changed
      Auth.renderHeader();

      Toast.show('Profile updated successfully!', 'success');
      
      // If they came from cart checkout attempting, they can go back to cart, or we just let them go to home
      // Checking if cart has items to suggest next step
      if (Store.cartCount() > 0) {
        Router.go('#/cart');
      }

    } catch (err) {
      console.error(err);
      Toast.show('Failed to save profile. Please try again.', 'error');
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  }
};
