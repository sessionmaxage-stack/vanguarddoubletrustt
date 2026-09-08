const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!DOCTYPE html><div id='popup'><button id='btn'>Cancel</button></div>");
const popup = dom.window.document.getElementById("popup");
const btn = dom.window.document.getElementById("btn");

let childClicked = false;
btn.onclick = () => { childClicked = true; };

popup.addEventListener("click", (e) => {
  if (e.target.id === "btn") {
    e.stopPropagation();
    e.preventDefault();
  }
}, true); // CAPTURE PHASE

btn.click();
console.log("childClicked with capture stopPropagation:", childClicked);
