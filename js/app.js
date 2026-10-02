/* ========== Configuración de módulos ========== */
const ESTADOS=["Disponible","En ruta","Mantenimiento"], ACT=["Activo","Inactivo"];
const M={
 unidades:{label:"Unidades",icon:"🚛",lead:"Tractocamiones Thorton, remolques T-53 y camionetas de la flota.",name:r=>`${r.placa} · ${r.tipo}`,
  fields:[["placa","Placa"],["tipo","Tipo",["Tractocamión Thorton","Remolque T-53","Camioneta"]],["capacidad","Capacidad (t)","number"],["estado","Estado",ESTADOS]]},
 rutas:{label:"Rutas",icon:"🗺️",lead:"Trayectos con origen, destino y distancia.",name:r=>`${r.origen} → ${r.destino}`,
  fields:[["origen","Origen"],["destino","Destino"],["km","Distancia (km)","number"]]},
 operadores:{label:"Operadores",icon:"🧑‍✈️",lead:"Conductores con licencia, contacto y disponibilidad.",name:r=>r.nombre,
  fields:[["nombre","Nombre"],["licencia","Licencia",["Federal B","Federal C","Estatal A"]],["telefono","Teléfono","tel"],["estado","Estado",ESTADOS]]},
 clientes:{label:"Clientes",icon:"🏢",lead:"Empresas que contratan el traslado de su mercancía.",name:r=>r.empresa,
  fields:[["empresa","Empresa"],["contacto","Contacto"],["ciudad","Ciudad"],["estado","Estado",ACT]]},
 prestadores:{label:"Prestadores",icon:"🔧",lead:"Talleres, seguros, combustible y refacciones.",name:r=>r.empresa,
  fields:[["empresa","Empresa"],["servicio","Servicio",["Taller","Seguro","Combustible","Refacciones"]],["telefono","Teléfono","tel"],["estado","Estado",ACT]]}
};
const sd=(p,a)=>a.map((r,i)=>({id:p+(i+1),...r}));
const SEED={
 unidades:sd("u",[{placa:"TH-1024",tipo:"Tractocamión Thorton",capacidad:30,estado:"Disponible"},{placa:"RM-5301",tipo:"Remolque T-53",capacidad:28,estado:"Disponible"},{placa:"CM-0877",tipo:"Camioneta",capacidad:3,estado:"Disponible"},{placa:"TH-1090",tipo:"Tractocamión Thorton",capacidad:30,estado:"Mantenimiento"}]),
 rutas:sd("r",[{origen:"Puebla",destino:"Monterrey",km:1010},{origen:"Puebla",destino:"Guadalajara",km:690},{origen:"Puebla",destino:"Veracruz",km:290}]),
 operadores:sd("o",[{nombre:"Carlos Hernández",licencia:"Federal B",telefono:"222 111 2233",estado:"Disponible"},{nombre:"Luis Ramírez",licencia:"Federal C",telefono:"222 444 5566",estado:"Disponible"},{nombre:"Jorge Torres",licencia:"Estatal A",telefono:"222 777 8899",estado:"Disponible"}]),
 clientes:sd("c",[{empresa:"Abarrotes La Central",contacto:"María López",ciudad:"Monterrey",estado:"Activo"},{empresa:"Textiles del Bajío",contacto:"Pedro Sánchez",ciudad:"León",estado:"Activo"},{empresa:"Ferretería Norte",contacto:"Ana Ruiz",ciudad:"Guadalajara",estado:"Inactivo"}]),
 prestadores:sd("p",[{empresa:"Taller Diésel del Centro",servicio:"Taller",telefono:"222 300 1000",estado:"Activo"},{empresa:"Seguros Ruta Segura",servicio:"Seguro",telefono:"222 300 2000",estado:"Activo"}]),
 asignaciones:[]
};
const KEY="trazzo-datos-v2";

/* ========== Utilidades ========== */
const $=id=>document.getElementById(id);
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function load(){try{const s=localStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}return clone(SEED)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){}}
function esc(v){const d=document.createElement("div");d.textContent=v??"";return d.innerHTML}
function badge(v){const c=["Disponible","Activo"].includes(v)?"b-ok":v==="En ruta"?"b-warn":["Mantenimiento","Inactivo"].includes(v)?"b-bad":"";return c?`<span class="badge ${c}">${esc(v)}</span>`:esc(v)}
const find=(k,id)=>data[k].find(r=>r.id===id);
const label=(k,id)=>{const r=find(k,id);return r?esc(M[k].name(r)):"—"};
const opts=(k,list)=>list.map(r=>`<option value="${r.id}">${esc(M[k].name(r))}</option>`).join("");
function setEstado(k,id,e){const r=find(k,id);if(r)r.estado=e}
let data=load();

/* ========== Vistas ========== */
function tableHTML(k,q=""){
  const m=M[k],rows=data[k].filter(r=>!q||Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));
  const th=m.fields.map(f=>`<th>${f[1]}</th>`).join("")+`<th><span class="sr">Acción</span></th>`;
  const tb=rows.length?rows.map(r=>`<tr>${m.fields.map(f=>`<td>${f[0]==="estado"?badge(r.estado):esc(r[f[0]])}</td>`).join("")}<td><button class="del" data-k="${k}" data-id="${r.id}" aria-label="Eliminar" title="Eliminar">🗑</button></td></tr>`).join(""):`<tr><td class="empty" colspan="${m.fields.length+1}">No hay registros que mostrar.</td></tr>`;
  return `<thead><tr>${th}</tr></thead><tbody>${tb}</tbody>`;
}
function entityView(k){
  const m=M[k];
  const form=m.fields.map(([n,l,o])=>`<label>${l}${Array.isArray(o)?`<select name="${n}" required>${o.map(x=>`<option>${x}</option>`).join("")}</select>`:`<input name="${n}" type="${o||"text"}" ${o==="number"?'min="0"':""} required>`}</label>`).join("");
  return `<section><div class="container">
   <p class="crumbs"><a href="#/">Inicio</a> › ${m.label}</p>
   <div class="page-head"><div><h2>${m.icon} ${m.label}</h2><p class="lead">${m.lead}</p></div>
   <input type="search" id="search" placeholder="Buscar…" aria-label="Buscar en ${m.label}"></div>
   <h3>Registrar nuevo</h3>
   <form class="add" id="f-${k}" data-k="${k}" style="margin:0 0 1.2rem">${form}<button class="btn" type="submit">Agregar</button></form>
   <div class="table-wrap"><table id="tbl" data-k="${k}">${tableHTML(k)}</table></div></div></section>`;
}
function assignView(){
  const ok=data.rutas.length&&data.clientes.length;
  const libres=k=>data[k].filter(r=>r.estado==="Disponible");
  const u=libres("unidades"),o=libres("operadores"),c=data.clientes.filter(r=>r.estado==="Activo");
  const rows=data.asignaciones.map(a=>`<tr><td>${label("rutas",a.rutaId)}</td><td>${label("unidades",a.unidadId)}</td><td>${label("operadores",a.operadorId)}</td><td>${label("clientes",a.clienteId)}</td><td>${esc(a.fecha)}</td><td><button class="btn sec" data-fin="${a.id}">Finalizar</button></td></tr>`).join("");
  const hoy=new Date().toISOString().slice(0,10);
  const form=(ok&&u.length&&o.length&&c.length)?`<form class="add" id="f-asig" style="margin:0 0 1.2rem">
    <label>Ruta<select name="rutaId" required>${opts("rutas",data.rutas)}</select></label>
    <label>Unidad disponible<select name="unidadId" required>${opts("unidades",u)}</select></label>
    <label>Operador disponible<select name="operadorId" required>${opts("operadores",o)}</select></label>
    <label>Cliente<select name="clienteId" required>${opts("clientes",c)}</select></label>
    <label>Fecha de salida<input type="date" name="fecha" value="${hoy}" required></label>
    <button class="btn" type="submit">Asignar viaje</button></form>`
   :`<p class="msg">Para asignar un viaje necesitas al menos una ruta, una unidad disponible, un operador disponible y un cliente activo. Revisa las páginas de <a href="#/unidades">unidades</a>, <a href="#/operadores">operadores</a>, <a href="#/rutas">rutas</a> y <a href="#/clientes">clientes</a>.</p>`;
  return `<section><div class="container">
   <p class="crumbs"><a href="#/">Inicio</a> › Asignaciones</p>
   <h2>📋 Asignaciones</h2><p class="lead">Une una ruta con una unidad, un operador y un cliente. Al asignar, la unidad y el operador pasan a “En ruta”; al finalizar, vuelven a estar disponibles.</p>
   <h3>Nueva asignación</h3>${form}
   <h3>Viajes asignados</h3>
   <div class="table-wrap"><table><thead><tr><th>Ruta</th><th>Unidad</th><th>Operador</th><th>Cliente</th><th>Salida</th><th><span class="sr">Acción</span></th></tr></thead>
   <tbody>${rows||`<tr><td class="empty" colspan="6">Aún no hay viajes asignados.</td></tr>`}</tbody></table></div></div></section>`;
}
function homeInit(){
  $("mods").innerHTML=Object.entries(M).map(([k,m])=>`<a class="card" href="#/${k}"><div class="icon">${m.icon}</div><h3>${m.label}</h3><p>${m.lead}</p></a>`).join("")+`<a class="card" href="#/asignaciones"><div class="icon">📋</div><h3>Asignaciones</h3><p>Relaciona ruta, unidad, operador y cliente en cada viaje.</p></a>`;
  const disp=data.unidades.filter(x=>x.estado==="Disponible").length;
  const it=[["🚛",data.unidades.length,"Unidades registradas"],["✅",disp,"Unidades disponibles"],["📋",data.asignaciones.length,"Viajes en curso"],["🧑‍✈️",data.operadores.length,"Operadores"],["🏢",data.clientes.length,"Clientes"]];
  $("kpis").innerHTML=it.map(([i,n,t])=>`<div class="card kpi"><div class="icon">${i}</div><b>${n}</b>${t}</div>`).join("");
  }

/* ========== Enrutador (páginas individuales con hash) ========== */
function render(){
  const r=(location.hash.replace(/^#\/?/,"")||"inicio");
  const app=$("app");
  if(r==="inicio"){app.innerHTML="";app.append($("t-inicio").content.cloneNode(true));homeInit()}
  else if(r==="asignaciones")app.innerHTML=assignView();
  else if(M[r])app.innerHTML=entityView(r);
  else{location.hash="#/";return}
  document.querySelectorAll("nav a").forEach(a=>a.toggleAttribute("aria-current",a.dataset.r===r)||0);
  document.querySelectorAll("nav a").forEach(a=>a.dataset.r===r?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  document.title=(r==="inicio"?"":(M[r]?M[r].label:"Asignaciones")+" – ")+"TRAZZO";
  window.scrollTo(0,0);
}
window.addEventListener("hashchange",()=>{$("menu").classList.remove("open");$("menuBtn").setAttribute("aria-expanded",false);render()});

/* ========== Eventos ========== */
document.addEventListener("submit",e=>{
  e.preventDefault();const f=e.target,fd=new FormData(f);
  if(f.id==="f-asig"){
    const a={id:uid(),rutaId:fd.get("rutaId"),unidadId:fd.get("unidadId"),operadorId:fd.get("operadorId"),clienteId:fd.get("clienteId"),fecha:fd.get("fecha")};
    data.asignaciones.push(a);setEstado("unidades",a.unidadId,"En ruta");setEstado("operadores",a.operadorId,"En ruta");
  }else if(f.dataset.k){
    const k=f.dataset.k,rec={id:uid()};M[k].fields.forEach(([n])=>rec[n]=String(fd.get(n)).trim());data[k].push(rec);
  }else return;
  save();render();
});
document.addEventListener("click",e=>{
  const d=e.target.closest(".del"),fin=e.target.closest("[data-fin]");
  if(d){
    const {k,id}=d.dataset,key={unidades:"unidadId",rutas:"rutaId",operadores:"operadorId",clientes:"clienteId"}[k];
    data[k]=data[k].filter(r=>r.id!==id);
    if(key)data.asignaciones=data.asignaciones.filter(a=>a[key]!==id);
    save();render();
  }
  if(fin){
    const a=data.asignaciones.find(x=>x.id===fin.dataset.fin);
    if(a){setEstado("unidades",a.unidadId,"Disponible");setEstado("operadores",a.operadorId,"Disponible");data.asignaciones=data.asignaciones.filter(x=>x!==a);save();render()}
  }
});
document.addEventListener("input",e=>{if(e.target.id==="search"){const t=$("tbl");t.innerHTML=tableHTML(t.dataset.k,e.target.value.trim())}});
$("menuBtn").addEventListener("click",()=>{const o=$("menu").classList.toggle("open");$("menuBtn").setAttribute("aria-expanded",o)});
render();

/* ========== PWA: registro del service worker ========== */
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
