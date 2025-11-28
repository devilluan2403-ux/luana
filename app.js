function initApp() {
  const KEY = "ghi_sau_rieng_v15";

  const app = document.createElement("div");
  app.id = "app-container";
  document.body.appendChild(app);

  app.innerHTML = `
  <div class="card select-card">
    <div class="select-line"><input type="date" id="ngay"></div>
    <div class="select-line">
      <select id="loaiSR">
        <option value="Thai">Thái</option>
        <option value="Ri">Ri</option>
      </select>
    </div>
  </div>

  <div class="card totals-card">
    <div class="totals">
      <div class="total-box">A<br><strong id="tongA">0</strong></div>
      <div class="total-box">B<br><strong id="tongB">0</strong></div>
      <div class="total-box">C<br><strong id="tongC">0</strong></div>
    </div>
    <div class="total-box total-all">Tổng<br><strong id="tongAll">0</strong></div>
  </div>

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

  <div class="card history-card">
    <h2>Lịch sử</h2>
    <div id="lichSu" class="history-container"></div>
    <button class="small-btn" id="xoaTat">XÓA DỮ LIỆU</button>
  </div>
  `;

  const ngayEl = document.getElementById("ngay");
  const loaiSREl = document.getElementById("loaiSR");
  const displayEl = document.getElementById("displaySL");
  const btnXoa = document.getElementById("xoaTat");

  ngayEl.value = new Date().toISOString().split("T")[0];
  let hang = null, soLuong = "";

  function load() { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  function save(d) { localStorage.setItem(KEY, JSON.stringify(d)); }

  document.querySelectorAll(".hang-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".hang-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      hang = btn.dataset.h;
    };
  });

  function formatNum(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  document.querySelectorAll(".num-btn").forEach(btn => {
    btn.onclick = () => {
      const v = btn.textContent;
      if (btn.id === "del") soLuong = soLuong.slice(0, -1);
      else if (btn.id === "enter") submitData();
      else if (soLuong.length < 6) soLuong += v;
      displayEl.value = soLuong ? formatNum(soLuong) : "";
    };
  });

  function submitData() {
    if (!hang) return alert("Chọn loại hàng");
    if (!soLuong) return alert("Nhập số lượng");

    const d = load();
    const ngay = ngayEl.value;
    const loaiSR = loaiSREl.value;

    if (!d[ngay]) d[ngay] = [];
    d[ngay].push({ loaiSR, hang, soLuong: Number(soLuong) });

    save(d);
    soLuong = "";
    displayEl.value = "";
    render();
  }

  btnXoa.onclick = () => {
    if (confirm("Xóa toàn bộ dữ liệu?")) {
      localStorage.removeItem(KEY);
      render();
    }
  };

  function render() {
    const d = load();
    const ngay = ngayEl.value;
    const loaiSR = loaiSREl.value;

    let tA = 0, tB = 0, tC = 0;
    if (d[ngay]) {
      d[ngay].forEach(item => {
        if (item.loaiSR === loaiSR) {
          if (item.hang === "A") tA += item.soLuong;
          if (item.hang === "B") tB += item.soLuong;
          if (item.hang === "C") tC += item.soLuong;
        }
      });
    }
    document.getElementById("tongA").textContent = formatNum(tA);
    document.getElementById("tongB").textContent = formatNum(tB);
    document.getElementById("tongC").textContent = formatNum(tC);
    document.getElementById("tongAll").textContent = formatNum(tA + tB + tC);

    const out = document.getElementById("lichSu");
    out.innerHTML = "";
    const days = Object.keys(d).sort((a, b) => b.localeCompare(a));

    days.forEach(day => {
      const title = document.createElement("div");
      title.className = "history-title";
      title.textContent = day;
      title.style.cursor = "pointer";

      const content = document.createElement("div");
      content.style.display = "none";

      const table = document.createElement("table");
      table.className = "history-table";
      table.innerHTML = `
        <thead>
          <tr><th>Loại</th><th>A</th><th>B</th><th>C</th></tr>
        </thead>
        <tbody>
          <tr><td>Thái</td><td id="ThaiA"></td><td id="ThaiB"></td><td id="ThaiC"></td></tr>
          <tr><td>Ri</td><td id="RiA"></td><td id="RiB"></td><td id="RiC"></td></tr>
        </tbody>
      `;

      const sums = { Thai:{A:0,B:0,C:0}, Ri:{A:0,B:0,C:0} };

      d[day].forEach((item, idx) => {
        sums[item.loaiSR][item.hang] += item.soLuong;
      });

      Object.keys(sums).forEach(type => {
        ["A", "B", "C"].forEach(h => {
          const cell = table.querySelector(`#${type}${h}`);
          cell.textContent = sums[type][h] > 0 ? formatNum(sums[type][h]) : "";
        });
      });

      // chi tiết xóa từng dòng
      const list = document.createElement("div");
      d[day].forEach((x, idx) => {
        const div = document.createElement("div");
        div.className = "item-line";
        div.innerHTML = `${x.loaiSR} - Hạng ${x.hang}: ${formatNum(x.soLuong)}`;
        const btn = document.createElement("button");
        btn.textContent = "XÓA";
        btn.className = "delete-btn";
        btn.onclick = () => {
          if (confirm("Xóa mục này?")) {
            d[day].splice(idx, 1);
            if (d[day].length === 0) delete d[day];
            save(d);
            render();
          }
        };
        div.appendChild(btn);
        list.appendChild(div);
      });

      content.appendChild(table);
      content.appendChild(list);
      title.onclick = () => content.style.display = content.style.display === "none" ? "block" : "none";
      out.appendChild(title);
      out.appendChild(content);
    });
  }

  ngayEl.onchange = render;
  loaiSREl.onchange = render;
  render();
}
