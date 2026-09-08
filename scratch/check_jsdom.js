const { JSDOM } = require("jsdom");
const dom = new JSDOM("<!DOCTYPE html><div style='display:block'>hello</div>");
const el = dom.window.document.querySelector("div");
console.log("offsetWidth:", el.offsetWidth);
console.log("getClientRects:", el.getClientRects().length);
