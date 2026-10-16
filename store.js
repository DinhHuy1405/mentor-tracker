/* Lớp lưu trữ cho Mentor Tracker.
 * Cung cấp window.claude.use("db" | "downloads") để trang chính dùng chung một giao diện:
 *   - Chưa điền config.js: chế độ thử, lưu trong localStorage của trình duyệt.
 *   - Đã điền config.js: lưu trên Supabase (bảng public.docs), đăng nhập bằng link email, realtime.
 */
(function () {
  "use strict";
  var cfg = window.MENTOR_CONFIG || {};
  var useSupabase = !!(cfg.supabaseUrl && cfg.anonKey && window.supabase);

  /* ---------- tải file (thay cho capability downloads) ---------- */
  var downloads = {
    save: function (o) {
      return new Promise(function (resolve) {
        var blob = new Blob([o.data], { type: "text/csv;charset=utf-8" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = o.filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
        resolve({ status: "saved" });
      });
    }
  };

  function snapOf(rows) {
    var docs = rows.map(function (r) {
      return { id: r.id, exists: true, data: function () { return JSON.parse(JSON.stringify(r.data)); } };
    });
    return { docs: docs, size: docs.length, empty: !docs.length };
  }

  /* ---------- chế độ thử: localStorage ---------- */
  function localDb() {
    var KEY = "mentor-tracker.docs";
    var subs = {};
    function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
    function save(all) { try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) { throw new Error("Trình duyệt không cho lưu dữ liệu"); } }
    function rows(name) { var c = load()[name] || {}; return Object.keys(c).map(function (id) { return { id: id, data: c[id] }; }); }
    function emit(name) { (subs[name] || []).forEach(function (f) { f(snapOf(rows(name))); }); }
    function write(name, id, fn) { var all = load(); all[name] = all[name] || {}; fn(all[name]); save(all); emit(name); }
    return {
      collection: function (name) {
        return {
          onSnapshot: function (next) {
            (subs[name] = subs[name] || []).push(next);
            setTimeout(function () { next(snapOf(rows(name))); }, 0);
            return function () { subs[name] = (subs[name] || []).filter(function (f) { return f !== next; }); };
          },
          doc: function (id) {
            return {
              update: function (o) { return Promise.resolve().then(function () { write(name, id, function (c) { if (!c[id]) throw new Error("Không tìm thấy bản ghi"); c[id] = Object.assign({}, c[id], o); }); }); },
              set: function (o) { return Promise.resolve().then(function () { write(name, id, function (c) { c[id] = o; }); }); },
              delete: function () { return Promise.resolve().then(function () { write(name, id, function (c) { delete c[id]; }); }); }
            };
          },
          add: function (o) {
            var id = "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            return Promise.resolve().then(function () { write(name, id, function (c) { c[id] = o; }); return { id: id }; });
          }
        };
      }
    };
  }

  /* ---------- Supabase ---------- */
  var sb = null, dbPromise = null;
  function supaDb() {
    var refreshers = {};
    function refresh(name) { (refreshers[name] || []).forEach(function (f) { f(); }); }
    function q(name) { return sb.from("docs").select("id,data").eq("collection", name); }
    function must(res) { if (res.error) throw res.error; return res.data; }
    return {
      collection: function (name) {
        return {
          onSnapshot: function (next, err) {
            var alive = true;
            var run = function () {
              q(name).then(function (res) {
                if (!alive) return;
                if (res.error) { if (err) err(res.error); return; }
                next(snapOf(res.data || []));
              });
            };
            (refreshers[name] = refreshers[name] || []).push(run);
            run();
            var ch = sb.channel("docs-" + name + "-" + Math.random().toString(36).slice(2))
              .on("postgres_changes", { event: "*", schema: "public", table: "docs", filter: "collection=eq." + name }, run)
              .subscribe();
            return function () {
              alive = false;
              refreshers[name] = (refreshers[name] || []).filter(function (f) { return f !== run; });
              sb.removeChannel(ch);
            };
          },
          doc: function (id) {
            var match = function (b) { return b.eq("collection", name).eq("id", id); };
            return {
              update: async function (o) {
                var cur = must(await match(sb.from("docs").select("data")).single());
                var merged = Object.assign({}, cur.data, o);
                must(await match(sb.from("docs").update({ data: merged, updated_at: new Date().toISOString() })));
                refresh(name);
              },
              set: async function (o) {
                must(await sb.from("docs").upsert({ collection: name, id: id, data: o, updated_at: new Date().toISOString() }));
                refresh(name);
              },
              delete: async function () {
                must(await match(sb.from("docs").delete()));
                refresh(name);
              }
            };
          },
          add: async function (o) {
            var id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            must(await sb.from("docs").insert({ collection: name, id: id, data: o }));
            refresh(name);
            return { id: id };
          }
        };
      }
    };
  }

  function loginScreen() {
    return new Promise(function (resolve) {
      var box = document.createElement("div");
      box.id = "login";
      box.style.cssText = "position:fixed;inset:0;display:grid;place-items:center;padding:16px;background:var(--bg);z-index:10";
      box.innerHTML = '<form id="loginform" class="login-card">' +
        '<h1>Theo dõi học viên</h1>' +
        '<p>Đăng nhập bằng email và mật khẩu.</p>' +
        '<label class="f">Email<input id="loginemail" type="email" required autocomplete="username"></label>' +
        '<label class="f">Mật khẩu<input id="loginpw" type="password" autocomplete="current-password"></label>' +
        '<button class="btn primary" id="loginbtn" type="submit">Đăng nhập</button>' +
        '<p id="loginmsg" role="status"></p></form>';
      document.body.appendChild(box);
      var form = box.querySelector("#loginform"), msg = box.querySelector("#loginmsg");
      var email = function () { return box.querySelector("#loginemail").value.trim(); };
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var pw = box.querySelector("#loginpw").value;
        if (!pw) { msg.textContent = "Nhập mật khẩu."; return; }
        box.querySelector("#loginbtn").disabled = true;
        msg.textContent = "Đang đăng nhập...";
        var res = await sb.auth.signInWithPassword({ email: email(), password: pw });
        box.querySelector("#loginbtn").disabled = false;
        if (res.error) msg.textContent = "Sai email hoặc mật khẩu. Kiểm tra lại, hoặc nhắn mentor để được cấp lại.";
      });
      sb.auth.onAuthStateChange(function (ev, session) {
        if (session) { box.remove(); resolve(session); }
      });
    });
  }

  function addSignOut() {
    var host = document.getElementById("today");
    if (!host || document.getElementById("signout")) return;
    var b = document.createElement("button");
    b.id = "signout"; b.type = "button"; b.textContent = "Đăng xuất";
    b.style.cssText = "margin-left:12px;border:0;background:transparent;color:var(--accent);cursor:pointer;font:inherit;font-size:12px;padding:0";
    b.addEventListener("click", async function () { await sb.auth.signOut(); location.reload(); });
    host.insertAdjacentElement("afterend", b);
  }

  /* ---------- Học viên: chỉ xem dữ liệu của chính mình qua hàm student_view ---------- */
  function studentDb(view) {
    var subs = {}, cur = view;
    function rowsOf(name) {
      if (name === "students") return [{ id: cur.student.id, data: cur.student }];
      return (cur[name] || []).map(function (x) { return { id: x.id, data: x }; });
    }
    function emitAll() { Object.keys(subs).forEach(function (n) { subs[n].forEach(function (f) { f(snapOf(rowsOf(n))); }); }); }
    setInterval(function () {
      sb.rpc("student_view").then(function (r) { if (r && r.data) { cur = r.data; emitAll(); } });
    }, 60000);
    function ro() { return Promise.reject(new Error("Trang này chỉ để xem")); }
    return {
      collection: function (name) {
        return {
          onSnapshot: function (next) {
            (subs[name] = subs[name] || []).push(next);
            setTimeout(function () { next(snapOf(rowsOf(name))); }, 0);
            return function () { subs[name] = subs[name].filter(function (f) { return f !== next; }); };
          },
          doc: function () { return { update: ro, set: ro, delete: ro }; },
          add: ro
        };
      }
    };
  }

  async function getDb() {
    if (!useSupabase) {
      var b = document.getElementById("banner");
      if (b) { b.textContent = "Chế độ thử: dữ liệu chỉ lưu trong trình duyệt này. Điền config.js để dùng Supabase."; b.hidden = false; }
      return localDb();
    }
    if (!sb) sb = window.supabase.createClient(cfg.supabaseUrl, cfg.anonKey, { auth: { persistSession: true, detectSessionInUrl: true } });
    var cur = await sb.auth.getSession();
    if (!(cur.data && cur.data.session)) await loginScreen();
    addSignOut();
    try {
      var sv = await sb.rpc("student_view");
      if (sv && sv.data && sv.data.student) { window.STUDENT_MODE = sv.data.student.id; return studentDb(sv.data); }
    } catch (e) { /* không phải học viên: dùng chế độ mentor */ }
    return supaDb();
  }

  window.claude = {
    use: function (name) {
      if (name === "downloads") return Promise.resolve(downloads);
      if (name === "db") { dbPromise = dbPromise || getDb(); return dbPromise; }
      return Promise.resolve(null);
    }
  };
})();
