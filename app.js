const KEY = "ghi_sau_rieng_v9";

document.addEventListener("DOMContentLoaded",()=>{

  const ngayEl = document.getElementById("ngay");
  const loaiSREl = document.getElementById("loaiSR");
  const displayEl = document.getElementById("displaySL");
  const btnXoa = document.getElementById("xoaTat");

  ngayEl.value = new Date().toISOString().split("T")[0];

  let hang = null;
  let soLuong = "";

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
      if(btn.id==="del"){ soLuong = soLuong.slice(0,-1); }
      else if(btn.id==="enter"){ submitData(); }
      else { if(soLuong.length<6) soLuong+=v; }
      displayEl.value = formatNum(soLuong||0);
    };
  });

  // Submit dữ liệu
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
    displayEl.value = "";
    render();
  }

  // XÓA TOÀN BỘ DỮ LIỆU
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

    document.getElementById("tongA").textContent = formatNum(tA);
    document.getElementById("tongB").textContent = formatNum(tB);
    document.getElementById("tongC").textContent = formatNum(tC);
    document.getElementById("tongAll").textContent = formatNum(tA+tB+tC);

    // Lịch sử
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

      const group = {A:[], B:[], C:[]};
      d[day].forEach(x=>group[x.hang].push(x));

      ["A","B","C"].forEach(h=>{
        if(group[h].length>0){
          const hDiv = document.createElement("div");
          hDiv.innerHTML=`<div><span class="tag">Hạng ${h}</span></div>`;
          const list = document.createElement("div"); list.className="history-list";
          group[h].forEach(x=>list.innerHTML+=`<div class="item-line">${x.loaiSR}: ${formatNum(x.soLuong)}</div>`);
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

  // Cập nhật khi thay đổi ngày hoặc loại sầu riêng
  ngayEl.onchange = render;
  loaiSREl.onchange = render;

  render();

});
