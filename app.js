// Mọi code gói trong initApp()
function initApp(){
const KEY = "ghi_sau_rieng_v14";

const app = document.getElementById("app-container");
app.innerHTML = `
<!-- CHỌN NGÀY + LOẠI SẦU RIÊNG -->
<div class="card select-card">
  <div class="select-line"><input type="date" id="ngay"></div>
  <div class="select-line">
    <select id="loaiSR">
      <option value="Thai">Thái</option>
      <option value="Ri">Ri</option>
    </select>
  </div>
</div>

<!-- TỔNG CỘNG -->
<div class="card totals-card">
  <h2>Tổng cộng</h2>
  <div class="totals">
    <div class="total-box">A<br><strong id="tongA">0</strong></div>
    <div class="total-box">B<br><strong id="tongB">0</strong></div>
    <div class="total-box">C<br><strong id="tongC">0</strong></div>
  </div>
  <div class="total-box total-all">Tổng<br><strong id="tongAll">0</strong></div>
</div>

<!-- NHẬP LIỆU -->
<div class="card input-card">
  <div class="hang-group">
    <div class="hang-btn" data-h="A">A</div>
    <div class="hang-btn" data-h="B">B</div>
    <div class="hang-btn" data-h="C">C</div>
  </div>
  <input id="displaySL" disabled placeholder="Số lượng">
  <div class="numpad">
    <button class="num-btn">1</button>
    <button class="num-btn">2</button>
    <button class="num-btn">3</button>
    <button class="num-btn">4</button>
    <button class="num-btn">5</button>
    <button class="num-btn">6</button>
    <button class="num-btn">7</button>
    <button class="num-btn">8</button>
    <button class="num-btn">9</button>
    <button class="num-btn" id="del">⌫</button>
    <button class="num-btn">0</button>
    <button class="num-btn" id="enter">↵</button>
  </div>
</div>

<!-- LỊCH SỬ + XÓA TOÀN BỘ -->
<div class="card history-card">
  <h2>Lịch sử</h2>
  <div id="lichSu" class="history-container"></div>
  <button class="small-btn" id="xoaTat">XÓA DỮ LIỆU</button>
</div>
`;

// INIT
const ngayEl = document.getElementById("ngay");
const loaiSREl = document.getElementById("loaiSR");
const displayEl = document.getElementById("displaySL");
const btnXoa = document.getElementById("xoaTat");

ngayEl.value = new Date().toISOString().split("T")[0];

let hang=null, soLuong="";

// Load/Save
function load(){ return JSON.parse(localStorage.getItem(KEY)||"{}"); }
function save(d){ localStorage.setItem(KEY,JSON.stringify(d)); }

// Chọn loại hàng
document.querySelectorAll(".hang-btn").forEach(btn=>{
  btn.onclick = ()=>{
    document.querySelectorAll(".hang-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    hang = btn.dataset.h;
  };
});

// Format số kiểu 1.000
function formatNum(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,"."); }

// Bàn phím số
document.querySelectorAll(".num-btn").forEach(btn=>{
  btn.onclick = ()=>{
    const v = btn.textContent;
    if(btn.id==="del"){ soLuong=soLuong.slice(0,-1); }
    else if(btn.id==="enter"){ submitData(); }
    else { if(soLuong.length<6) soLuong+=v; }
    displayEl.value = soLuong?formatNum(soLuong):"";
  };
});

function submitData(){
  if(!hang){ alert("Chọn loại hàng"); return; }
  if(!soLuong){ alert("Nhập số lượng"); return; }

  const d = load();
  const ngay = ngayEl.value;
  const loaiSR = loaiSREl.value;

  if(!d[ngay]) d[ngay]=[];
  d[ngay].push({loaiSR, hang, soLuong:Number(soLuong)});
  save(d);

  soLuong=""; displayEl.value="";
  render();
}

// Xóa toàn bộ dữ liệu
btnXoa.onclick = ()=>{
  if(confirm("Xóa toàn bộ dữ liệu?")){
    localStorage.removeItem(KEY);
    render();
  }
}

// Render tổng cộng & lịch sử
function render(){
  const d = load();
  const ngay = ngayEl.value;
  const loaiSR = loaiSREl.value;

  // Tổng cộng
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
  document.getElementById("tongA").textContent=formatNum(tA);
  document.getElementById("tongB").textContent=formatNum(tB);
  document.getElementById("tongC").textContent=formatNum(tC);
  document.getElementById("tongAll").textContent=formatNum(tA+tB+tC);

  // Lịch sử
  const out=document.getElementById("lichSu");
  out.innerHTML="";
  const days=Object.keys(d).sort((a,b)=>b.localeCompare(a));
  days.forEach(day=>{
    const dayBox=document.createElement("div"); dayBox.className="history-day";

    const title=document.createElement("div"); title.className="history-title"; title.textContent=day;
    title.style.cursor="pointer";

    const content=document.createElement("div"); content.style.display="none";

    const group={A:[],B:[],C:[]};
    d[day].forEach((x,idx)=>{ group[x.hang].push({...x, idx}); });

    ["A","B","C"].forEach(h=>{
      if(group[h].length>0){
        const hDiv=document.createElement("div");
        hDiv.innerHTML=`<div><span class="tag">Hạng ${h}</span></div>`;
        const list=document.createElement("div"); list.className="history-list";
        group[h].forEach(x=>{
          const itemLine=document.createElement("div");
          itemLine.className="item-line";
          itemLine.innerHTML=`${x.loaiSR}: ${formatNum(x.soLuong)} `;
          const delBtn=document.createElement("button"); delBtn.textContent="XÓA"; delBtn.className="small-btn";
          delBtn.onclick=()=>{
            if(confirm("Xóa mục này?")){
              d[day].splice(x.idx,1);
              if(d[day].length===0) delete d[day];
              save(d); render();
            }
          };
          itemLine.appendChild(delBtn);
          list.appendChild(itemLine);
        });
        hDiv.appendChild(list);
        content.appendChild(hDiv);
      }
    });

    title.onclick=()=>{ content.style.display=content.style.display==="none"?"block":"none"; }

    dayBox.appendChild(title);
    dayBox.appendChild(content);
    out.appendChild(dayBox);
  });
}

ngayEl.onchange=render;
loaiSREl.onchange=render;
render();
}

window.initApp = initApp;
