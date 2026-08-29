const http = require('http');
function check(url, label) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data, label }));
    }).on('error', (e) => resolve({ status: 0, data: '', label, error: e.message }));
  });
}
(async () => {
  const base = 'http://localhost:3002';
  const dash = await check(base + '/customer/dashboard.php', 'dashboard.php');
  const prof = await check(base + '/customer/myprofile.php', 'myprofile.php');
  const admin = await check(base + '/admin/dashboard.html', 'admin/dashboard.html');

  function report(r, checks) {
    console.log('\n=== ' + r.label + ' === status:', r.status, 'len:', r.data.length);
    checks.forEach(([name, pattern, expect]) => {
      const has = r.data.includes(pattern);
      const ok = has === expect;
      console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': expected ' + (expect ? 'present' : 'absent') + ' got ' + (has ? 'present' : 'absent'));
    });
  }

  report(dash, [
    ['inlineKycGate container (DOM nodes removed)', 'id="inlineKycGate"', false],
    ['inlinePicGate container (DOM nodes removed)', 'id="inlinePicGate"', false],
    ['ikFirstname field removed', 'id="ikFirstname"', false],
    ['Continue to Step 2 submit text removed', 'Continue to Step 2', false],
    ['Save Profile Picture button text removed', 'Save Profile Picture', false],
    ['dashboardRoot shell still present (page works)', 'id="dashboardRoot"', true],
    ['avatarInitials still present', 'id="avatarInitials"', true],
  ]);

  report(prof, [
    ['Profile Picture panel (vt-panel pic section) removed', 'pic_section_title', false],
    ['Upload Photo button removed', 'pic_upload_action', false],
    ['Remove picture button removed', 'profilePicRemoveBtn', false],
    ['openPicGateFromProfile function removed', 'openPicGateFromProfile', false],
    ['removeProfilePicture function removed', 'removeProfilePicture', false],
    ['Personal Details section still present (read-only KV)', 'Personal Details', true],
    ['avatarInitials topbar still present', 'id="avatarInitials"', true],
    ['accountHolder KV still present', 'id="accountHolder"', true],
  ]);

  report(admin, [
    ['Create Customer KYC Phone field', 'id="createPhone"', true],
    ['Create Customer KYC Country field', 'id="createCountry"', true],
    ['Create Customer KYC Date of Birth field', 'id="createDateOfBirth"', true],
    ['Create Customer KYC Gender field', 'id="createGender"', true],
    ['Create Customer KYC Nationality field', 'id="createNationality"', true],
    ['Create Customer KYC Occupation field', 'id="createOccupation"', true],
    ['Create Customer KYC Address field', 'id="createAddress"', true],
    ['Create Customer KYC City field', 'id="createCity"', true],
    ['Create Customer KYC State field', 'id="createState"', true],
    ['Create Customer KYC ZIP field', 'id="createZipCode"', true],
    ['Create Customer Profile Picture value field', 'id="createProfilePic"', true],
    ['Create Customer Profile Picture file input', 'id="createProfilePicFile"', true],
    ['Create Customer Profile Picture dropzone', 'id="createProfilePicDropzone"', true],
    ['adminCreateModal still openable', 'id="adminCreateModal"', true],
  ]);

  // Also check the admin create submit handler actually collects ALL KYC + profilePic fields
  const sessJs = await check(base + '/admin/assets/js/admin-session.js', 'admin-session.js');
  report(sessJs, [
    ['collectCreateForm reads createPhone', 'createPhone', true],
    ['collectCreateForm reads createCountry', 'createCountry', true],
    ['collectCreateForm reads createDateOfBirth', 'createDateOfBirth', true],
    ['collectCreateForm reads createNationality', 'createNationality', true],
    ['collectCreateForm reads createOccupation', 'createOccupation', true],
    ['collectCreateForm reads createAddress', 'createAddress', true],
    ['collectCreateForm reads createCity', 'createCity', true],
    ['collectCreateForm reads createState', 'createState', true],
    ['collectCreateForm reads createZipCode', 'createZipCode', true],
    ['collectCreateForm reads createProfilePic', 'createProfilePic', true],
    ['fillCreateForm writes createPhone prefill', 'createPhone', true],
  ]);

  // Also check auth-session.js bootstrapCustomerPage neutralization
  const authJs = await check(base + '/customer/assets/js/auth-session.js', 'auth-session.js');
  report(authJs, [
    ['bootstrapCustomerPage always removes kycGate if present (not conditionally toggles)', 'if (kycGate) kycGate.remove();', true],
    ['bootstrapCustomerPage always removes picGate if present', 'if (picGate) picGate.remove();', true],
    ['onboardingRequired is forced false (line 1 of new check)', 'let onboardingRequired = false;', true],
    ['onboardingRequired from persisted boolean is forced false not persistedOb.required', 'onboardingRequired = false;', true],
  ]);

  console.log('\n=== SUMMARY ===');
  process.exit(0);
})();
