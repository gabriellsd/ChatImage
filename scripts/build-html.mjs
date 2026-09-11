import fs from "fs";

const cats = JSON.parse(fs.readFileSync("scripts/effects-dump.json", "utf8"));
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
@media(min-width:1024px){html,body{height:100%;overflow:hidden}}
body::before{content:"";pointer-events:none;position:fixed;inset:0;
  background:radial-gradient(900px 500px at 0% 0%,rgba(61,190,180,.07),transparent 55%),
  radial-gradient(700px 400px at 100% 100%,rgba(80,110,160,.06),transparent 50%)}
.wrap{position:relative;z-index:1;width:100%;padding:16px 16px 24px;display:flex;flex-direction:column;
  min-height:100dvh}
@media(min-width:640px){.wrap{padding-left:24px;padding-right:24px}}
@media(min-width:1024px){.wrap{padding-left:32px;padding-right:32px;height:100dvh;overflow:hidden}}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-shrink:0}
h1{margin:0;font-size:26px;letter-spacing:-.04em;font-weight:800}
@media(min-width:640px){h1{font-size:32px}}
.layout{display:grid;gap:16px;flex:1;min-height:0}
@media(min-width:1024px){.layout{grid-template-columns:38% 62%;gap:20px}}
section{display:flex;flex-direction:column;gap:12px;min-width:0}
@media(min-width:1024px){section{min-height:0}}
.drop{position:relative;height:42vw;min-height:180px;max-height:260px;border:1px solid var(--line);
  border-radius:14px;background:var(--panel);overflow:hidden;cursor:pointer}
@media(min-width:1024px){.drop{height:auto;min-height:0;max-height:none;flex:1}}
.drop.marking{outline:1px dashed color-mix(in srgb,var(--accent) 55%,transparent);outline-offset:-6px}
.drop-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:16px}
.drop-empty strong{font-size:20px}
.drop-empty span{color:var(--ink-dim);font-size:13px}
.drop-img-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px}
.drop-img-wrap img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.img-box{position:relative;display:inline-block;max-width:100%;max-height:100%}
.pin{position:absolute;width:28px;height:28px;margin-left:-14px;margin-top:-14px;border:2px solid #fff;
  border-radius:999px;background:#e85d4c;color:#fff;font-size:12px;font-weight:800;display:grid;place-items:center;z-index:2}
.actions{display:flex;flex-direction:column;gap:8px;flex-shrink:0}
.row-main{display:flex;align-items:center;gap:12px}
.btn-main{flex:1;min-width:0;border:0;border-radius:12px;padding:14px 16px;font-size:15px;font-weight:800;
  background:var(--accent);color:var(--selected-fg)}
.btn-main:disabled{opacity:.35}
.links{display:flex;flex-wrap:wrap;gap:8px 12px;font-size:13px}
.links button{border:0;background:0;color:var(--ink-dim);font-weight:700;padding:0}
.links button:disabled{opacity:.4}
.field{width:100%;flex-shrink:0;background:var(--panel);border:1px solid var(--line);border-radius:12px;
  color:var(--ink);padding:12px 14px;font-size:15px;outline:0}
.field:focus{border-color:var(--accent)}
.field::placeholder{color:var(--ink-dim)}
aside{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:14px;min-width:0;
  display:flex;flex-direction:column}
@media(min-width:1024px){aside{min-height:0;overflow:hidden}}
.aside-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-shrink:0}
.aside-head h2{margin:0;font-size:16px}
.aside-head button{border:0;background:0;color:var(--ink-dim);font-weight:700;font-size:13px}
.subjects{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;flex-shrink:0}
.subject{border:1px solid var(--line);background:var(--panel-2);color:var(--ink-dim);font-weight:700;
  font-size:14px;padding:8px 14px;border-radius:999px}
.subject.active{background:var(--accent);color:var(--selected-fg);border-color:var(--accent)}
.hint{margin:0 0 12px;color:var(--ink-dim);font-size:13px;flex-shrink:0}
.cats-nav{display:flex;align-items:center;gap:6px;min-width:0;margin-bottom:12px;border-bottom:1px solid var(--line);
  padding-bottom:2px;flex-shrink:0}
.cats-scroll{display:flex;gap:4px;flex:1;min-width:0;max-width:100%;overflow-x:auto;overflow-y:hidden;
  overscroll-behavior-x:contain;scrollbar-width:thin;scrollbar-color:var(--line-hover) transparent;
  padding-bottom:6px;cursor:grab;user-select:none;touch-action:pan-x;-webkit-overflow-scrolling:touch}
.cats-scroll.is-dragging{cursor:grabbing}
.cats-scroll.is-dragging .cat{pointer-events:none}
.cats-scroll::-webkit-scrollbar{height:6px}
.cats-scroll::-webkit-scrollbar-thumb{background:var(--line-hover);border-radius:999px}
.cats-arrow{flex-shrink:0;width:32px;height:32px;border:1px solid var(--line);border-radius:8px;
  background:var(--panel-2);color:var(--ink);font-size:16px;font-weight:700;line-height:1;cursor:pointer}
.cats-arrow:hover{border-color:var(--line-hover);color:var(--accent)}
.cat{white-space:nowrap;border:0;background:transparent;color:var(--ink-dim);font-size:14px;font-weight:600;
  padding:8px 12px;border-radius:8px}
.cat.active{background:var(--accent);color:var(--selected-fg)}
.grid{display:grid;gap:8px;grid-template-columns:1fr;align-content:start;overflow:visible}
@media(min-width:520px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:1024px){.grid{flex:1;min-height:0;overflow-y:auto;align-content:start}}
@media(min-width:1100px){.grid{grid-template-columns:1fr 1fr 1fr}}
.effect{display:flex;align-items:flex-start;gap:8px;min-height:64px;height:auto;padding:12px;border-radius:10px;
  border:1px solid transparent;background:var(--panel-2)}
.effect.active{border-color:var(--accent);background:var(--accent-soft)}
.effect .body{flex:1;min-width:0;border:0;background:0;color:inherit;text-align:left;padding:2px 0}
.effect .body strong{display:block;font-size:15px;line-height:1.3}
.effect .body span{display:block;margin-top:4px;font-size:12px;line-height:1.35;color:var(--ink-dim)}
.effect.active .body span{color:var(--accent)}
.fav{flex-shrink:0;width:34px;height:34px;border:0;border-radius:8px;background:transparent;color:var(--ink-dim);font-size:20px}
.fav.on{color:var(--accent)}
.people{border:1px solid var(--line);border-radius:12px;padding:10px 12px;background:var(--panel);flex-shrink:0}
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
        <div class="row-main">
          <button class="btn-main" id="mainBtn" disabled>Copiar script</button>
          <span class="count" id="count2">0 efeitos</span>
        </div>
        <div class="links">
          <button type="button" id="shareBtn" hidden>Enviar pro ChatGPT</button>
          <button type="button" id="changeBtn" hidden>Trocar foto</button>
          <button type="button" id="removeBtn" hidden>Remover</button>
          <button type="button" id="copyOnly" hidden>Só copiar texto</button>
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
      <div class="cats-nav">
        <button type="button" class="cats-arrow" id="catPrev" aria-label="Anteriores">‹</button>
        <div class="cats-scroll" id="cats"></div>
        <button type="button" class="cats-arrow" id="catNext" aria-label="Próximas">›</button>
      </div>
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
const ALL = (function(){var m=new Map();for(var i=0;i<DATA.length;i++){var c=DATA[i];for(var j=0;j<c.effects.length;j++){var e=c.effects[j];if(!m.has(e.code))m.set(e.code,e);}}return m;})();

function storageGet(key, fallback){
  try{ if(!window.localStorage) return fallback; var v=localStorage.getItem(key); return v==null?fallback:v; }
  catch(_e){ return fallback; }
}
function storageSet(key, value){
  try{ if(window.localStorage) localStorage.setItem(key, value); }catch(_e){}
}
function loadFavs(){
  try{
    var raw=storageGet("ci-favs", null);
    if(!raw) return DEFAULT_FAVS.slice();
    var parsed=JSON.parse(raw);
    if(Array.isArray(parsed) && parsed.length) return parsed;
  }catch(_e){}
  return DEFAULT_FAVS.slice();
}

var state = {
  subject: storageGet("ci-subject", "person") || "person",
  cat: "edit",
  selected: new Set(),
  favorites: new Set(loadFavs()),
  file: null,
  markers: [],
  removeMode: "auto",
  drag: { pointerId:null, startX:0, scrollLeft:0, dragging:false }
};

function $(id){ return document.getElementById(id); }
var drop=$("drop"), fileInput=$("file"), empty=$("empty"), previewWrap=$("previewWrap");
var preview=$("preview"), imgBox=$("imgBox"), toastEl=$("toast"), catsEl=$("cats");

function toast(msg){
  toastEl.textContent=msg; toastEl.classList.add("show");
  setTimeout(function(){ toastEl.classList.remove("show"); }, 2400);
}

function catsForSubject(){
  return DATA.filter(function(c){ return (c.subjects||[]).indexOf(state.subject)!==-1; });
}

function effectsForView(){
  if(state.cat==="favorites"){
    var list=[];
    state.favorites.forEach(function(code){ var e=ALL.get(code); if(e) list.push(e); });
    if(!list.length) DEFAULT_FAVS.forEach(function(code){ var e=ALL.get(code); if(e) list.push(e); });
    return list;
  }
  var cat=catsForSubject().filter(function(c){ return c.id===state.cat; })[0];
  return cat ? cat.effects : [];
}

function describePos(x,y){
  var h=x<33?"on the left side":x<66?"near the center":"on the right side";
  var v=y<33?"toward the top":y<66?"around mid-height":"toward the bottom";
  return h+", "+v+" (about "+Math.round(x)+"% from left, "+Math.round(y)+"% from top)";
}

function buildPrompt(){
  var codes=Array.from(state.selected);
  var meta=SUBJECTS.filter(function(s){return s.id===state.subject;})[0]||SUBJECTS[0];
  var removing=codes.indexOf("/removepeople")!==-1||codes.indexOf("/removepeoplebg")!==-1;
  var selective=removing && state.removeMode==="marked" && state.markers.length>0;
  if(selective) codes=codes.map(function(c){
    return (c==="/removepeople" || c==="/removepeoplebg")) ? "/eraseperson" : c;
  });

  var lines=[];
  if(selective){
    var list=state.markers.map(function(m,i){ return "#"+(i+1)+" "+describePos(m.x,m.y); }).join("; ");
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
  if(codes.some(function(c){return ["/2dto3d","/phototo3d","/photo-to-render","/depth3d","/extrude"].indexOf(c)!==-1;})){
    lines.push("Convert flat 2D product into convincing 3D. Keep brand colors, logo and proportions accurate.");
  }
  if(codes.some(function(c){return ["/adbanner","/webbanner","/storyad","/feedad","/billboard","/metaads"].indexOf(c)!==-1;})){
    lines.push("Create advertising layout. Leave space for headline if needed, but do not invent fake prices or unreadable text.");
  }
  var note=$("note").value.trim();
  if(note) lines.push("Additional instruction: "+note);
  return lines.join("\\n");
}

function persist(){
  storageSet("ci-subject", state.subject);
  storageSet("ci-favs", JSON.stringify(Array.from(state.favorites)));
  var n=state.selected.size;
  var label=n+" efeito"+(n===1?"":"s");
  $("count").textContent=label;
  $("count2").textContent=label;
  $("mainBtn").disabled=n===0;
  var removing=state.selected.has("/removepeople")||state.selected.has("/removepeoplebg");
  $("peoplePanel").hidden=!removing;
  if(!removing){ state.markers=[]; state.removeMode="auto"; renderPins(); }
  updatePeopleUI();
  drop.classList.toggle("marking", removing && state.removeMode==="marked");
}

function updatePeopleUI(){
  $("modeAuto").classList.toggle("active", state.removeMode==="auto");
  $("modeMark").classList.toggle("active", state.removeMode==="marked");
  $("clearMarks").hidden=!(state.removeMode==="marked" && state.markers.length);
  $("peopleHint").textContent=state.removeMode==="auto"
    ? "Sem seleção: remove só quem está fora de foco / no fundo."
    : state.markers.length===0
      ? "Toque nas pessoas que quer remover."
      : state.markers.length+" marcada"+(state.markers.length===1?"":"s")+" para remover.";
}

function renderPins(){
  Array.prototype.forEach.call(imgBox.querySelectorAll(".pin"), function(p){ p.remove(); });
  state.markers.forEach(function(m,i){
    var b=document.createElement("button");
    b.type="button"; b.className="pin"; b.textContent=String(i+1);
    b.style.left=m.x+"%"; b.style.top=m.y+"%";
    b.onclick=function(e){ e.stopPropagation(); state.markers=state.markers.filter(function(x){return x.id!==m.id;}); renderPins(); updatePeopleUI(); };
    imgBox.appendChild(b);
  });
}

function renderSubjects(){
  var box=$("subjects"); box.innerHTML="";
  SUBJECTS.forEach(function(s){
    var b=document.createElement("button");
    b.type="button"; b.className="subject"+(s.id===state.subject?" active":"");
    b.textContent=s.title;
    b.onclick=function(){
      state.subject=s.id;
      var first=catsForSubject()[0];
      state.cat=first?first.id:"edit";
      render();
    };
    box.appendChild(b);
  });
  $("hint").textContent=(SUBJECTS.filter(function(s){return s.id===state.subject;})[0]||{}).hint||"";
}

function renderCats(){
  var box=catsEl; box.innerHTML="";
  var items=[{id:"favorites",title:"Favoritos"}].concat(catsForSubject());
  items.forEach(function(c){
    var b=document.createElement("button");
    b.type="button"; b.className="cat"+(c.id===state.cat?" active":"");
    var count=0;
    if(c.id==="favorites"){
      effectsForView().forEach(function(e){ if(state.selected.has(e.code)) count++; });
    } else {
      (c.effects||[]).forEach(function(e){ if(state.selected.has(e.code)) count++; });
    }
    b.textContent=c.title+(count?" "+count:"");
    b.onclick=function(){ if(state.drag.dragging) return; state.cat=c.id; renderGrid(); renderCats(); };
    box.appendChild(b);
  });
}

function renderGrid(){
  var box=$("grid"); box.innerHTML="";
  var list=effectsForView();
  if(!list.length){
    box.innerHTML='<p class="empty">Nenhum efeito nesta categoria.</p>';
    return;
  }
  list.forEach(function(e){
    var row=document.createElement("div");
    row.className="effect"+(state.selected.has(e.code)?" active":"");
    var body=document.createElement("button");
    body.type="button"; body.className="body";
    body.innerHTML="<strong></strong><span></span>";
    body.querySelector("strong").textContent=e.label;
    body.querySelector("span").textContent=e.description;
    body.onclick=function(){
      if(state.selected.has(e.code)) state.selected.delete(e.code); else state.selected.add(e.code);
      persist(); renderGrid(); renderCats();
    };
    var fav=document.createElement("button");
    fav.type="button"; fav.className="fav"+(state.favorites.has(e.code)?" on":"");
    fav.textContent=state.favorites.has(e.code)?"★":"☆";
    fav.onclick=function(ev){
      ev.stopPropagation();
      if(state.favorites.has(e.code)) state.favorites.delete(e.code); else state.favorites.add(e.code);
      persist(); renderGrid(); if(state.cat==="favorites") renderCats();
    };
    row.appendChild(body); row.appendChild(fav); box.appendChild(row);
  });
}

function render(){
  try{ renderSubjects(); renderCats(); renderGrid(); persist(); }
  catch(err){
    var box=$("grid");
    if(box) box.innerHTML='<p class="empty">Erro ao carregar efeitos.</p>';
    console.error(err);
  }
}

function setFile(file){
  state.file=file; state.markers=[];
  if(!file){
    empty.hidden=false; previewWrap.hidden=true; preview.removeAttribute("src");
    $("changeBtn").hidden=true; $("removeBtn").hidden=true; $("shareBtn").hidden=true; $("copyOnly").hidden=true;
    return;
  }
  var url=URL.createObjectURL(file);
  preview.onload=function(){ URL.revokeObjectURL(url); };
  preview.src=url;
  empty.hidden=true; previewWrap.hidden=false;
  $("changeBtn").hidden=false; $("removeBtn").hidden=false; $("copyOnly").hidden=false;
  $("shareBtn").hidden = typeof navigator.share !== "function";
  renderPins(); updatePeopleUI();
}

function scrollCats(dir){
  catsEl.scrollBy({ left: dir * Math.max(160, catsEl.clientWidth * 0.55), behavior: "smooth" });
}

$("catPrev").onclick=function(){ scrollCats(-1); };
$("catNext").onclick=function(){ scrollCats(1); };

catsEl.addEventListener("pointerdown", function(e){
  if(e.button!==0 && e.pointerType==="mouse") return;
  state.drag={ pointerId:e.pointerId, startX:e.clientX, scrollLeft:catsEl.scrollLeft, dragging:false };
});
catsEl.addEventListener("pointermove", function(e){
  var d=state.drag; if(d.pointerId!==e.pointerId) return;
  var delta=e.clientX-d.startX;
  if(!d.dragging){
    if(Math.abs(delta)<8) return;
    d.dragging=true;
    try{ catsEl.setPointerCapture(e.pointerId); }catch(_e){}
    catsEl.classList.add("is-dragging");
  }
  catsEl.scrollLeft=d.scrollLeft-delta;
  e.preventDefault();
});
function endDrag(e){
  var d=state.drag; if(d.pointerId!==e.pointerId) return;
  if(d.dragging){
    try{ catsEl.releasePointerCapture(e.pointerId); }catch(_e){}
    catsEl.classList.remove("is-dragging");
  }
  setTimeout(function(){ state.drag={ pointerId:null, startX:0, scrollLeft:0, dragging:false }; }, 0);
}
catsEl.addEventListener("pointerup", endDrag);
catsEl.addEventListener("pointercancel", endDrag);
catsEl.addEventListener("wheel", function(e){
  var delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  if(!delta || catsEl.scrollWidth<=catsEl.clientWidth) return;
  catsEl.scrollLeft+=delta; e.preventDefault();
}, {passive:false});

drop.onclick=function(){ if(!state.file) fileInput.click(); };
fileInput.onchange=function(){ var f=fileInput.files&&fileInput.files[0]; if(f) setFile(f); };
$("changeBtn").onclick=function(){ fileInput.click(); };
$("removeBtn").onclick=function(){ fileInput.value=""; setFile(null); };
$("clearSel").onclick=function(){ state.selected.clear(); persist(); renderGrid(); renderCats(); };
$("modeAuto").onclick=function(){ state.removeMode="auto"; state.markers=[]; renderPins(); updatePeopleUI(); drop.classList.remove("marking"); };
$("modeMark").onclick=function(){ state.removeMode="marked"; updatePeopleUI(); drop.classList.add("marking"); };
$("clearMarks").onclick=function(){ state.markers=[]; renderPins(); updatePeopleUI(); };

imgBox.onclick=function(e){
  var removing=state.selected.has("/removepeople")||state.selected.has("/removepeoplebg");
  if(!removing || state.removeMode!=="marked") return;
  var rect=imgBox.getBoundingClientRect();
  var x=((e.clientX-rect.left)/rect.width)*100;
  var y=((e.clientY-rect.top)/rect.height)*100;
  if(x<0||x>100||y<0||y>100) return;
  var near=state.markers.filter(function(m){ return Math.hypot(m.x-x,m.y-y)<4; })[0];
  if(near) state.markers=state.markers.filter(function(m){ return m.id!==near.id; });
  else state.markers.push({id:Date.now()+"-"+state.markers.length,x:Math.round(x*10)/10,y:Math.round(y*10)/10});
  renderPins(); updatePeopleUI();
};

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch(_e){
    var a=document.createElement("textarea"); a.value=text; document.body.appendChild(a); a.select();
    document.execCommand("copy"); document.body.removeChild(a); return true;
  }
}

$("mainBtn").onclick=async function(){
  if(!state.selected.size) return;
  if(state.file && typeof navigator.share==="function"){
    try{
      var shareFile=new File([state.file], state.file.name||"foto.jpg", {type:state.file.type||"image/jpeg"});
      if(navigator.canShare && navigator.canShare({files:[shareFile]})){
        await navigator.share({files:[shareFile], text:buildPrompt(), title:"ChatImage"});
        toast("Toque no app ChatGPT (não no Safari).");
        return;
      }
    }catch(err){ if(err && err.name==="AbortError") return; }
  }
  var ok=await copyText(buildPrompt());
  toast(ok?"Script copiado. Cole no ChatGPT com a foto.":"Não foi possível copiar.");
};

$("shareBtn").onclick=async function(){
  if(!state.file || !state.selected.size) return;
  var text=buildPrompt();
  var shareFile=new File([state.file], state.file.name||"foto.jpg", {type:state.file.type||"image/jpeg"});
  try{
    if(navigator.canShare && navigator.canShare({files:[shareFile]})){
      await navigator.share({files:[shareFile], text:text, title:"ChatImage"});
      toast("Toque no app ChatGPT (não no Safari).");
      return;
    }
  }catch(err){ if(err && err.name==="AbortError") return; }
  await copyText(text);
  try{ location.href="chatgpt://"; }catch(_e){}
  toast("Prompt copiado. Abrindo o app…");
};

$("copyOnly").onclick=async function(){
  if(!state.selected.size) return;
  var ok=await copyText(buildPrompt());
  toast(ok?"Prompt copiado.":"Não foi possível copiar.");
};

// botão principal muda texto no iPhone
if(typeof navigator.share==="function") $("mainBtn").textContent="Enviar pro ChatGPT";

render();
</script>
</body>
</html>
`;

fs.writeFileSync("chatimage.html", html);
console.log("OK chatimage.html", Math.round(html.length / 1024), "KB");
