import fs from "fs";

const src = fs.readFileSync("src/lib/effects.ts", "utf8");
const start = src.indexOf("export const EFFECT_CATEGORIES");
const slice = src.slice(start);

const cats = [];
const catRe =
  /\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?effects:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;
let c;
while ((c = catRe.exec(slice))) {
  const list = [];
  const er =
    /e\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"/g;
  let e;
  while ((e = er.exec(c[3]))) {
    list.push({
      id: e[1],
      code: e[2],
      label: e[3],
      description: e[4],
    });
  }
  if (list.length) cats.push({ id: c[1], title: c[2], effects: list });
}

const subjectMap = {
  edit: ["person", "animal", "product", "place", "other"],
  person: ["person", "other"],
  animal: ["animal", "other"],
  light: ["person", "animal", "product", "place", "other"],
  cinema: ["person", "animal", "product", "place", "other"],
  camera: ["person", "animal", "product", "place", "other"],
  photo: ["person", "animal", "product", "other"],
  weather: ["person", "animal", "product", "place", "other"],
  style: ["person", "animal", "product", "place", "other"],
  material: ["product", "place", "other"],
  tech: ["product", "other"],
  "product-3d": ["product", "other"],
  product: ["product", "other"],
  "product-ads": ["product", "other"],
  "space-edit": ["place", "other"],
};

const withSubjects = cats.map((cat) => ({
  ...cat,
  subjects: subjectMap[cat.id] || ["other"],
}));

fs.writeFileSync(
  "scripts/effects-dump.json",
  JSON.stringify(withSubjects, null, 2),
);
console.log(withSubjects.map((x) => `${x.id} | ${x.title}: ${x.effects.length}`).join("\n"));
