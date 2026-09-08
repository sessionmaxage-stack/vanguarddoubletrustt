const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const testHtml = fs.readFileSync(path.join(__dirname, "test.html"), "utf8");

const dom = new JSDOM(testHtml, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost:3000/customer/international.php"
});

const { window } = dom;
const { document } = window;
global.window = window;
global.document = document;

// Load swal
const swalCode = fs.readFileSync(path.join(__dirname, "swal11.js"), "utf8");
window.eval(swalCode);
const Swal = window.Swal;
console.log("Swal loaded:", Boolean(Swal), "version:", Swal.version);

// Execute all inline scripts in test.html
const scripts = document.querySelectorAll("script");
scripts.forEach((s) => {
  if (s.textContent && s.textContent.trim()) {
    try {
      window.eval(s.textContent);
    } catch (e) {
      console.error("Script eval error:", e);
    }
  }
});

(async () => {
  try {
    await window.runTest();
  } catch (err) {
    console.error("runTest threw error:", err);
  }
  console.log("\n--- Full Results from Page ---");
  console.log(document.getElementById("results")?.textContent);
  process.exit(0);
})();
