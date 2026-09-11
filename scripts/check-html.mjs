import fs from "fs";
import vm from "vm";

const h = fs.readFileSync("chatimage.html", "utf8");
const start = h.indexOf("<script>") + 8;
const end = h.lastIndexOf("</script>");
const code = h.slice(start, end);

// Smoke-test parse only (no DOM)
try {
  new vm.Script(code);
  console.log("syntax: ok");
} catch (e) {
  console.log("syntax: FAIL", e.message);
}

console.log("storageGet:", code.includes("storageGet"));
console.log("default edit:", code.includes('cat: "edit"'));
console.log("DATA length chunk:", (code.match(/"id":"edit"/) || []).length);
