/* =========================================
        CHẶN SAFARI - CHỈ CHẠY PWA
   ========================================= */
if (!window.matchMedia('(display-mode: standalone)').matches &&
    !navigator.standalone) {
    document.body.innerHTML = `
        <div style="padding:20px; font-size:22px; text-align:center;">
            Ứng dụng chỉ hoạt động khi được thêm vào Màn hình chính.<br><br>
            Chân thành cảm ơn.
        </div>
    `;
}

/* =========================================
                 MẬT KHẨU
   ========================================= */

const APP_PASSWORD = "minhluan";

const pwScreen   = document.getElementById("passwordScreen");
const pwInput    = document.getElementById("pwInput");
const pwLoginBtn = document.getElementById("pwLoginBtn");

// Nếu chưa xác nhận lần đầu → yêu cầu nhập 1 lần
if (!localStorage.getItem("auth_ok")) {
    pwScreen.classList.remove("hidden");
}

pwLoginBtn.addEventListener("click", ()=>{
    if (pwInput.value.trim() === APP_PASSWORD) {
        localStorage.setItem("auth_ok", "1");
        pwScreen.classList.add("hidden");
    } else {
        alert("Sai mật khẩu!");
    }
});


/* =========================================
                GHI SỐ - CHÍNH
   ========================================= */

const LS_KEY = "sr_records";
let records = JSON.parse(localStorage.getItem(LS_KEY) || "[]");

let currentType = null;
let currentCat  = null;
let inputValue  = "";

// ELEMENTS
const dateInput = document.getElementById("dateInput");
const datePill  = document.getElementById("datePill");
const typeBtns  = document.querySelectorAll(".type-btn");
const catBtns   = document.querySelectorAll(".cat-btn");
const display   = document.getElementById("display");

const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const totalAll = document.getElementById("totalAll");

const historyTable = document.getElementById("historyTable");
const historyBody  = document.getElementById("historyBody");
const toggleBtn    = document.getElementById("toggleBtn");
const clearAllBtn  = document.getElementById("clearAll");
const historyDate  = document.getElementById("historyDate");


/* FORMAT */
function fmt(n){
  return n.toLocaleString('vi-VN');
}


/* NGÀY */
function toLocalISO(d){
  return new Date(d.getTime() - d.getTimezoneOffset()*60000)
        .toISOString().slice(0,10);
}

dateInput.value = toLocalISO(new Date());

function fDate(d){
  d = new Date(d);
  return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

dateInput.addEventListener("change", ()=>{
  datePill.textContent = fDate(dateInput.value);
  historyDate.textContent = fDate(dateInput.value);
});


/* LOẠI THÁI / RI */
typeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    typeBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");

    currentType = btn.dataset.type;

    renderSummary();
    renderHistory();
  });
});


/* A / B / C */
catBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    catBtns.forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");

    currentCat = btn.dataset.cat;
  });
});


/* KEYPAD */
document.querySelectorAll(".num").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    if(!currentType || !currentCat){
      alert("Vui lòng chọn THÁI/RI và A/B/C!");
      return;
    }
    inputValue += btn.textContent;
    updateDisplay();
  });
});

document.getElementById("btnBack").addEventListener("click", ()=>{
  inputValue = inputValue.slice(0,-1);
  updateDisplay();
});


/* ENTER LƯU */
document.getElementById("btnEnter").addEventListener("click", ()=>{
  if(!inputValue || !currentType || !currentCat) return;

  const rec = {
    id: Date.now(),
    group: Date.now(), // giữ group riêng cho mỗi record (không gộp cứng)
    date: dateInput.value,
    type: currentType,
    cat: currentCat,
    qty: Number(inputValue)
  };

  records.push(rec);
  localStorage.setItem(LS_KEY, JSON.stringify(records));

  inputValue = "";
  updateDisplay();
  renderSummary();
  renderHistory();
});


/* DISPLAY */
function updateDisplay(){
  if(!inputValue){
    display.textContent = "SỐ LƯỢNG";
    display.style.color = "#cfcfcf";
  } else {
    display.textContent = fmt(Number(inputValue));
    display.style.color = "#111";
  }
}


/* SUMMARY */
function renderSummary(){
  let A=0,B=0,C=0;

  records.forEach(r=>{
    if(r.type===currentType && r.date === dateInput.value){
      if(r.cat==="A") A+=r.qty;
      if(r.cat==="B") B+=r.qty;
      if(r.cat==="C") C+=r.qty;
    }
  });

  sumA.textContent = fmt(A);
  sumB.textContent = fmt(B);
  sumC.textContent = fmt(C);
  totalAll.textContent = fmt(A+B+C);
}


/* XÓA TỪNG RECORD */
function deleteRecord(id){
  records = records.filter(r => r.id !== id);
  localStorage.setItem(LS_KEY, JSON.stringify(records));
  renderSummary();
  renderHistory();
}


/* LỊCH SỬ DẠNG BẢNG 3 CỘT — TỰ DỒN KHI XOÁ (MỚI → CŨ) */
function renderHistory() {
  historyTable.innerHTML = "";

  if (!currentType) return;

  const list = records
    .filter(r => r.type === currentType && r.date === dateInput.value)
    .sort((a, b) => b.id - a.id);

  const colA = list.filter(r => r.cat === "A");
  const colB = list.filter(r => r.cat === "B");
  const colC = list.filter(r => r.cat === "C");

  const maxRows = Math.max(colA.length, colB.length, colC.length);

  for (let i = 0; i < maxRows; i++) {
    const row = document.createElement("tr");

    // A
    const tdA = document.createElement("td");
    if (colA[i]) {
      tdA.textContent = fmt(colA[i].qty);
      const del = document.createElement("span");
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colA[i].id);
      tdA.appendChild(del);
    }

    // B
    const tdB = document.createElement("td");
    if (colB[i]) {
      tdB.textContent = fmt(colB[i].qty);
      const del = document.createElement("span");
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colB[i].id);
      tdB.appendChild(del);
    }

    // C
    const tdC = document.createElement("td");
    if (colC[i]) {
      tdC.textContent = fmt(colC[i].qty);
      const del = document.createElement("span");
      del.textContent = " X";
      del.className = "del-btn";
      del.onclick = ()=> deleteRecord(colC[i].id);
      tdC.appendChild(del);
    }

    row.appendChild(tdA);
    row.appendChild(tdB);
    row.appendChild(tdC);

    historyTable.appendChild(row);
  }
}


/* CLEAR ALL */
clearAllBtn.addEventListener("click", ()=>{
  if(confirm("Xoá toàn bộ dữ liệu của ngày này?")){
    records = records.filter(r => r.date !== dateInput.value);
    localStorage.setItem(LS_KEY, JSON.stringify(records));

    renderSummary();
    renderHistory();
  }
});

/* SHOW / HIDE HISTORY */
toggleBtn.addEventListener("click", ()=>{
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent =
    historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
});


/* INIT */
updateDisplay();
renderSummary();
renderHistory();
