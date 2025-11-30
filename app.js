/* =======================================================
   app.js — BẢN MỚI HOÀN TOÀN, ĐỒNG BỘ 100% VỚI index.html
   ======================================================= */

/* ========= CHẶN SAFARI (chỉ chạy khi là PWA) ========= */
if (!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone) {
  const b = document.getElementById("notPwaMsg");
  if (b) b.classList.remove("hidden");
}

/* ========= LOCAL STORAGE KEYS ========= */
const LS_RECORDS = "sr_records";
const LS_CUSTOMER = "sr_customer";
const LS_PRICES = "sr_prices";
const LS_TOA = "sr_toa";
const LS_INVNAME = "sr_invname";
const APP_PASSWORD = "minhluan";

let records  = JSON.parse(localStorage.getItem(LS_RECORDS) || "[]");
let customer = JSON.parse(localStorage.getItem(LS_CUSTOMER) || "{}");
let prices   = JSON.parse(localStorage.getItem(LS_PRICES) || "{}");

let currentType = null;
let currentCat  = null;
let inputValue  = "";

/* ========= DOM ========= */
// password
const pwScreen   = document.getElementById("passwordScreen");
const pwInput    = document.getElementById("pwInput");
const pwLoginBtn = document.getElementById("pwLoginBtn");

// date
const dateInput  = document.getElementById("dateInput");
const datePill   = document.getElementById("datePill");
const historyDate= document.getElementById("historyDate");

// toa + tên KH
const toaInput          = document.getElementById("toaInput");
const invoiceNameInput  = document.getElementById("invoiceNameInput");

// type + cat
const typeBtns = document.querySelectorAll(".type-btn");
const catBtns  = document.querySelectorAll(".cat-btn");

// display
const display = document.getElementById("display");

// summary
const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const sumD = document.getElementById("sumD");
const sumK = document.getElementById("sumK");
const totalAll = document.getElementById("totalAll");

// history
const historyTable = document.getElementById("historyTable");
const historyBody  = document.getElementById("historyBody");
const clearAllBtn  = document.getElementById("clearAll");
const toggleBtn    = document.getElementById("toggleBtn");

// price
const togglePriceBtn = document.getElementById("togglePriceBtn");
const pricesRow      = document.getElementById("pricesRow");
const priceInputs    = document.querySelectorAll(".price-input");

// popup khách
const custInfoBtn  = document.getElementById("custInfoBtn");
const custPopup    = document.getElementById("custPopup");
const saveCustBtn  = document.getElementById("saveCustBtn");
const closeCustBtn = document.getElementById("closeCustBtn");

// popup hóa đơn
const exportInvBtn = document.getElementById("exportInvBtn");
const invPopup      = document.getElementById("invPopup");
const invoiceContent= document.getElementById("invoiceContent");
const printInvBtn   = document.getElementById("printInvBtn");
const closeInvBtn   = document.getElementById("closeInvBtn");

/* ========= PASSWORD ========= */
if (!localStorage.getItem("auth_ok")) pwScreen.classList.remove("hidden");

pwLoginBtn.onclick = () => {
  if (pwInput.value.trim() === APP_PASSWORD) {
    localStorage.setItem("auth_ok", "1");
    pwScreen.classList.add("hidden");
  } else alert("Sai mật khẩu!");
};

/* ========= FORMAT ========= */
const fmt = n => Number(n).toLocaleString("vi-VN");

const toLocalISO = d => new Date(d.getTime() - d.getTimezoneOffset()*60000)
  .toISOString().slice(0,10);

const fDate = d => {
  d = new Date(d);
  return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};

/* ========= NGÀY ========= */
dateInput.value = toLocalISO(new Date());
datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

dateInput.addEventListener("change", () => {
  datePill.textContent = fDate(dateInput.value);
  historyDate.textContent = fDate(dateInput.value);
  renderSummary();
  renderHistory();
});

/* ========= TYPE (THÁI / RI) ========= */
typeBtns.forEach(btn => {
  btn.onclick = () => {
    typeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    renderSummary();
    renderHistory();
  };
});

/* ========= CAT (A–K) ========= */
catBtns.forEach(btn => {
  btn.onclick = () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
  };
});

/* ========= KEYPAD ========= */
document.querySelectorAll(".num").forEach(btn => {
  btn.onclick = () => {
    if (!currentType || !currentCat) return alert("Chọn THÁI/RI và loại A/B/C/D/K!");
    inputValue += btn.textContent;
    updateDisplay();
  };
});

document.getElementById("btnBack").onclick = () => {
  inputValue = inputValue.slice(0,-1);
  updateDisplay();
};

document.getElementById("btnEnter").onclick = () => {
  if (!inputValue || !currentType || !currentCat) return;

  records.push({
    id: Date.now(),
    date: dateInput.value,
    type: currentType,
    cat: currentCat,
    qty: Number(inputValue)
  });
  localStorage.setItem(LS_RECORDS, JSON.stringify(records));
  inputValue = "";
  updateDisplay();
  renderSummary();
  renderHistory();
};

/* ========= DISPLAY ========= */
function updateDisplay(){
  if (!inputValue){
    display.textContent = "SỐ LƯỢNG";
    display.style.color = "#ccc";
  } else {
    display.textContent = fmt(inputValue);
    display.style.color = "#111";
  }
}

/* ========= SUMMARY ========= */
function renderSummary(){
  let S = {A:0, B:0, C:0, D:0, K:0};

  records.forEach(r => {
    if (r.type === currentType && r.date === dateInput.value){
      S[r.cat] += r.qty;
    }
  });

  sumA.textContent = fmt(S.A);
  sumB.textContent = fmt(S.B);
  sumC.textContent = fmt(S.C);
  sumD.textContent = fmt(S.D);
  sumK.textContent = fmt(S.K);

  totalAll.textContent = fmt(S.A+S.B+S.C+S.D+S.K);
}

/* ========= HISTORY ========= */
function makeCell(item){
  const td = document.createElement("td");
  if (item){
    td.textContent = fmt(item.qty);
    const del = document.createElement("span");
    del.textContent = " X";
    del.className = "del-btn";
    del.onclick = () => deleteRecord(item.id);

  }
  return td;
}

function renderHistory(){
  historyTable.innerHTML = "";
  if (!currentType) return;

  const list = records
    .filter(r => r.type === currentType && r.date === dateInput.value)
    .sort((a,b) => b.id - a.id);

  const col = {
    A: list.filter(r=>r.cat==='A'),
    B: list.filter(r=>r.cat==='B'),
    C: list.filter(r=>r.cat==='C'),
    D: list.filter(r=>r.cat==='D'),
    K: list.filter(r=>r.cat==='K')
  };

  const maxRows = Math.max(col.A.length, col.B.length, col.C.length, col.D.length, col.K.length);

  for (let i=0; i<maxRows; i++){
    const tr = document.createElement("tr");
    tr.appendChild(makeCell(col.A[i]));
    tr.appendChild(makeCell(col.B[i]));
    tr.appendChild(makeCell(col.C[i]));
    tr.appendChild(makeCell(col.D[i]));
    tr.appendChild(makeCell(col.K[i]));
    historyTable.appendChild(tr);
  }
}

function deleteRecord(id){
  records = records.filter(r => r.id !== id);
  localStorage.setItem(LS_RECORDS, JSON.stringify(records));
  renderSummary();
  renderHistory();
}

clearAllBtn.onclick = () => {
  if (confirm("Xóa toàn bộ dữ liệu ngày này?")){
    records = records.filter(r => r.date !== dateInput.value);
    localStorage.setItem(LS_RECORDS, JSON.stringify(records));
    renderSummary();
    renderHistory();
  }
};

toggleBtn.onclick = () => {
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent = historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
};

/* ========= POPUP KHÁCH ========= */
custInfoBtn.onclick = () => {
  document.getElementById("cust_name").value   = customer.name   || "";
  document.getElementById("cust_phone").value  = customer.phone  || "";
  document.getElementById("cust_stk").value    = customer.stk    || "";
  document.getElementById("cust_tkname").value = customer.tkname || "";
  document.getElementById("cust_bank").value   = customer.bank   || "";
  custPopup.classList.remove("hidden");
};

closeCustBtn.onclick = () => custPopup.classList.add("hidden");
saveCustBtn.onclick = () => {
  customer = {
    name   : document.getElementById("cust_name").value,
    phone  : document.getElementById("cust_phone").value,
    stk    : document.getElementById("cust_stk").value,
    tkname : document.getElementById("cust_tkname").value,
    bank   : document.getElementById("cust_bank").value
  };
  localStorage.setItem(LS_CUSTOMER, JSON.stringify(customer));
  custPopup.classList.add("hidden");
  alert("Đã lưu thông tin khách hàng!");
};

/* ========= ĐƠN GIÁ ========= */
togglePriceBtn.onclick = () => {
  pricesRow.classList.toggle("hidden");
};

priceInputs.forEach(inp => {
  inp.value = prices[inp.dataset.cat] || "";
  inp.onchange = () => {
    prices[inp.dataset.cat] = Number(inp.value) || 0;
    localStorage.setItem(LS_PRICES, JSON.stringify(prices));
  };
});

/* ========= HÓA ĐƠN ========= */
exportInvBtn.onclick = () => {
  if (!currentType) return alert("Chọn THÁI hoặc RI trước!");

  const date = dateInput.value;
  const list = records.filter(r => r.type === currentType && r.date === date);

  const sums = {A:0,B:0,C:0,D:0,K:0};
  list.forEach(r => sums[r.cat] += r.qty);

  const toa = toaInput.value;
  const invName = invoiceNameInput.value;

  let html = `
    <div style="padding:12px; font-family:Arial;">
      <h2 style="text-align:center;">HÓA ĐƠN</h2>
      <div>Ngày: ${fDate(date)}</div>
      <div>Toa số: ${toa}</div>
      <div>Tên KH: ${invName}</div>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr>
            <th style="border:1px solid #333; padding:6px;">Loại</th>
            <th style="border:1px solid #333; padding:6px;">SL</th>
            <th style="border:1px solid #333; padding:6px;">Giá</th>
            <th style="border:1px solid #333; padding:6px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>`;

  let total = 0;
  ["A","B","C","D","K"].forEach(cat => {
    const qty = sums[cat];
    const price = prices[cat] || 0;
    const amt = qty * price;
    total += amt;

    html += `
      <tr>
        <td style="border:1px solid #333; padding:6px;">${cat}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(qty)}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(price)}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(amt)}</td>
      </tr>`;
  });

  html += `</tbody></table>
      <h3 style="text-align:right; margin-top:10px;">Tổng cộng: ${fmt(total)}</h3>
      <div style="margin-top:10px;">Thông tin khách:</div>
      <div>Tên: ${customer.name || ""}</div>
      <div>SĐT: ${customer.phone || ""}</div>
      <div>STK: ${customer.stk || ""} - ${customer.tkname || ""} (${customer.bank || ""})</div>
    </div>`;

  invoiceContent.innerHTML = html;
  invPopup.classList.remove("hidden");
};

closeInvBtn.onclick = () => invPopup.classList.add("hidden");
printInvBtn.onclick = () => window.print();

/* ========= INIT ========= */
function init(){
  toaInput.value = localStorage.getItem(LS_TOA) || "";
  invoiceNameInput.value = localStorage.getItem(LS_INVNAME) || "";

  toaInput.onchange = () => localStorage.setItem(LS_TOA, toaInput.value);
  invoiceNameInput.onchange = () => localStorage.setItem(LS_INVNAME, invoiceNameInput.value);

  updateDisplay();
  renderSummary();
  renderHistory();
}
init();
