"use strict";
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sources = ["lib/core.js", "lib/instagram-adapter.js", "lib/app.js"];
const banner = `/**\n * Instagram No-Follow-Back Scanner — Read Only\n * Version: 1.1.0\n * Generated from audited modules. Run npm test before publishing.\n */\n\n`;
const output = banner + sources.map((file) => fs.readFileSync(path.join(root, file), "utf8").trim()).join("\n\n") + "\n";
const target = path.join(root, "src/instagram-no-followback-readonly.js");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, output, "utf8");
console.log(`Built ${path.relative(root, target)} (${Buffer.byteLength(output)} bytes)`);
