/* =======================================================
   app.js — FULL CHUẨN HOÁ ĐƠN DOANH NGHIỆP + QUẢN LÝ KHÁCH
   ======================================================= */

/* ===== PWA WARNING ===== */
if (!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone) {
  const b = document.getElementById("notPwaMsg");
  if (b) b.classList.remove("hidden");
}

/* ===== LOCAL STORAGE KEYS ===== */
const LS_RECORDS   = "sr_records";
const LS_CUSTOMER  = "sr_customer";
const LS_CUST_LIST = "sr_cust_list";
const LS_PRICES    = "sr_prices";
const LS_TOA       = "sr_toa";
const LS_INVNAME   = "sr_invname";
const APP_PASSWORD = "minhluan";

/* ===== DATA ===== */
let records  = JSON.parse(localStorage.getItem(LS_RECORDS)   || "[]");
let customer = JSON.parse(localStorage.getItem(LS_CUSTOMER)  || "{}");
let custList = JSON.parse(localStorage.getItem(LS_CUST_LIST) || "[]");
let prices   = JSON.parse(localStorage.getItem(LS_PRICES)    || "{}");

let currentType = null;
let currentCat  = null;
let inputValue  = "";

/* ===== DOM ===== */
const pwScreen   = document.getElementById("passwordScreen");
const pwInput    = document.getElementById("pwInput");
const pwLoginBtn = document.getElementById("pwLoginBtn");

const dateInput   = document.getElementById("dateInput");
const datePill    = document.getElementById("datePill");
const historyDate = document.getElementById("historyDate");

const toaInput         = document.getElementById("toaInput");
const invoiceNameInput = document.getElementById("invoiceNameInput");

const typeBtns = document.querySelectorAll(".type-btn");
const catBtns  = document.querySelectorAll(".cat-btn");

const display = document.getElementById("display");

const sumA = document.getElementById("sumA");
const sumB = document.getElementById("sumB");
const sumC = document.getElementById("sumC");
const sumD = document.getElementById("sumD");
const sumK = document.getElementById("sumK");
const totalAll = document.getElementById("totalAll");

const historyTable = document.getElementById("historyTable");
const historyBody  = document.getElementById("historyBody");
const clearAllBtn  = document.getElementById("clearAll");
const toggleBtn    = document.getElementById("toggleBtn");

const togglePriceBtn = document.getElementById("togglePriceBtn");
const pricesRow      = document.getElementById("pricesRow");
const priceInputs    = document.querySelectorAll(".price-input");

const custInfoBtn    = document.getElementById("custInfoBtn");
const custPopup      = document.getElementById("custPopup");
const saveCustBtn    = document.getElementById("saveCustBtn");
const closeCustBtn   = document.getElementById("closeCustBtn");

const custListBtn      = document.getElementById("custListBtn");
const custListPopup    = document.getElementById("custListPopup");
const closeCustListBtn = document.getElementById("closeCustListBtn");
const searchCust       = document.getElementById("searchCust");
const custListBox      = document.getElementById("custListBox");

const exportInvBtn  = document.getElementById("exportInvBtn");
const invPopup      = document.getElementById("invPopup");
const invoiceContent= document.getElementById("invoiceContent");
const printInvBtn   = document.getElementById("printInvBtn");
const closeInvBtn   = document.getElementById("closeInvBtn");

/* ===== PASSWORD ===== */
if (!localStorage.getItem("auth_ok")) pwScreen.classList.remove("hidden");

pwLoginBtn.onclick = () => {
  if (pwInput.value.trim() === APP_PASSWORD) {
    localStorage.setItem("auth_ok", "1");
    pwScreen.classList.add("hidden");
  } else alert("Sai mật khẩu!");
};

/* ===== HELPER ===== */
const fmt = n => Number(n).toLocaleString("vi-VN");
const toLocalISO = d => new Date(d.getTime() - d.getTimezoneOffset()*60000)
  .toISOString().slice(0,10);
const fDate = d => { d = new Date(d); return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };

/* ==== ĐỌC SỐ THÀNH CHỮ ==== */
function numberToWords(num) {
  if (num === 0) return "không";

  const units = ["", "nghìn", "triệu", "tỷ"];
  const nums = ["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];

  function read3Digits(n){
    let tr = Math.floor(n/100);
    let ch = Math.floor((n%100)/10);
    let dv = n%10;
    let str = "";

    if (tr > 0){
      str += nums[tr] + " trăm ";
      if (ch == 0 && dv > 0) str += "lẻ ";
    }
    if (ch > 1){
      str += nums[ch] + " mươi ";
      if (dv == 1) str += "mốt ";
      else if (dv == 5) str += "lăm ";
      else if (dv > 0) str += nums[dv] + " ";
    } else if (ch == 1){
      str += "mười ";
      if (dv > 0) str += nums[dv] + " ";
    } else if (ch == 0 && dv > 0){
      str += nums[dv] + " ";
    }
    return str.trim();
  }

  let i = 0;
  let words = "";

  while (num > 0){
    let part = num % 1000;
    if (part > 0){
      let p = read3Digits(part);
      words = p + " " + units[i] + " " + words;
    }
    num = Math.floor(num/1000);
    i++;
  }
  return words.trim();
}

/* ===== INIT DATE ===== */
dateInput.value = toLocalISO(new Date());
datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

dateInput.onchange = () => {
  datePill.textContent = fDate(dateInput.value);
  historyDate.textContent = fDate(dateInput.value);
  renderSummary();
  renderHistory();
};

/* ===== TYPE ===== */
typeBtns.forEach(btn => {
  btn.onclick = () => {
    typeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentType = btn.dataset.type;
    renderSummary();
    renderHistory();
  };
});

/* ===== CAT ===== */
catBtns.forEach(btn => {
  btn.onclick = () => {
    catBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCat = btn.dataset.cat;
  };
});

/* ===== KEYPAD ===== */
document.querySelectorAll(".num").forEach(btn => {
  btn.onclick = () => {
    if (!currentType || !currentCat)
      return alert("Chọn THÁI/RI và loại A/B/C/D/K!");

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
    customer: invoiceNameInput.value || "",
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

/* ===== DISPLAY ===== */
function updateDisplay(){
  if (!inputValue){
    display.textContent = "SỐ LƯỢNG";
    display.style.color = "#ccc";
  } else {
    display.textContent = fmt(inputValue);
    display.style.color = "#111";
  }
}

/* ===== SUMMARY ===== */
function renderSummary(){
  let S = {A:0,B:0,C:0,D:0,K:0};
  const custName = invoiceNameInput.value || "";

  records.forEach(r => {
    if (
      r.type === currentType &&
      r.date === dateInput.value &&
      r.customer === custName
    ){
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

/* ===== HISTORY ===== */
function makeCell(item){
  const td = document.createElement("td");
  if (item){
    td.textContent = fmt(item.qty);
    const del = document.createElement("span");
    del.textContent = " X";
    del.className = "del-btn";
    del.onclick = () => deleteRecord(item.id);
    td.appendChild(del);
  }
  return td;
}

function renderHistory(){
  historyTable.innerHTML = "";
  if (!currentType) return;

  const custName = invoiceNameInput.value || "";

  const list = records
    .filter(r =>
      r.type === currentType &&
      r.date === dateInput.value &&
      r.customer === custName
    )
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

/* ===== CLEAR ALL ===== */
clearAllBtn.onclick = () => {
  if (!confirm("Xóa toàn bộ dữ liệu ngày này?")) return;

  const custName = invoiceNameInput.value || "";

  records = records.filter(
    r => !(r.date === dateInput.value && r.customer === custName)
  );

  localStorage.setItem(LS_RECORDS, JSON.stringify(records));
  renderSummary();
  renderHistory();
};

/* ===== TOGGLE HISTORY ===== */
toggleBtn.onclick = () => {
  historyBody.classList.toggle("hidden");
  toggleBtn.textContent = historyBody.classList.contains("hidden") ? "HIỆN" : "ẨN";
};

/* ===== POPUP KHÁCH ===== */
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

  // Thêm vào DS KH nếu chưa có
  if (customer.name && !custList.some(c => c.name === customer.name)) {
    custList.push({
      name: customer.name,
      phone: customer.phone,
      stk: customer.stk,
      tkname: customer.tkname,
      bank: customer.bank,
      lastDate: dateInput.value
    });
    localStorage.setItem(LS_CUST_LIST, JSON.stringify(custList));
  }

  custPopup.classList.add("hidden");
  alert("Đã lưu thông tin khách!");
};

/* ===== DS KH ===== */
custListBtn.onclick = () => {
  renderCustomerList();
  custListPopup.classList.remove("hidden");
};
closeCustListBtn.onclick = () => custListPopup.classList.add("hidden");

searchCust.oninput = (e) => renderCustomerList(e.target.value);

function renderCustomerList(keyword = ""){
  custListBox.innerHTML = "";
  const kw = keyword.toLowerCase();

  custList
    .filter(c => c.name.toLowerCase().includes(kw))
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(c => {
      const div = document.createElement("div");
      div.style.padding = "10px";
      div.style.borderBottom = "1px solid #eee";
      div.style.cursor = "pointer";

      div.innerHTML = `<b>${c.name}</b><br><small>${c.phone || ""} — ${c.bank || ""}</small>`;

      div.onclick = () => {
        invoiceNameInput.value = c.name;
        localStorage.setItem(LS_INVNAME, c.name);

        custListPopup.classList.add("hidden");
        renderSummary();
        renderHistory();
      };

      custListBox.appendChild(div);
    });
}

/* ===== PRICES ===== */
togglePriceBtn.onclick = () => pricesRow.classList.toggle("hidden");

priceInputs.forEach(inp => {
  inp.value = prices[inp.dataset.cat] || "";
  inp.onchange = () => {
    prices[inp.dataset.cat] = Number(inp.value) || 0;
    localStorage.setItem(LS_PRICES, JSON.stringify(prices));
  };
});

/* ===== EXPORT INVOICE ===== */
exportInvBtn.onclick = () => {
  if (!currentType) return alert("Chọn THÁI hoặc RI!");

  const date = dateInput.value;
  const custName = invoiceNameInput.value || "";

  const list = records.filter(
    r => r.type === currentType &&
         r.date === date &&
         r.customer === custName
  );

  const sums = {A:0,B:0,C:0,D:0,K:0};
  list.forEach(r => sums[r.cat] += r.qty);

  const toa = toaInput.value;

  let html = `
<div style="font-family:Arial; padding:18px;">
  <div style="text-align:left; margin-bottom:10px;">
    <div style="font-weight:bold; font-size:18px;">CTY TNHH HUỲNH NƯƠNG</div>
    <div style="font-size:13px; margin-top:2px;">
      Chuyên: KINH DOANH - MUA BÁN - XUẤT KHẨU CÁC LOẠI TRÁI CÂY<br>
      Cơ sở 1: Ngũ Hiệp, Đồng Tháp<br>
      Cơ sở 2: Krông Pak, Đắk Lắk<br>
      Điện thoại: 0984 712 606 – 0353 631 084
    </div>
  </div>

  <h2 style="text-align:center; margin:5px 0 10px 0;">HÓA ĐƠN</h2>

  <div style="font-size:14px; margin-bottom:10px;">
    <div><b>Ngày:</b> ${fDate(date)}</div>
    <div><b>Toa số:</b> ${toa}</div>
    <div><b>Khách hàng:</b> ${custName}</div>
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:14px;">
    <thead>
      <tr>
        <th style="border:1px solid #333; padding:6px;">Loại</th>
        <th style="border:1px solid #333; padding:6px;">SL</th>
        <th style="border:1px solid #333; padding:6px;">Giá</th>
        <th style="border:1px solid #333; padding:6px;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>
`;

  let total = 0;
  ["A","B","C","D","K"].forEach(cat => {
    const qty = sums[cat];
    const price = prices[cat] || 0;
    const amount = qty * price;
    total += amount;

    html += `
      <tr>
        <td style="border:1px solid #333; padding:6px;">${cat}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(qty)}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(price)}</td>
        <td style="border:1px solid #333; padding:6px; text-align:right;">${fmt(amount)}</td>
      </tr>
    `;
  });

  html += `
    </tbody>
  </table>

  <h3 style="text-align:right; margin-top:10px;">Tổng cộng: ${fmt(total)}</h3>

  <div style="margin-top:6px; font-size:14px;">
    <b>Thành tiền (bằng chữ):</b> ${numberToWords(total)} đồng
  </div>

  <div style="margin-top:10px; font-size:14px;">
    <b>STK:</b> ${customer.stk || ""}<br>
    <b>Ngân hàng:</b> ${customer.bank || ""}<br>
    <b>Tên tài khoản:</b> ${customer.tkname || ""}
  </div>

  <div style="margin-top:20px; text-align:right; font-size:14px;">
    Ngày xuất hóa đơn: ${fDate(new Date())}<br>
    <b>Người viết hóa đơn:</b> MY
  </div>
</div>
`;

  invoiceContent.innerHTML = html;
  invPopup.classList.remove("hidden");
};

closeInvBtn.onclick = () => invPopup.classList.add("hidden");
printInvBtn.onclick  = () => window.print();

/* ===== INIT ===== */
function init(){
  toaInput.value = localStorage.getItem(LS_TOA) || "";
  invoiceNameInput.value = localStorage.getItem(LS_INVNAME) || "";

  toaInput.onchange = () => localStorage.setItem(LS_TOA, toaInput.value);
  invoiceNameInput.onchange = () =>
    localStorage.setItem(LS_INVNAME, invoiceNameInput.value);

  updateDisplay();
  renderSummary();
  renderHistory();
}
init();
