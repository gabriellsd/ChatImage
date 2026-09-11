import fs from "fs";

const cats = JSON.parse(fs.readFileSync("scripts/effects-dump.json", "utf8"));
// evita setas unicode quebrarem em alguns apps de envio no iOS
for (const c of cats) {
  for (const e of c.effects) {
    e.label = String(e.label).replace(/→/g, "->");
    e.description = String(e.description).replace(/→/g, "->");
  }
}
const dataJson = JSON.stringify(cats);

const defaultFavs = [
  "/motionblur",
  "/cinematicphoto",
  "/backgroundblur",
  "/proshot",
  "/identitylock",
  "/headshot",
  "/removepeople",
  "/extremecloseup",
  "/expand",
  "/posefix",
  "/35mm",
];

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#0a0c10" />
<title>ChatImage</title>
<style>
:root{
  --ink:#eef2f6;--ink-dim:#9aa8b8;--bg:#0a0c10;--panel:#12151c;--panel-2:#181c25;
  --line:#262b36;--line-hover:#3a4252;--accent:#3dbeb4;--accent-soft:rgba(61,190,180,.14);
  --warn:#e8a06a;--selected-fg:#061016;
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--ink);
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:16px;
  -webkit-text-size-adjust:100%;overflow-x:hidden}
body::before{content:"";pointer-events:none;position:fixed;inset:0;
  background:radial-gradient(900px 500px at 0% 0%,rgba(61,190,180,.07),transparent 55%),
  radial-gradient(700px 400px at 100% 100%,rgba(80,110,160,.06),transparent 50%)}
.wrap{position:relative;z-index:1;max-width:1280px;margin:0 auto;padding:16px 16px 110px}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
h1{margin:0;font-size:28px;letter-spacing:-.04em;font-weight:800}
.layout{display:grid;gap:16px}
@media(min-width:900px){.layout{grid-template-columns:40% 60%;gap:20px;align-items:start}
  .wrap{padding-bottom:24px;min-height:100dvh;display:flex;flex-direction:column}
  .layout{flex:1;min-height:0}
  aside{max-height:calc(100dvh - 80px);overflow:auto}
}
.drop{position:relative;height:42vw;min-height:180px;max-height:260px;border:1px solid var(--line);
  border-radius:14px;background:var(--panel);overflow:hidden;cursor:pointer}
@media(min-width:900px){.drop{height:auto;min-height:320px;max-height:none;aspect-ratio:4/3}}
.drop.marking{outline:1px dashed color-mix(in srgb,var(--accent) 55%,transparent);outline-offset:-6px}
.drop-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:16px}
.drop-empty strong{font-size:20px}
.drop-empty span{color:var(--ink-dim);font-size:13px}
.drop-img-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px}
.drop-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.img-box{position:relative;display:inline-block;max-width:100%;max-height:100%}
.pin{position:absolute;width:28px;height:28px;margin-left:-14px;margin-top:-14px;border:2px solid #fff;
  border-radius:999px;background:#e85d4c;color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center;z-index:2}
.actions{display:flex;flex-direction:column;gap:8px;margin-top:12px}
.btn-main{width:100%;border:0;border-radius:12px;padding:14px 16px;font-size:15px;font-weight:800;
  background:var(--accent);color:var(--selected-fg)}
.btn-main:disabled{opacity:.35}
.links{display:flex;flex-wrap:wrap;gap:8px 12px;font-size:13px}
.links button{border:0;background:0;color:var(--ink-dim);font-weight:700;padding:0}
.links button:disabled{opacity:.4}
.field{width:100%;margin-top:10px;background:var(--panel);border:1px solid var(--line);border-radius:12px;
  color:var(--ink);padding:12px 14px;font-size:15px;outline:0}
.field:focus{border-color:var(--accent)}
.field::placeholder{color:var(--ink-dim)}
aside{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:14px}
.aside-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.aside-head h2{margin:0;font-size:16px}
.aside-head button{border:0;background:0;color:var(--ink-dim);font-weight:700;font-size:13px}
.subjects{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px}
.subject{border:1px solid var(--line);background:var(--panel-2);color:var(--ink-dim);font-weight:700;
  font-size:14px;padding:8px 14px;border-radius:999px}
.subject.active{background:var(--accent);color:var(--selected-fg);border-color:var(--accent)}
.hint{margin:0 0 12px;color:var(--ink-dim);font-size:13px}
.cats{display:flex;gap:4px;overflow-x:auto;padding-bottom:10px;margin-bottom:12px;border-bottom:1px solid var(--line);
  -webkit-overflow-scrolling:touch;scrollbar-width:none}
.cats::-webkit-scrollbar{display:none}
.cat{white-space:nowrap;border:0;background:transparent;color:var(--ink-dim);font-size:14px;font-weight:600;
  padding:8px 12px;border-radius:8px}
.cat.active{background:var(--accent);color:var(--selected-fg)}
.grid{display:grid;gap:8px;grid-template-columns:1fr}
@media(min-width:520px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:1100px){.grid{grid-template-columns:1fr 1fr 1fr}}
.effect{display:flex;align-items:flex-start;gap:8px;min-height:64px;padding:12px;border-radius:10px;
  border:1px solid transparent;background:var(--panel-2)}
.effect.active{border-color:var(--accent);background:var(--accent-soft)}
.effect .body{flex:1;min-width:0;border:0;background:0;color:inherit;text-align:left;padding:0}
.effect .body strong{display:block;font-size:15px;line-height:1.3}
.effect .body span{display:block;margin-top:4px;font-size:12px;line-height:1.35;color:var(--ink-dim)}
.effect.active .body span{color:var(--accent)}
.fav{flex-shrink:0;width:34px;height:34px;border:0;border-radius:8px;background:transparent;color:var(--ink-dim);font-size:20px}
.fav.on{color:var(--accent)}
.people{margin-top:12px;border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--panel)}
.people .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.people p{margin:8px 0 0;font-size:13px;color:var(--ink-dim)}
.count{font-size:13px;color:var(--ink-dim);white-space:nowrap}
.toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--bg);
  padding:10px 14px;border-radius:10px;font-size:14px;font-weight:700;opacity:0;pointer-events:none;transition:opacity .2s;
  max-width:90vw;z-index:50}
.toast.show{opacity:1}
.empty{grid-column:1/-1;text-align:center;padding:28px 8px;color:var(--ink-dim);font-size:14px}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>ChatImage</h1>
    <span class="count" id="count">0 efeitos</span>
  </header>

  <div class="layout">
    <section>
      <div class="drop" id="drop">
        <input type="file" id="file" accept="image/png,image/jpeg,image/webp" hidden />
        <div class="drop-empty" id="empty">
          <strong>Toque para enviar a foto</strong>
          <span>PNG · JPG · WEBP</span>
        </div>
        <div class="drop-img-wrap" id="previewWrap" hidden>
          <div class="img-box" id="imgBox">
            <img id="preview" alt="Prévia" />
          </div>
        </div>
      </div>

      <div class="people" id="peoplePanel" hidden>
        <div class="row">
          <strong style="font-size:13px">Remover pessoas</strong>
          <button type="button" class="subject" id="modeAuto">Fora de foco</button>
          <button type="button" class="subject" id="modeMark">Marcar na foto</button>
          <button type="button" class="subject" id="clearMarks" hidden>Limpar marcas</button>
        </div>
        <p id="peopleHint"></p>
      </div>

      <div class="actions">
        <button class="btn-main" id="mainBtn" disabled>Copiar script</button>
        <div class="links">
          <button type="button" id="shareBtn" hidden>Enviar pro ChatGPT</button>
          <button type="button" id="changeBtn" hidden>Trocar foto</button>
          <button type="button" id="removeBtn" hidden>Remover</button>
        </div>
      </div>
      <input class="field" id="note" placeholder="Ajuste fino (opcional)" />
    </section>

    <aside>
      <div class="aside-head">
        <h2>Efeitos</h2>
        <button type="button" id="clearSel">Limpar</button>
      </div>
      <div class="subjects" id="subjects"></div>
      <p class="hint" id="hint"></p>
      <div class="cats" id="cats"></div>
      <div class="grid" id="grid"></div>
    </aside>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
const DATA = ${dataJson};
const DEFAULT_FAVS = ${JSON.stringify(defaultFavs)};
const SUBJECTS = [
  {id:"person",title:"Pessoa",hint:"Retrato, selfie, moda",promptHint:"The main subject is a person. Preserve exact face, identity, hair, skin tone and clothing unless an effect requires changing them."},
  {id:"animal",title:"Animal",hint:"Pet ou vida selvagem",promptHint:"The main subject is an animal or pet. Preserve species, markings, fur/feathers/scales color and recognizable features."},
  {id:"product",title:"Produto",hint:"Objeto, embalagem, ads",promptHint:"The main subject is a product. Preserve shape, proportions, colors, logo, label text and packaging details."},
  {id:"place",title:"Ambiente",hint:"Cômodo, local, paisagem",promptHint:"The main subject is a place, room or landscape. Preserve architecture, layout and perspective unless renovation effects are selected."},
  {id:"other",title:"Outro",hint:"Qualquer imagem",promptHint:"Edit the image according to the selected effects while preserving the main subject identity and key details."}
];
const PRESERVE = "Do not add text, watermarks or logos unless explicitly requested.";
const ALL = (()=>{const m=new Map();for(const c of DATA)for(const e of c.effects)if(!m.has(e.code))m.set(e.code,e);return m;})();

function storageGet(key, fallback){
  try{
    if(!window.localStorage) return fallback;
    const v = localStorage.getItem(key);
    return v == null ? fallback : v;
  }catch(_e){ return fallback; }
}
function storageSet(key, value){
  try{ if(window.localStorage) localStorage.setItem(key, value); }catch(_e){}
}
function loadFavs(){
  try{
    const raw = storageGet("ci-favs", null);
    if(!raw) return DEFAULT_FAVS.slice();
    const parsed = JSON.parse(raw);
    if(Array.isArray(parsed) && parsed.length) return parsed;
  }catch(_e){}
  return DEFAULT_FAVS.slice();
}

const state = {
  subject: storageGet("ci-subject", "person") || "person",
  cat: "edit",
  selected: new Set(),
  favorites: new Set(loadFavs()),
  file: null,
  markers: [],
  removeMode: "auto",
};

const $ = (id) => document.getElementById(id);
const drop = $("drop"), fileInput = $("file"), empty = $("empty"), previewWrap = $("previewWrap");
const preview = $("preview"), imgBox = $("imgBox"), toastEl = $("toast");

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(()=>toastEl.classList.remove("show"), 2400);
}

function catsForSubject(){
  return DATA.filter(c => (c.subjects || []).indexOf(state.subject) !== -1);
}

function effectsForView(){
  if(state.cat === "favorites"){
    const list = [];
    state.favorites.forEach(function(code){
      const e = ALL.get(code);
      if(e) list.push(e);
    });
    if(!list.length){
      DEFAULT_FAVS.forEach(function(code){
        const e = ALL.get(code);
        if(e) list.push(e);
      });
    }
    return list;
  }
  const cat = catsForSubject().find(function(c){ return c.id === state.cat; });
  return cat ? cat.effects : [];
}

function describePos(x,y){
  const h = x<33?"on the left side":x<66?"near the center":"on the right side";
  const v = y<33?"toward the top":y<66?"around mid-height":"toward the bottom";
  return h+", "+v+" (about "+Math.round(x)+"% from left, "+Math.round(y)+"% from top)";
}

function buildPrompt(){
  let codes = [...state.selected];
  const meta = SUBJECTS.find(s=>s.id===state.subject) || SUBJECTS[0];
  const removing = codes.includes("/removepeople") || codes.includes("/removepeoplebg");
  const selective = removing && state.removeMode==="marked" && state.markers.length>0;
  if(selective) codes = codes.map(c => (c==="/removepeople"||c==="/removepeoplebg") ? "/eraseperson" : c);

  const lines = [];
  if(selective){
    const list = state.markers.map((m,i)=>"#"+(i+1)+" "+describePos(m.x,m.y)).join("; ");
    lines.push(
      "SELECTIVE PERSON REMOVAL — read carefully before editing.",
      "Task: permanently erase ONLY the marked person(s): "+list+".",
      "Hard rules:",
      "1) Keep EVERY unmarked person in the photo — same face, body, clothes, pose and position.",
      "2) Do NOT remove all people. Do NOT empty the room. The final image MUST still show the unmarked person(s).",
      "3) Keep the ORIGINAL room/background. Reconstruct only the pixels behind the erased person.",
      "4) Do NOT make the background transparent or checkerboard.",
      "5) Ignore any generic 'remove people' interpretation — this is erase-one-person only.",
      "Effects shorthand: "+codes.join(" "),
      PRESERVE
    );
  } else {
    lines.push("Edite esta foto com estes efeitos:", codes.join(" "), meta.promptHint, PRESERVE);
    if(removing){
      lines.push("CRITICAL: keep the ORIGINAL background/room fully intact. Do NOT make transparent. Remove only out-of-focus / background people. Keep the main focused subject(s). Reconstruct the real background where people were removed.");
    }
  }
  if(codes.some(c=>["/2dto3d","/phototo3d","/photo-to-render","/depth3d","/extrude"].includes(c))){
    lines.push("Convert flat 2D product into convincing 3D. Keep brand colors, logo and proportions accurate.");
  }
  if(codes.some(c=>["/adbanner","/webbanner","/storyad","/feedad","/billboard","/metaads"].includes(c))){
    lines.push("Create advertising layout. Leave space for headline if needed, but do not invent fake prices or unreadable text.");
  }
  const note = $("note").value.trim();
  if(note) lines.push("Additional instruction: "+note);
  return lines.join("\\n");
}

function persist(){
  storageSet("ci-subject", state.subject);
  storageSet("ci-favs", JSON.stringify(Array.from(state.favorites)));
  const n = state.selected.size;
  $("count").textContent = n+" efeito"+(n===1?"":"s");
  $("mainBtn").disabled = n===0;
  const removing = state.selected.has("/removepeople") || state.selected.has("/removepeoplebg");
  $("peoplePanel").hidden = !removing;
  if(!removing){ state.markers=[]; state.removeMode="auto"; renderPins(); }
  updatePeopleUI();
  drop.classList.toggle("marking", removing && state.removeMode==="marked");
}

function updatePeopleUI(){
  $("modeAuto").classList.toggle("active", state.removeMode==="auto");
  $("modeMark").classList.toggle("active", state.removeMode==="marked");
  $("clearMarks").hidden = !(state.removeMode==="marked" && state.markers.length);
  $("peopleHint").textContent = state.removeMode==="auto"
    ? "Sem seleção: remove só quem está fora de foco / no fundo."
    : state.markers.length===0
      ? "Toque nas pessoas que quer remover."
      : state.markers.length+" marcada"+(state.markers.length===1?"":"s")+" para remover.";
}

function renderPins(){
  imgBox.querySelectorAll(".pin").forEach(p=>p.remove());
  state.markers.forEach((m,i)=>{
    const b=document.createElement("button");
    b.type="button"; b.className="pin"; b.textContent=String(i+1);
    b.style.left=m.x+"%"; b.style.top=m.y+"%";
    b.onclick=(e)=>{e.stopPropagation(); state.markers=state.markers.filter(x=>x.id!==m.id); renderPins(); updatePeopleUI();};
    imgBox.appendChild(b);
  });
}

function renderSubjects(){
  const box=$("subjects"); box.innerHTML="";
  SUBJECTS.forEach(s=>{
    const b=document.createElement("button");
    b.type="button"; b.className="subject"+(s.id===state.subject?" active":"");
    b.textContent=s.title;
    b.onclick=()=>{state.subject=s.id; state.cat="edit";
      var first = catsForSubject()[0];
      if(first) state.cat = first.id;
      render();
    };
    box.appendChild(b);
  });
  $("hint").textContent=(SUBJECTS.find(s=>s.id===state.subject)||{}).hint||"";
}

function renderCats(){
  const box=$("cats"); box.innerHTML="";
  const items=[{id:"favorites",title:"Favoritos"}, ...catsForSubject()];
  items.forEach(c=>{
    const b=document.createElement("button");
    b.type="button"; b.className="cat"+(c.id===state.cat?" active":"");
    const count=c.id==="favorites"
      ? effectsForView().filter(e=>state.selected.has(e.code)).length
      : (c.effects||[]).filter(e=>state.selected.has(e.code)).length;
    b.textContent=c.title+(count?" "+count:"");
    b.onclick=()=>{state.cat=c.id; renderGrid(); renderCats();};
    box.appendChild(b);
  });
}

function renderGrid(){
  const box=$("grid"); box.innerHTML="";
  const list=effectsForView();
  if(!list.length){
    box.innerHTML='<p class="empty">Nenhum favorito ainda. Toque na estrela de um efeito.</p>';
    return;
  }
  list.forEach(e=>{
    const row=document.createElement("div");
    row.className="effect"+(state.selected.has(e.code)?" active":"");
    const body=document.createElement("button");
    body.type="button"; body.className="body";
    body.innerHTML="<strong></strong><span></span>";
    body.querySelector("strong").textContent=e.label;
    body.querySelector("span").textContent=e.description;
    body.onclick=()=>{
      if(state.selected.has(e.code)) state.selected.delete(e.code);
      else state.selected.add(e.code);
      persist(); renderGrid(); renderCats();
    };
    const fav=document.createElement("button");
    fav.type="button"; fav.className="fav"+(state.favorites.has(e.code)?" on":"");
    fav.textContent=state.favorites.has(e.code)?"★":"☆";
    fav.onclick=(ev)=>{
      ev.stopPropagation();
      if(state.favorites.has(e.code)) state.favorites.delete(e.code);
      else state.favorites.add(e.code);
      persist(); renderGrid(); if(state.cat==="favorites") renderCats();
    };
    row.appendChild(body); row.appendChild(fav); box.appendChild(row);
  });
}

function render(){
  try{
    renderSubjects();
    renderCats();
    renderGrid();
    persist();
  }catch(err){
    var box = $("grid");
    if(box) box.innerHTML = '<p class="empty">Erro ao carregar efeitos. Abra este arquivo no Safari (Arquivos → Compartilhar → Safari).</p>';
    console && console.error && console.error(err);
  }
}

function setFile(file){
  state.file=file; state.markers=[];
  if(!file){
    empty.hidden=false; previewWrap.hidden=true; preview.removeAttribute("src");
    $("changeBtn").hidden=true; $("removeBtn").hidden=true; $("shareBtn").hidden=true;
    return;
  }
  const url=URL.createObjectURL(file);
  preview.onload=()=>URL.revokeObjectURL(url);
  preview.src=url;
  empty.hidden=true; previewWrap.hidden=false;
  $("changeBtn").hidden=false; $("removeBtn").hidden=false;
  $("shareBtn").hidden = typeof navigator.share !== "function";
  renderPins(); updatePeopleUI();
}

drop.onclick=()=>{ if(!state.file) fileInput.click(); };
fileInput.onchange=()=>{ const f=fileInput.files&&fileInput.files[0]; if(f) setFile(f); };
$("changeBtn").onclick=()=>fileInput.click();
$("removeBtn").onclick=()=>{ fileInput.value=""; setFile(null); };
$("clearSel").onclick=()=>{ state.selected.clear(); persist(); renderGrid(); renderCats(); };
$("modeAuto").onclick=()=>{ state.removeMode="auto"; state.markers=[]; renderPins(); updatePeopleUI(); drop.classList.remove("marking"); };
$("modeMark").onclick=()=>{ state.removeMode="marked"; updatePeopleUI(); drop.classList.add("marking"); };
$("clearMarks").onclick=()=>{ state.markers=[]; renderPins(); updatePeopleUI(); };

imgBox.onclick=(e)=>{
  const removing = state.selected.has("/removepeople") || state.selected.has("/removepeoplebg");
  if(!removing || state.removeMode!=="marked") return;
  const rect=imgBox.getBoundingClientRect();
  const x=((e.clientX-rect.left)/rect.width)*100;
  const y=((e.clientY-rect.top)/rect.height)*100;
  if(x<0||x>100||y<0||y>100) return;
  const near=state.markers.find(m=>Math.hypot(m.x-x,m.y-y)<4);
  if(near){ state.markers=state.markers.filter(m=>m.id!==near.id); }
  else state.markers.push({id:Date.now()+"-"+state.markers.length,x:Math.round(x*10)/10,y:Math.round(y*10)/10});
  renderPins(); updatePeopleUI();
};

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch{
    const a=document.createElement("textarea"); a.value=text; document.body.appendChild(a); a.select();
    document.execCommand("copy"); document.body.removeChild(a); return true;
  }
}

$("mainBtn").onclick=async()=>{
  if(!state.selected.size) return;
  const ok=await copyText(buildPrompt());
  toast(ok?"Script copiado. Cole no ChatGPT com a foto.":"Não foi possível copiar.");
};

$("shareBtn").onclick=async()=>{
  if(!state.file || !state.selected.size) return;
  const text=buildPrompt();
  const shareFile=new File([state.file], state.file.name||"foto.jpg", {type:state.file.type||"image/jpeg"});
  try{
    if(navigator.canShare && navigator.canShare({files:[shareFile]})){
      await navigator.share({files:[shareFile], text, title:"ChatImage"});
      toast("Toque no app ChatGPT (não no Safari).");
      return;
    }
  }catch(err){ if(err && err.name==="AbortError") return; }
  await copyText(text);
  try{ location.href="chatgpt://"; }catch(_){}
  toast("Prompt copiado. Abrindo o app…");
};

render();
</script>
</body>
</html>
`;

fs.writeFileSync("chatimage.html", html);
console.log("OK chatimage.html", Math.round(html.length / 1024), "KB");
