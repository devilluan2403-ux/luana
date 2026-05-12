/* =========================================
        CHẶN IOS SAFARI - CHỈ CHẠY PWA
========================================= */

const isIOS = /iphone|ipad|ipod/i.test(
    navigator.userAgent
);

if (
    isIOS &&
    !window.matchMedia('(display-mode: standalone)').matches &&
    !navigator.standalone
) {

    document.body.innerHTML = `
        <div style="padding:20px; font-size:22px; text-align:center;">
            Hỏng có gì để xem hết luôn á.<br><br>
            Liu liu.
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

let records = JSON.parse(
    localStorage.getItem(LS_KEY) || "[]"
);

let currentType  = null;
let currentCat   = null;

let currentPlate = "";
let currentSTT   = "";

let inputValue   = "";


/* =========================================
                  ELEMENTS
========================================= */

const dateInput = document.getElementById("dateInput");
const datePill  = document.getElementById("datePill");

const khoInput  = document.getElementById("khoInput");

const typeBtns  = document.querySelectorAll(".type-btn");
const catBtns   = document.querySelectorAll(".cat-btn");

const plateInput = document.getElementById("plateInput");
const sttInput   = document.getElementById("sttInput");

const display   = document.getElementById("display");


/* SUMMARY */

const sumA      = document.getElementById("sumA");
const sumB      = document.getElementById("sumB");
const sumC      = document.getElementById("sumC");

const sumDAT    = document.getElementById("sumDAT");
const sumKEM    = document.getElementById("sumKEM");

const totalAll  = document.getElementById("totalAll");


/* HISTORY */

const historyTable = document.getElementById("historyTable");
const historyBody  = document.getElementById("historyBody");

const toggleBtn    = document.getElementById("toggleBtn");
const clearAllBtn  = document.getElementById("clearAll");

const historyDate  = document.getElementById("historyDate");


/* =========================================
                  FORMAT
========================================= */

function fmt(n){

    return Number(n).toLocaleString("vi-VN", {
        maximumFractionDigits: 2
    });
}


/* =========================================
                    NGÀY
========================================= */

function toLocalISO(d){

    return new Date(
        d.getTime() - d.getTimezoneOffset()*60000
    ).toISOString().slice(0,10);
}

const savedDate = localStorage.getItem("last_date");

if (savedDate) {

    dateInput.value = savedDate;

} else {

    dateInput.value = toLocalISO(new Date());

    localStorage.setItem(
        "last_date",
        dateInput.value
    );
}


/* KHO */

khoInput.value =
    localStorage.getItem("last_kho") || "";

khoInput.addEventListener("input", ()=>{

    localStorage.setItem(
        "last_kho",
        khoInput.value
    );
});


function fDate(d){

    d = new Date(d);

    return `Ngày ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

datePill.textContent =
    fDate(dateInput.value);

historyDate.textContent =
    fDate(dateInput.value);


dateInput.addEventListener("change", ()=>{

    localStorage.setItem(
        "last_date",
        dateInput.value
    );

    datePill.textContent =
        fDate(dateInput.value);

    historyDate.textContent =
        fDate(dateInput.value);

    renderSummary();

    renderHistory();
});


/* =========================================
             NHẬP BIỂN SỐ XE
========================================= */

plateInput.addEventListener("input", ()=>{

    currentPlate = plateInput.value
        .trim()
        .toUpperCase();

    renderSummary();

    renderHistory();
});


/* =========================================
                  NHẬP STT
========================================= */

sttInput.addEventListener("input", ()=>{

    currentSTT = sttInput.value.trim();

    renderSummary();

    renderHistory();
});


/* =========================================
                 CHỌN THÁI / RI
========================================= */

typeBtns.forEach(btn=>{

    btn.addEventListener("click", ()=>{

        typeBtns.forEach(x=>{

            x.classList.remove("active");
        });

        btn.classList.add("active");

        currentType = btn.dataset.type;

        renderSummary();

        renderHistory();
    });
});


/* =========================================
             CHỌN LOẠI HÀNG
========================================= */

catBtns.forEach(btn=>{

    btn.addEventListener("click", ()=>{

        catBtns.forEach(x=>{

            x.classList.remove("active");
        });

        btn.classList.add("active");

        currentCat = btn.dataset.cat;
    });
});


/* =========================================
                   KEYPAD
========================================= */

document.querySelectorAll(".num").forEach(btn=>{

    btn.addEventListener("click", ()=>{

        if(
            !currentType ||
            !currentCat ||
            !currentPlate
        ){

            alert(
                "Vui lòng chọn THÁI/RI, loại hàng và nhập biển số xe!"
            );

            return;
        }

        const val = btn.textContent;

        if (
            val === "." &&
            inputValue.includes(".")
        ) {
            return;
        }

        if (
            val === "." &&
            inputValue === ""
        ) {
            return;
        }

        inputValue += val;

        updateDisplay();
    });
});


/* BACKSPACE */

document
.getElementById("btnBack")
.addEventListener("click", ()=>{

    inputValue = inputValue.slice(0,-1);

    updateDisplay();
});


/* =========================================
                    ENTER
========================================= */

document
.getElementById("btnEnter")
.addEventListener("click", ()=>{

    if(
        !inputValue ||
        !currentType ||
        !currentCat ||
        !currentPlate
    ){

        alert("Nhập đầy đủ thông tin!");

        return;
    }

    const rec = {

        id: Date.now(),

        group: Date.now(),

        date: dateInput.value,

        kho: khoInput.value.trim(),

        type: currentType,

        cat: currentCat,

        plate: currentPlate,

        stt: currentSTT,

        qty: Number(inputValue)
    };

    records.push(rec);

    localStorage.setItem(
        LS_KEY,
        JSON.stringify(records)
    );

    /* chỉ xoá số lượng */

    inputValue = "";

    updateDisplay();

    renderSummary();

    renderHistory();
});


/* =========================================
                  DISPLAY
========================================= */

function updateDisplay(){

    if(!inputValue){

        display.textContent = "SỐ LƯỢNG";

        display.style.color = "#cfcfcf";

    } else {

        display.textContent =
            Number(inputValue).toLocaleString("vi-VN", {

                maximumFractionDigits: 2
            });

        display.style.color = "#111";
    }
}


/* =========================================
                  SUMMARY
========================================= */

function renderSummary(){

    let A   = 0;
    let B   = 0;
    let C   = 0;

    let DAT = 0;
    let KEM = 0;

    records.forEach(r=>{

        if(
            r.type === currentType &&
            r.date === dateInput.value &&
            r.plate === currentPlate
        ){

            if(r.cat === "A") A += r.qty;

            if(r.cat === "B") B += r.qty;

            if(r.cat === "C") C += r.qty;

            if(r.cat === "DAT") DAT += r.qty;

            if(r.cat === "KEM") KEM += r.qty;
        }
    });

    sumA.textContent = fmt(A);

    sumB.textContent = fmt(B);

    sumC.textContent = fmt(C);

    sumDAT.textContent = fmt(DAT);

    sumKEM.textContent = fmt(KEM);

    totalAll.textContent =

        fmt(
            A +
            B +
            C +
            DAT +
            KEM
        );
}


/* =========================================
                   DELETE
========================================= */

function deleteRecord(id){

    if (
        !confirm(
            "Bạn có chắc muốn xoá dữ liệu này không?"
        )
    ) {
        return;
    }

    records = records.filter(
        r => r.id !== id
    );

    localStorage.setItem(
        LS_KEY,
        JSON.stringify(records)
    );

    renderSummary();

    renderHistory();
}


/* =========================================
                   HISTORY
========================================= */

function renderHistory(){

    historyTable.innerHTML = "";

    if (!currentType || !currentPlate) return;

    const list = records

        .filter(r =>

            r.type === currentType &&

            r.date === dateInput.value &&

            r.plate === currentPlate
        )

        .sort((a,b)=> b.id - a.id);


    const groups = {

        A: list.filter(r => r.cat === "A"),

        B: list.filter(r => r.cat === "B"),

        C: list.filter(r => r.cat === "C"),

        DAT: list.filter(r => r.cat === "DAT"),

        KEM: list.filter(r => r.cat === "KEM")
    };


    const maxRows = Math.max(

        groups.A.length,

        groups.B.length,

        groups.C.length,

        groups.DAT.length,

        groups.KEM.length
    );


    for (let i = 0; i < maxRows; i++) {

        const row = document.createElement("tr");


        [
            "A",
            "B",
            "C",
            "DAT",
            "KEM"
        ].forEach(cat => {

            const td =
                document.createElement("td");


            if (groups[cat][i]) {

                const item =
                    groups[cat][i];

                td.innerHTML = `
                    <div style="
                        font-weight:700;
                    ">
                        ${fmt(item.qty)}
                    </div>

                    <div style="
                        font-size:11px;
                        color:#777;
                        margin-top:3px;
                    ">
                        ${item.plate || ""}
                    </div>

                    <div style="
                        font-size:11px;
                        color:#999;
                    ">
                        STT:
                        ${item.stt || "-"}
                    </div>
                `;

                const del =
                    document.createElement("span");

                del.textContent = " X";

                del.className = "del-btn";

                del.onclick = ()=>{

                    deleteRecord(item.id);
                };

                td.appendChild(del);
            }

            row.appendChild(td);
        });

        historyTable.appendChild(row);
    }
}


/* =========================================
                 CLEAR ALL
========================================= */

clearAllBtn.addEventListener("click", ()=>{

    if(
        confirm(
            "Xoá toàn bộ dữ liệu của ngày này?"
        )
    ){

        records = records.filter(
            r =>
                !(
                    r.date === dateInput.value &&
                    r.plate === currentPlate
                )
        );

        localStorage.setItem(
            LS_KEY,
            JSON.stringify(records)
        );

        renderSummary();

        renderHistory();
    }
});


/* =========================================
                   TOGGLE
========================================= */

toggleBtn.addEventListener("click", ()=>{

    historyBody.classList.toggle("hidden");

    toggleBtn.textContent =

        historyBody.classList.contains("hidden")

            ? "HIỆN"

            : "ẨN";
});


/* =========================================
                    INIT
========================================= */
/* =========================================
      CHẶN KÉO XUỐNG RELOAD ANDROID
========================================= */

let touchStartY = 0;

document.addEventListener(
  "touchstart",
  e => {

    touchStartY = e.touches[0].clientY;
  },
  { passive:false }
);


document.addEventListener(
  "touchmove",
  e => {

    const touchY = e.touches[0].clientY;

    const isTop =
      window.scrollY <= 0;

    const pullingDown =
      touchY > touchStartY;

    if (
      isTop &&
      pullingDown
    ) {

      e.preventDefault();
    }
  },
  { passive:false }
);

updateDisplay();

renderSummary();

renderHistory();
