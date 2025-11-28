const KEY = "ghi_sau_rieng_v4";

function load(){ return JSON.parse(localStorage.getItem(KEY)||"{}"); }
function save(d){ localStorage.setItem(KEY,JSON.stringify(d)); }

document.getElementById("ngay").value = new Date().toISOString().split("T")[0];

let hang = null;
let soLuong = "";

// CHỌN LOẠI HÀNG
document.querySelectorAll(".hang-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".hang-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    hang = btn.dataset.h;
  };
});

// BÀN PHÍM SỐ
document.querySelectorAll(".num-btn").forEach(btn=>{
  btn.onclick = ()=>{
    const v = btn.textContent;
    if(btn.id==="del"){ soLuong = soLuong.slice(0,-1); }
    else if(btn.id==="enter"){ submitData(); }
    else { if(soLuong.length<4) soLuong+=v; }
    document.getElementById("displaySL").value = soLuong;
  };
});

// GHI DỮ LIỆU
function submitData(){
  if(!hang){ alert("Chọn loại hàng"); return; }
  if(!soLuong){ alert("Nhập số lượng"); return; }

  const d = load();
  const ngay = document.getElementById("ngay").value;
  const loaiSR = document.getElementById("loaiSR").value;

  if(!d[ngay]) d[ngay] = [];
  d[ngay].push({ loaiSR, hang, soLuong:Number(soLuong) });

  save(d);
  soLuong = "";
  document.getElementById("displaySL").value = "";
  render();
}

// RENDER TỔNG + LỊCH SỬ
function render(){
  const d = load();
  let tA=0,tB=0,tC=0;

  Object.keys(d).forEach(day=>{
    d[day].forEach(item=>{
      if(item.hang==="A") tA+=item.soLuong;
      if(item.hang==="B") tB+=item.soLuong;
      if(item.hang==="C") tC+=item.soLuong;
    });
  });

  document.getElementById("tongA").textContent=tA;
  document.getElementById("tongB").textContent=tB;
  document.getElementById("tongC").textContent=tC;

  const out = document.getElementById("lichSu");
  out.innerHTML = "";

  const days = Object.keys(d).sort((a,b)=>b.localeCompare(a));
  days.forEach(day=>{
    const box = document.createElement("div"); box.className="history-day";
    box.innerHTML=`<div class="history-title">${day}</div>`;
    const group={A:[],B:[],C:[]};
    d[day].forEach(x=>group[x.hang].push(x));

    ["A","B","C"].forEach(h=>{
      if(group[h].length>0){
        const hh = document.createElement("div");
        hh.innerHTML=`<div><span class="tag">Hạng ${h}</span></div>`;
        const list=document.createElement("div"); list.className="history-list";
        group[h].forEach(x=>list.innerHTML+=`<div class="item-line">${x.loaiSR}: ${x.soLuong}</div>`);
        hh.appendChild(list);
        box.appendChild(hh);
      }
    });

    out.appendChild(box);
  });
}

render();
