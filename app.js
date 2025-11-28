const KEY = "ghi_sau_rieng_v6";

function load(){ return JSON.parse(localStorage.getItem(KEY)||"{}"); }
function save(d){ localStorage.setItem(KEY, JSON.stringify(d)); }

const ngayEl = document.getElementById("ngay");
const loaiSREl = document.getElementById("loaiSR");
ngayEl.value = new Date().toISOString().split("T")[0];

let hang = null;
let soLuong = "";

// Chọn loại hàng
document.querySelectorAll(".hang-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".hang-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    hang = btn.dataset.h;
  };
});

// Bàn phím số: chỉ cập nhật displaySL khi nhấn
document.querySelectorAll(".num-btn").forEach(btn=>{
  btn.onclick = ()=>{
    const v = btn.textContent;
    if(btn.id==="del"){ soLuong = soLuong.slice(0,-1); }
    else if(btn.id==="enter"){ submitData(); }
    else { if(soLuong.length<4) soLuong+=v; }
    document.getElementById("displaySL").value = soLuong;
  };
});

// Ghi dữ liệu
function submitData(){
  if(!hang){ alert("Chọn loại hàng"); return; }
  if(!soLuong){ alert("Nhập số lượng"); return; }

  const d = load();
  const ngay = ngayEl.value;
  const loaiSR = loaiSREl.value;

  if(!d[ngay]) d[ngay]=[];
  d[ngay].push({loaiSR, hang, soLuong:Number(soLuong)});

  save(d);
  soLuong = "";
  document.getElementById("displaySL").value = "";
  render();
}

// Render tổng cộng & lịch sử
function render(){
  const d = load();
  const ngay = ngayEl.value;
  const loaiSR = loaiSREl.value;

  // Tổng từng loại cho ngày + loại sầu riêng
  let tA=0,tB=0,tC=0;
  if(d[ngay]){
    d[ngay].forEach(item=>{
      if(item.loaiSR===loaiSR){
        if(item.hang==="A") tA+=item.soLuong;
        if(item.hang==="B") tB+=item.soLuong;
        if(item.hang==="C") tC+=item.soLuong;
      }
    });
  }

  document.getElementById("tongA").textContent = tA;
  document.getElementById("tongB").textContent = tB;
  document.getElementById("tongC").textContent = tC;
  document.getElementById("tongAll").textContent = tA+tB+tC;

  // Lịch sử thu gọn
  const out = document.getElementById("lichSu");
  out.innerHTML = "";
  const days = Object.keys(d).sort((a,b)=>b.localeCompare(a));

  days.forEach(day=>{
    const dayBox = document.createElement("div");
    dayBox.className="history-day";

    const title = document.createElement("div");
    title.className="history-title";
    title.textContent = day;
    title.style.cursor="pointer";

    const content = document.createElement("div");
    content.style.display="none";

    // Nhóm theo loại hàng
    const group = {A:[], B:[], C:[]};
    d[day].forEach(x=>group[x.hang].push(x));

    ["A","B","C"].forEach(h=>{
      if(group[h].length>0){
        const hDiv = document.createElement("div");
        hDiv.innerHTML=`<div><span class="tag">Hạng ${h}</span></div>`;
        const list = document.createElement("div"); list.className="history-list";
        group[h].forEach(x=>list.innerHTML+=`<div class="item-line">${x.loaiSR}: ${x.soLuong}</div>`);
        hDiv.appendChild(list);
        content.appendChild(hDiv);
      }
    });

    title.onclick = ()=>{ content.style.display = content.style.display==="none"?"block":"none"; }

    dayBox.appendChild(title);
    dayBox.appendChild(content);
    out.appendChild(dayBox);
  });
}

// Update khi thay đổi ngày hoặc loại sầu riêng
ngayEl.onchange = render;
loaiSREl.onchange = render;

render();
