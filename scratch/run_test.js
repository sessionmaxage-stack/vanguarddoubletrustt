const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const PORT = 3099;
const testHtmlPath = path.join(__dirname, "test.html");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && (req.url === "/" || req.url === "/test.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(fs.readFileSync(testHtmlPath));
    return;
  }
  if (req.method === "POST" && req.url === "/log") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      console.log("[BROWSER]", body);
      res.writeHead(200);
      res.end("ok");
      if (body.includes("=== Automated Test Finished ===")) {
        setTimeout(() => {
          console.log("[SERVER] Test finished. Exiting.");
          process.exit(0);
        }, 500);
      }
    });
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, () => {
  console.log(`[SERVER] Listening on http://localhost:${PORT}`);
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const cmd = `"${edgePath}" --headless --disable-gpu --no-sandbox http://localhost:${PORT}/test.html`;
  console.log(`[SERVER] Launching: ${cmd}`);
  exec(cmd, (err, stdout, stderr) => {
    if (err) console.error("[EDGE ERR]", err);
  });
});
