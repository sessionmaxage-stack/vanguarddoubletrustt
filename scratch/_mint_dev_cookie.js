// Mint dev session cookie for E2E browser test (sandbox-safe localhost only)
const { mintDevSessionCookie } = require("./_test_helper");
const uid = process.argv[2] || "fBQSVl0qGRdtWWTtn2B1EWGAwWS2";
const email = process.argv[3] || "passertech@gmail.com";
const cookie = mintDevSessionCookie(uid, email);
console.log("COOKIE=" + cookie);
console.log("UID=" + uid);
console.log("EMAIL=" + email);
