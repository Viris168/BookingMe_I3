const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const localeDir = path.join(root, "data", "lang");
const enPath = path.join(localeDir, "en.json");
const kmPath = path.join(localeDir, "km.json");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const km = JSON.parse(fs.readFileSync(kmPath, "utf8"));

const sections = ["key", "attr"];
let hasError = false;

function compareSection(section) {
  const enKeys = Object.keys(en[section] || {});
  const kmKeys = Object.keys(km[section] || {});
  const missingInKm = enKeys.filter((key) => !kmKeys.includes(key));
  const extraInKm = kmKeys.filter((key) => !enKeys.includes(key));

  console.log(`${section}: en=${enKeys.length}, km=${kmKeys.length}`);

  if (missingInKm.length) {
    hasError = true;
    console.log(`  Missing in km.${section}:`);
    missingInKm.forEach((key) => console.log(`  - ${key}`));
  }

  if (extraInKm.length) {
    hasError = true;
    console.log(`  Extra in km.${section}:`);
    extraInKm.forEach((key) => console.log(`  - ${key}`));
  }
}

sections.forEach(compareSection);

const oldEnglishKeyCount = Object.keys(en.text || {}).length;
const oldKhmerKeyCount = Object.keys(km.text || {}).length;

console.log(`text fallback: en=${oldEnglishKeyCount}, km=${oldKhmerKeyCount}`);
console.log("Note: text fallback is allowed during migration, but new UI should use stable data-i18n keys.");

if (hasError) {
  process.exitCode = 1;
}
