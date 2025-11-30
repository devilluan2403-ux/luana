// CHẶN SAFARI - chỉ chạy PWA
if (!window.matchMedia('(display-mode: standalone)').matches && !navigator.standalone) {
  document.getElementById('notPwaMsg').classList.remove('hidden');
}

const APP_PASSWORD = 'minhluan';
const LS_KEY = 'sr_records';
const LS_CUST = 'sr_customer';
const LS_PRICES = 'sr_prices';
const LS_TOA = 'sr_toa';

let records = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
let prices = JSON.parse(localStorage.getItem(LS_PRICES) || '{}');
let customer = JSON.parse(localStorage.getItem(LS_CUST) || '{}');

let currentType = null;
let currentCat = null;
let inputValue = '';

// ELEMENTS
const dateInput = document.getElementById('dateInput');
const datePill = document.getElementById('datePill');
const typeBtns = document.querySelectorAll('.type-btn');
const catBtns = document.querySelectorAll('.cat-btn');
const display = document.getElementById('display');

const sumA = document.getElementById('sumA');
const sumB = document.getElementById('sumB');
const sumC = document.getElementById('sumC');
const sumD = document.getElementById('sumD');
const sumK = document.getElementById('sumK');
const totalAll = document.getElementById('totalAll');

const historyTable = document.getElementById('historyTable');
const historyBody = document.getElementById('historyBody');
const toggleBtn = document.getElementById('toggleBtn');
const clearAllBtn = document.getElementById('clearAll');
const historyDate = document.getElementById('historyDate');

const custInfoBtn = document.getElementById('custInfoBtn');
const custPopup = document.getElementById('custPopup');
const saveCustBtn = document.getElementById('saveCustBtn');
const closeCustBtn = document.getElementById('closeCustBtn');

const exportInvBtn = document.getElementById('exportInvBtn');
const invPopup = document.getElementById('invPopup');
const invoiceContent = document.getElementById('invoiceContent');
const printInvBtn = document.getElementById('printInvBtn');
const closeInvBtn = document.getElementById('closeInvBtn');

const toaInput = document.getElementById('toaInput');
const invoiceNameInput = document.getElementById('invoiceNameInput');

const togglePriceBtn = document.getElementById('togglePriceBtn');
const pricesRow = document.getElementById('pricesRow');
const priceInputs = document.querySelectorAll('.price-input');

/* PASSWORD UI */
const pwScreen = document.getElementById('passwordScreen');
const pwInput = document.getElementById('pwInput');
const pwLoginBtn = document.getElementById('pwLoginBtn');
if (!localStorage.getItem('auth_ok')) pwScreen.classList.remove('hidden');
pwLoginBtn.addEventListener('click', ()=>{
  if (pwInput.value.trim() === APP_PASSWORD){
    localStorage.setItem('auth_ok','1');
    pwScreen.classList.add('hidden');
  } else alert('Sai mật khẩu!');
});

/* FORMAT */
function fmt(n){ return Number(n).toLocaleString('vi-VN'); }

/* DATE */
function toLocalISO(d){ return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); }
function fDate(d){ d = new Date(d); return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; }

dateInput.value = toLocalISO(new Date());
datePill.textContent = fDate(dateInput.value);
historyDate.textContent = fDate(dateInput.value);

dateInput.addEventListener('change', ()=>{ datePill.textContent = fDate(dateInput.value); historyDate.textContent = fDate(dateInput.value); renderSummary(); renderHistory(); });

/* TYPE BTN */
typeBtns.forEach(btn=>{ btn.addEventListener('click', ()=>{ typeBtns.forEach(x=>x.classList.remove('active')); btn.classList.add('active'); currentType = btn.dataset.type; renderSummary(); renderHistory(); }); });

/* CAT BTN */
catBtns.forEach(btn=>{ btn.addEventListener('click', ()=>{ catBtns.forEach(x=>x.classList.remove('active')); btn.classList.add('active'); currentCat = btn.dataset.cat; }); });

/* KEYPAD */
document.querySelectorAll('.num').forEach(btn=>{ btn.addEventListener('click', ()=>{ if(!currentType || !currentCat){ alert('Vui lòng chọn THÁI/RI và A/B/C/D/K!'); return; } inputValue += btn.textContent; updateDisplay(); }); });

document.getElementById('btnBack').addEventListener('click', ()=>{ inputValue = inputValue.slice(0,-1); updateDisplay(); });

document.getElementById('btnEnter').addEventListener('click', ()=>{ if(!inputValue || !currentType || !currentCat) return; const rec = { id: Date.now(), group: Date.now(), date: dateInput.value, type: currentType, cat: currentCat, qty: Number(inputValue) }; records.push(rec); localStorage.setItem(LS_KEY, JSON.stringify(records)); inputValue = ''; updateDisplay(); renderSummary(); renderHistory(); });

/* DISPLAY */
function updateDisplay(){ if(!inputValue){ display.textContent = 'SỐ LƯỢNG'; display.style.color = '#cfcfcf'; } else { display.textContent = fmt(Number(inputValue)); display.style.color = '#111'; } }

/* SUMMARY */
function renderSummary(){ let A=0,B=0,C=0,D=0,K=0; records.forEach(r=>{ if(r.type===currentType && r.date===dateInput.value){ if(r.cat==='A') A+=r.qty; if(r.cat==='B') B+=r.qty; if(r.cat==='C') C+=r.qty; if(r.cat==='D') D+=r.qty; if(r.cat==='K') K+=r.qty; } }); sumA.textContent = fmt(A); sumB.textContent = fmt(B); sumC.textContent = fmt(C); sumD.textContent = fmt(D); sumK.textContent = fmt(K); totalAll.textContent = fmt(A+B+C+D+K); }

/* DELETE */
function deleteRecord(id){ records = records.filter(r=>r.id!==id); localStorage.setItem(LS_KEY, JSON.stringify(records)); renderSummary(); renderHistory(); }

/* HISTORY */
function makeCell(item){ const td = document.createElement('td'); if(item){ td.textContent = fmt(item.qty); const del = document.createElement('span'); del.textContent = ' X'; del.className = 'del-btn'; del.onclick = ()=> deleteRecord(item.id); td.appendChild(del); } return td; }

function renderHistory(){ historyTable.innerHTML = ''; if(!currentType) return; const list = records.filter(r=>r.type===currentType && r.date===dateInput.value).sort((a,b)=>b.id-a.id); const colA = list.filter(r=>r.cat==='A'); const colB = list.filter(r=>r.cat==='B'); const colC = list.filter(r=>r.cat==='C'); const colD = list.filter(r=>r.cat==='D'); const colK = list.filter(r=>r.cat==='K'); const maxRows = Math.max(colA.length, colB.length, colC.length, colD.length, colK.length); for(let i=0;i<maxRows;i++){ const row = document.createElement('tr'); row.appendChild(makeCell(colA[i])); row.appendChild(makeCell(colB[i])); row.appendChild(makeCell(colC[i])); row.appendChild(makeCell(colD[i])); row.appendChild(makeCell(colK[i])); historyTable.appendChild(row); } }

/* CLEAR ALL */
clearAllBtn.addEventListener('click', ()=>{ if(confirm('Xoá toàn bộ dữ liệu của ngày này?')){ records = records.filter(r=>r.date!==dateInput.value); localStorage.setItem(LS_KEY, JSON.stringify(records)); renderSummary(); renderHistory(); } });

/* TOGGLE HISTORY */
toggleBtn.addEventListener('click', ()=>{ historyBody.classList.toggle('hidden'); toggleBtn.textContent = historyBody.classList.contains('hidden') ? 'HIỆN' : 'ẨN'; });

/* CUSTOMER POPUP */
function openCust(){ document.getElementById('cust_name').value = customer.name || ''; document.getElementById('cust_phone').value = customer.phone || ''; document.getElementById('cust_stk').value = customer.stk || ''; document.getElementById
