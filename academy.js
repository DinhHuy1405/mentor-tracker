/* Bài giảng video gắn vào trang từng học viên (tab "Bài giảng") và trang quản lý của mentor.
 * Dữ liệu: view public.academy_lessons, public.academy_progress; file trong kho riêng tư academy-lessons
 * (video, phụ đề .vtt, PDF) và academy-submissions (ảnh bài nộp), mở bằng link ký có hạn.
 * Cài đặt Supabase: supabase/academy_lessons.sql. Không có dữ liệu học viên trong file này.
 * index.html gọi: ACAD.init({onChange}), ACAD.view(s, a), ACAD.adminView(students), ACAD.mount() sau mỗi lần vẽ. */
(function () {
  "use strict";
  var BUCKET = "academy-lessons", SUBS = "academy-submissions", TTL = 3 * 3600;
  var PROG = { VN: "Bán hàng tại Việt Nam", US: "Bán hàng từ Việt Nam sang Mỹ", ALL: "Dùng chung hai chương trình" };
  var ST = { chua_nop: ["Chưa nộp", ""], da_nop: ["Đã nộp, chờ mentor", "b"], da_xem: ["Mentor đã xem", "gr"], lam_lai: ["Cần làm lại", "r"] };
  var EX = { text: "Trả lời bằng chữ", link: "Dán link (Google Sheet, Drive...)", image: "Nộp ảnh chụp, hoặc gõ chữ" };
  var A = {
    ready: false, err: "", lessons: [], prog: {}, editor: false, me: null,
    sel: {}, stu: {}, auto: true, autoplay: false, subsOn: true, urls: {}, player: null, onChange: function () {}, saving: {}
  };
  var MOCK = window.ACAD_MOCK || null;
  function sb() { return window.MENTOR_SB || null; }
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  function $(q) { return document.querySelector(q); }
  function hms(sec) { sec = Math.max(0, Math.round(sec || 0)); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ":" + ("0" + m).slice(-2) : m) + ":" + ("0" + s).slice(-2); }
  function fmtD(iso) { if (!iso) return ""; var d = new Date(iso); return ("0" + d.getDate()).slice(-2) + "/" + ("0" + (d.getMonth() + 1)).slice(-2); }
  function key(sid, lid) { return sid + "|" + lid; }
  function changed() { try { A.onChange(); } catch (e) {} }
  function toast(m) { var t = document.getElementById("toast"); if (!t) return; t.textContent = m; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove("show"); }, 2200); }
  function readonly() { return !!window.PREVIEW; }
  function isStudent() { return !!window.STUDENT_MODE && !window.PREVIEW; }

  /* .srt -> .vtt; mục lục "00:38 Tên" -> [{t,title}] */
  function srtToVtt(txt) {
    var b = String(txt || "").replace(/^﻿/, "").replace(/\r\n?/g, "\n").trim()
      .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2").replace(/^\d+\n(?=\d{2}:\d{2}:\d{2}\.\d{3} -->)/gm, "");
    return "WEBVTT\n\n" + b + "\n";
  }
  function parseChapters(txt) {
    return String(txt || "").split(/\r?\n/).map(function (l) { var m = /^\s*(?:(\d+):)?(\d{1,2}):(\d{2})\s+(.+?)\s*$/.exec(l); return m ? { t: (+(m[1] || 0)) * 3600 + (+m[2]) * 60 + (+m[3]), title: m[4] } : null; })
      .filter(Boolean).sort(function (a, b) { return a.t - b.t; });
  }
  function slug(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60); }

  /* ---------- dữ liệu ---------- */
  async function load() {
    A.err = "";
    if (MOCK) {
      A.lessons = MOCK.lessons; A.editor = !!MOCK.editor && !window.STUDENT_MODE;
      A.prog = {}; (MOCK.progress || []).forEach(function (p) { A.prog[key(p.student_id, p.lesson_id)] = p; });
      A.ready = true; return;
    }
    var c = sb(); if (!c) { A.ready = true; A.err = "nodb"; return; }
    try {
      var r = await Promise.all([
        c.from("academy_lessons").select("*").order("sort").order("episode"),
        c.from("academy_progress").select("*")
      ]);
      if (r[0].error) throw r[0].error;
      A.lessons = r[0].data || [];
      A.prog = {}; (r[1].data || []).forEach(function (p) { A.prog[key(p.student_id, p.lesson_id)] = p; });
      if (!window.STUDENT_MODE) {
        var u = await c.auth.getUser(), em = u && u.data && u.data.user ? String(u.data.user.email || "").toLowerCase() : "";
        var rr = await c.from("core_roles").select("area,role").eq("email", em), rank = { viewer: 1, staff: 2, admin: 3, owner: 4 };
        A.editor = !rr.error && (rr.data || []).some(function (x) { return (x.area === "academy" || x.area === "all") && (rank[x.role] || 0) >= 3; });
      }
    } catch (e) { A.err = (e && e.message) || "Không đọc được bài giảng"; }
    A.ready = true;
  }
  async function signed(bucket, path, opt) {
    if (!path) return null;
    if (MOCK) return (MOCK.files || {})[path] || null;
    var k = bucket + "|" + path + (opt && opt.download ? "|dl" : ""), c = A.urls[k];
    if (c && c.exp > Date.now() + 60e3) return c.url;
    var r = await sb().storage.from(bucket).createSignedUrl(path, TTL, opt || undefined);
    if (r.error || !r.data) return null;
    A.urls[k] = { url: r.data.signedUrl, exp: Date.now() + TTL * 1000 };
    return r.data.signedUrl;
  }
  async function saveProgress(sid, lid, patch) {
    var cur = A.prog[key(sid, lid)] || { student_id: sid, lesson_id: lid, watched_pct: 0, status: "chua_nop" };
    var row = Object.assign({}, cur, patch, { student_id: sid, lesson_id: lid });
    if (MOCK) {
      /* giả lập trigger academy.progress_guard */
      if (patch.submission !== undefined && isStudent()) { var has = row.submission && (row.submission.text || row.submission.link || row.submission.image_path); row.status = has ? "da_nop" : "chua_nop"; row.submitted_at = has ? new Date().toISOString() : null; }
      row.watched_pct = Math.max(cur.watched_pct || 0, row.watched_pct || 0);
      if (row.watched_pct >= 90 && !row.watched_at) row.watched_at = new Date().toISOString();
      A.prog[key(sid, lid)] = row;
      MOCK.progress = (MOCK.progress || []).filter(function (p) { return key(p.student_id, p.lesson_id) !== key(sid, lid); }).concat([row]);
      return row;
    }
    var send = { student_id: sid, lesson_id: lid };
    Object.keys(patch).forEach(function (k) { send[k] = patch[k]; });
    var r = await sb().from("academy_progress").upsert(send, { onConflict: "student_id,lesson_id" }).select().single();
    if (r.error) throw r.error;
    A.prog[key(sid, lid)] = r.data; return r.data;
  }

  /* ---------- học viên: chọn tập theo chương trình và bước ---------- */
  function progOf(s) { return s.market === "US" ? "US" : "VN"; }
  function stepOf(l, p) { return p === "US" ? l.step_us : l.step_vn; }
  function lessonsFor(s) {
    var p = progOf(s);
    return A.lessons.filter(function (l) { return (l.program === p || l.program === "ALL") && stepOf(l, p) && (l.published || A.editor && !window.STUDENT_MODE); })
      .sort(function (x, y) { return stepOf(x, p) - stepOf(y, p) || (x.sort || 0) - (y.sort || 0) || String(x.episode).localeCompare(String(y.episode), "vi", { numeric: true }); });
  }
  /* tập kế tiếp theo đúng thứ tự lessonsFor(s), chỉ tập đã công bố */
  function nextOf(s, lid) {
    var list = lessonsFor(s).filter(function (l) { return l.published; }), i = -1;
    for (var k = 0; k < list.length; k++) if (list[k].id === lid) { i = k; break; }
    return i >= 0 && i + 1 < list.length ? list[i + 1] : null;
  }
  function count(s) { return A.ready ? lessonsFor(s).length : ""; }
  function tagSt(p) { var st = ST[(p && p.status) || "chua_nop"]; return '<i class="tg ' + st[1] + '">' + st[0] + '</i>'; }

  function view(s, a) {
    if (!A.ready) return '<p class="ntn-mu">Đang tải bài giảng...</p>';
    if (A.err === "nodb") return '<p class="ntn-mu">Chế độ thử: chưa nối Supabase nên chưa có bài giảng.</p>';
    if (A.err) return '<p class="ntn-mu">Chưa đọc được bài giảng: ' + esc(A.err) + '. Tải lại trang, hoặc nhắn mentor.</p>';
    var p = progOf(s), list = lessonsFor(s);
    if (!list.length) return '<h2 class="ntn-h2">Bài giảng</h2><p class="ntn-mu">Chưa có video bài giảng cho chương trình ' + esc(PROG[p]) + '. Mentor sẽ báo khi có tập mới.</p>';
    var sel = list.filter(function (l) { return l.id === A.sel[s.id]; })[0]
      || list.filter(function (l) { return stepOf(l, p) === a.cur; })[0]
      || list.filter(function (l) { var pr = A.prog[key(s.id, l.id)]; return !(pr && pr.watched_at); })[0] || list[0];
    A.sel[s.id] = sel.id; A.stu[s.id] = s;
    var nx = nextOf(s, sel.id);
    var ch = sel.chapters || [], pr = A.prog[key(s.id, sel.id)] || null, step = stepOf(sel, p), pb = a.pb[step - 1];
    var h = '<div class="ac">';
    h += '<div class="ac-pl" id="acad-pl" data-les="' + esc(sel.id) + '" data-sid="' + esc(s.id) + '"></div>';
    h += '<div class="ac-hd"><div class="ac-k">Tập ' + esc(sel.episode) + ' · Bước ' + step + (pb ? ': ' + esc(pb.name) : '') + (sel.duration_sec ? ' · ' + hms(sel.duration_sec) : '') + (sel.published ? '' : ' · <i class="tg y">Chưa công bố</i>') + '</div>'
      + '<h2 class="ac-t">' + esc(sel.title) + '</h2><div class="ac-acts">'
      + (sel.vtt_path ? '<button type="button" class="ntn-bt" data-acad-subs aria-pressed="' + (A.subsOn ? "true" : "false") + '">' + (A.subsOn ? "Tắt phụ đề" : "Bật phụ đề") + '</button>' : '')
      + (sel.pdf_path ? '<button type="button" class="ntn-bt" data-acad-pdf="' + esc(sel.id) + '">Tải tài liệu PDF</button>' : '')
      + (nx ? '<button type="button" class="ntn-bt ac-nx" data-acad-sel="' + esc(nx.id) + '" data-sid="' + esc(s.id) + '">Tập tiếp: ' + esc(nx.episode) + ' ' + esc(nx.title) + '</button>' : '')
      + (pr && pr.watched_pct ? '<span class="ac-mu">Đã xem ' + pr.watched_pct + '%' + (pr.watched_at ? ', xong ' + fmtD(pr.watched_at) : '') + '</span>' : '')
      + '</div></div>';
    if (ch.length) h += '<details class="ac-ch" open><summary>Mục lục ' + ch.length + ' chương</summary><ol>' + ch.map(function (x) { return '<li><button type="button" data-acad-t="' + x.t + '"><span>' + hms(x.t) + '</span>' + esc(x.title) + '</button></li>'; }).join("") + '</ol></details>';
    h += exerciseHtml(s, sel, pr);
    h += '<h2 class="ntn-h2">Các tập theo bước</h2><p class="ntn-mu">' + esc(PROG[p]) + '. Bạn đang ở bước ' + Math.min(a.cur, a.ns) + '. Xem trước các bước sau cũng được.</p>';
    var last = null;
    list.forEach(function (l) {
      var n = stepOf(l, p);
      if (n !== last) { last = n; var b = a.pb[n - 1]; h += '<div class="ac-st">Bước ' + n + (b ? ': ' + esc(b.name) : '') + ' ' + (n < a.cur ? '<i class="tg gr">Đã xong</i>' : n === a.cur ? '<i class="tg y">Đang làm</i>' : '<i class="tg">Chưa tới</i>') + '</div>'; }
      var q = A.prog[key(s.id, l.id)];
      h += '<button type="button" class="ac-row' + (l.id === sel.id ? ' on' : '') + '" data-acad-sel="' + esc(l.id) + '" data-sid="' + esc(s.id) + '"><span class="ac-ep">' + esc(l.episode) + '</span><span class="ac-rt">' + esc(l.title) + (l.published ? '' : ' <i class="tg y">Chưa công bố</i>') + '</span><span class="ac-rs">'
        + (l.duration_sec ? hms(l.duration_sec) + ' · ' : '') + (q && q.watched_at ? 'Đã xem' : q && q.watched_pct ? 'Xem ' + q.watched_pct + '%' : 'Chưa xem') + (l.exercise ? ' · ' + (ST[(q && q.status) || "chua_nop"][0]) : '') + '</span></button>';
    });
    return h + '</div>';
  }

  function exerciseHtml(s, l, pr) {
    if (!l.exercise) return '';
    var sub = (pr && pr.submission) || {}, st = (pr && pr.status) || "chua_nop", h = '<section class="ac-ex"><div class="ac-exh"><b>Bài tập</b> ' + tagSt(pr) + '</div><p class="ac-ext">' + esc(l.exercise) + '</p>';
    var shown = sub.text || sub.link || sub.image_path;
    if (shown) h += '<div class="ntn-co"><b>Bài đã nộp' + (pr.submitted_at ? ' ' + fmtD(pr.submitted_at) : '') + '.</b> ' + esc(sub.text || '') + ' '
      + (/^https:\/\//.test(sub.link || '') ? '<a href="' + esc(sub.link) + '" target="_blank" rel="noopener">Mở link</a> ' : '')
      + (sub.image_path ? '<button type="button" class="ntn-bt" data-acad-img="' + esc(sub.image_path) + '">Xem ảnh</button>' : '') + '</div>';
    if (pr && pr.mentor_note) h += '<div class="ntn-co y"><b>Mentor' + (pr.reviewed_at ? ' ' + fmtD(pr.reviewed_at) : '') + '.</b> ' + esc(pr.mentor_note) + '</div>';
    if (isStudent()) {
      var t = l.exercise_type || "text";
      h += '<form class="ac-f" data-acad-sub="' + esc(l.id) + '" data-sid="' + esc(s.id) + '">'
        + (t === "link" ? '<label>Link bài làm<input name="link" type="url" placeholder="https://" value="' + esc(sub.link || '') + '"></label>' : '')
        + (t === "image" ? '<label>Ảnh chụp (che email trước khi chụp)<input name="image" type="file" accept="image/jpeg,image/png,image/webp"></label>' : '')
        + '<label>' + (t === "text" ? 'Câu trả lời' : t === "image" ? 'Hoặc gõ câu trả lời (có thể nộp cả ảnh và chữ)' : 'Ghi chú thêm (tuỳ chọn)') + '<textarea name="text" rows="3">' + esc(sub.text || '') + '</textarea></label>'
        + '<button type="submit" class="ntn-bt ac-go">' + (shown ? 'Nộp lại' : 'Nộp bài') + '</button> <span class="ac-mu">' + esc(EX[t]) + '</span></form>';
    } else if (!window.STUDENT_MODE && A.editor) {
      h += '<div class="ac-rv" data-acad-rv="' + esc(l.id) + '" data-sid="' + esc(s.id) + '"><label>Nhận xét cho học viên<textarea rows="2" name="note">' + esc((pr && pr.mentor_note) || '') + '</textarea></label>'
        + '<div><button type="button" class="ntn-bt" data-acad-mark="da_xem">' + (st === "da_xem" ? 'Lưu nhận xét' : 'Đánh dấu đã xem') + '</button>'
        + (st !== "chua_nop" ? '' : ' <span class="ac-mu">Học viên chưa nộp</span>') + '</div></div>';
    }
    return h + '</section>';
  }

  /* ---------- trình phát giữ nguyên qua các lần vẽ lại ---------- */
  function mount() {
    var box = document.getElementById("acad-pl");
    if (!box) return;
    var lid = box.dataset.les, sid = box.dataset.sid, l = A.lessons.filter(function (x) { return x.id === lid; })[0];
    if (!l) return;
    if (A.player && A.player.lid === lid && A.player.sid === sid) { box.appendChild(A.player.el); if (A.player.ov) { box.appendChild(A.player.ov); box.classList.add("ov-on"); } markChapter(); return; }
    if (A.player) { closeNext(); try { A.player.el.pause(); A.player.el.removeAttribute("src"); A.player.el.load(); } catch (e) {} }
    var v = document.createElement("video");
    v.controls = true; v.playsInline = true; v.preload = "metadata"; v.setAttribute("controlslist", "nodownload"); v.className = "ac-v";
    A.player = { lid: lid, sid: sid, el: v, last: 0 };
    box.appendChild(v);
    (async function () {
      var src = await signed(BUCKET, l.video_path);
      if (!A.player || A.player.el !== v) return;
      if (!src) { var m = document.createElement("p"); m.className = "ac-err"; m.textContent = "Chưa mở được video. Tải lại trang, hoặc nhắn mentor."; v.replaceWith(m); A.player = null; return; }
      v.src = src;
      if (A.autoplay) { A.autoplay = false; v.play().catch(function () {}); }
      if (l.vtt_path) {
        try {
          var u = await signed(BUCKET, l.vtt_path), txt = u ? await (await fetch(u)).text() : "";
          var tr = document.createElement("track"); tr.kind = "subtitles"; tr.label = "Tiếng Việt"; tr.srclang = "vi";
          tr.src = URL.createObjectURL(new Blob([txt], { type: "text/vtt" })); tr.default = A.subsOn;
          v.appendChild(tr); tr.addEventListener("load", applySubs); setTimeout(applySubs, 300);
        } catch (e) {}
      }
    })();
    v.addEventListener("timeupdate", function () { markChapter(); track(v, sid, lid, false); });
    v.addEventListener("ended", function () { track(v, sid, lid, true); showNext(sid, lid); });
    v.addEventListener("play", function () { closeNext(); });
  }

  /* ---------- hết video: mời sang tập kế tiếp ---------- */
  function closeNext() {
    var P = A.player; if (!P) return;
    if (P.timer) { clearInterval(P.timer); P.timer = null; }
    if (P.ov) { var b = P.ov.parentNode; P.ov.remove(); P.ov = null; if (b) b.classList.remove("ov-on"); }
  }
  function goNext(sid, nid) {
    closeNext(); A.sel[sid] = nid; A.autoplay = true; changed();
    var pl = document.getElementById("acad-pl"); if (pl) pl.scrollIntoView({ block: "start", behavior: "smooth" });
  }
  function showNext(sid, lid) {
    var P = A.player, box = document.getElementById("acad-pl"), s = A.stu[sid];
    if (!P || !box || !s) return;
    closeNext();
    var cur = A.lessons.filter(function (x) { return x.id === lid; })[0] || {}, nx = nextOf(s, lid), pr = A.prog[key(sid, lid)];
    var needSub = cur.exercise && !(pr && pr.status && pr.status !== "chua_nop");
    var ov = document.createElement("div"); ov.className = "ac-ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-label", nx ? "Tập tiếp theo" : "Đã xem hết");
    var h = '<div class="ac-ovc">';
    if (nx) {
      h += '<div class="ac-ovk">Tập tiếp theo</div><div class="ac-ovt">' + esc(nx.episode) + '. ' + esc(nx.title) + '</div>'
        + '<div class="ac-ovm">' + (nx.duration_sec ? hms(nx.duration_sec) : '') + '<span data-ov-cd></span></div>'
        + '<div class="ac-ova"><button type="button" class="ntn-bt ac-go" data-ov-go>Xem ngay</button><button type="button" class="ntn-bt" data-ov-stay>Ở lại tập này</button></div>'
        + '<label class="ac-ovck"><input type="checkbox" data-ov-auto' + (A.auto ? ' checked' : '') + '> Tự chuyển tập</label>';
    } else {
      h += '<div class="ac-ovt">Bạn đã xem hết các tập hiện có</div><div class="ac-ova"><button type="button" class="ntn-bt" data-ov-replay>Xem lại</button><button type="button" class="ntn-bt" data-ov-stay>Đóng</button></div>';
    }
    if (needSub) h += '<div class="ac-ovs">Nhớ nộp bài tập của tập này <button type="button" class="ntn-bt" data-ov-sub>Đến ô nộp bài</button></div>';
    ov.innerHTML = h + '</div>';
    P.ov = ov; box.appendChild(ov); box.classList.add("ov-on");
    var bg = ov.querySelector("[data-ov-go]"); if (bg) { try { bg.focus({ preventScroll: true }); } catch (e) {} }
    ov.addEventListener("click", function (e) {
      if (e.target.closest("[data-ov-go]")) { goNext(sid, nx.id); return; }
      if (e.target.closest("[data-ov-stay]")) { closeNext(); return; }
      if (e.target.closest("[data-ov-replay]")) { closeNext(); P.el.currentTime = 0; P.el.play().catch(function () {}); return; }
      if (e.target.closest("[data-ov-sub]")) { if (P.timer) { clearInterval(P.timer); P.timer = null; var c0 = ov.querySelector("[data-ov-cd]"); if (c0) c0.textContent = ""; } var ex = document.querySelector(".ac-ex"); if (ex) ex.scrollIntoView({ block: "start", behavior: "smooth" }); return; }
    });
    var ck = ov.querySelector("[data-ov-auto]");
    if (ck) ck.addEventListener("change", function () {
      A.auto = ck.checked; try { localStorage.setItem("acad-auto", A.auto ? "1" : "0"); } catch (_) {}
      if (!A.auto && P.timer) { clearInterval(P.timer); P.timer = null; var c1 = ov.querySelector("[data-ov-cd]"); if (c1) c1.textContent = ""; }
    });
    if (nx && A.auto) {
      var left = 8, cd = ov.querySelector("[data-ov-cd]"), draw = function () { cd.textContent = ' · tự chuyển sau ' + left + ' giây'; };
      draw();
      P.timer = setInterval(function () { left--; if (left <= 0) { goNext(sid, nx.id); return; } draw(); }, 1000);
    }
  }
  function applySubs() { var v = A.player && A.player.el; if (!v || !v.textTracks) return; for (var i = 0; i < v.textTracks.length; i++) v.textTracks[i].mode = A.subsOn ? "showing" : "hidden"; }
  function markChapter() {
    var v = A.player && A.player.el; if (!v) return;
    var t = v.currentTime, bs = document.querySelectorAll("[data-acad-t]"), on = -1;
    [].forEach.call(bs, function (b, i) { if (+b.dataset.acadT <= t + .25) on = i; });
    [].forEach.call(bs, function (b, i) { b.classList.toggle("on", i === on); });
  }
  /* ghi phần trăm đã xem: chỉ học viên thật, mỗi lần tăng từ 10% hoặc xem hết */
  function track(v, sid, lid, ended) {
    if (!isStudent() || !v.duration) return;
    var pct = ended ? 100 : Math.min(100, Math.floor(v.currentTime / v.duration * 100));
    var cur = A.prog[key(sid, lid)], had = cur ? cur.watched_pct || 0 : 0;
    if (pct < had + 10 && !(pct >= 90 && had < 90) && !ended) return;
    if (A.saving[lid]) return; A.saving[lid] = true;
    saveProgress(sid, lid, { watched_pct: Math.max(had, pct) }).catch(function () {}).then(function () { A.saving[lid] = false; });
  }

  /* ---------- quản lý (mentor) ---------- */
  function adminView(students) {
    if (!A.ready) return '<div class="empty">Đang tải bài giảng...</div>';
    if (A.err === "nodb") return '<div class="empty">Chế độ thử: chưa nối Supabase.</div>';
    if (A.err) return '<div class="empty">Chưa đọc được bài giảng: ' + esc(A.err) + '</div>';
    var ls = A.lessons.slice().sort(function (x, y) { return String(x.program).localeCompare(y.program) || (x.step_vn || x.step_us || 0) - (y.step_vn || y.step_us || 0) || (x.sort || 0) - (y.sort || 0); });
    var h = '<section class="sec ac-adm"><h2>Bài giảng video</h2><p class="hint">Học viên xem ở tab "Bài giảng" trên trang của mình: mọi tập đã công bố của chương trình mình và tập dùng chung, xếp theo bước.</p>';
    h += ls.length ? '<div class="tbl"><table><thead><tr><th>Tập</th><th>Tên</th><th>Chương trình</th><th>Bước VN</th><th>Bước US</th><th>Thời lượng</th><th>Bài tập</th><th>Trạng thái</th><th></th></tr></thead><tbody>'
      + ls.map(function (l) {
        return '<tr><td>' + esc(l.episode) + '</td><td>' + esc(l.title) + '</td><td>' + esc(l.program) + '</td><td>' + (l.step_vn || '') + '</td><td>' + (l.step_us || '') + '</td><td>' + hms(l.duration_sec) + '</td><td>' + (l.exercise ? esc(EX[l.exercise_type] || '') : 'Chưa có') + '</td><td>'
          + (l.published ? '<i class="tg gr">Đã công bố</i>' : '<i class="tg y">Chưa công bố</i>') + '</td><td><button type="button" class="btn sm" data-acad-pub="' + esc(l.id) + '" data-v="' + (l.published ? 0 : 1) + '">' + (l.published ? 'Ẩn' : 'Công bố') + '</button> <button type="button" class="btn sm" data-acad-edit="' + esc(l.id) + '">Sửa</button></td></tr>';
      }).join("") + '</tbody></table></div>' : '<div class="empty">Chưa có tập nào.</div>';
    /* tiến độ: mỗi học viên một dòng, mỗi tập một ô */
    var act = (students || []).filter(function (s) { return s.status !== "Dừng"; });
    if (ls.length && act.length) {
      h += '<h3 class="ac-h3">Tiến độ học viên</h3><div class="tbl"><table class="ac-mx"><thead><tr><th>Học viên</th>' + ls.map(function (l) { return '<th title="' + esc(l.title) + '">' + esc(l.episode) + '</th>'; }).join("") + '</tr></thead><tbody>'
        + act.map(function (s) {
          var p = progOf(s);
          return '<tr><td><a href="#/' + esc(s.id) + '/bai-giang">' + esc(s.name) + '</a> <span class="ac-mu">' + p + '</span></td>' + ls.map(function (l) {
            if (!((l.program === p || l.program === "ALL") && stepOf(l, p))) return '<td class="ac-na">không thuộc</td>';
            var q = A.prog[key(s.id, l.id)];
            var w = q && q.watched_at ? 'Xem xong' : q && q.watched_pct ? 'Xem ' + q.watched_pct + '%' : 'Chưa xem';
            return '<td>' + w + (l.exercise ? '<br>' + tagSt(q) : '') + '</td>';
          }).join("") + '</tr>';
        }).join("") + '</tbody></table></div>';
    }
    h += formHtml(null) + '</section>';
    return h;
  }
  function formHtml(l) {
    l = l || {};
    var o = function (v, cur, t) { return '<option value="' + v + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + t + '</option>'; };
    return '<h3 class="ac-h3" id="acad-fh">' + (l.id ? 'Sửa tập ' + esc(l.episode) : 'Thêm một tập') + '</h3><p class="hint">Bộ file mỗi tập: video .mp4 (tối đa 50 MB), phụ đề .srt, mục lục .txt (mỗi dòng "00:38 Tên chương"), tài liệu .pdf, ảnh bìa tuỳ chọn. Khi sửa, chỉ chọn file cần thay.</p>'
      + '<form id="acad-form" class="ac-form" data-id="' + esc(l.id || '') + '"><div class="ac-g">'
      + '<label>Chương trình<select name="program">' + o("VN", l.program || "VN", "VN") + o("US", l.program, "VN sang Mỹ") + o("ALL", l.program, "Dùng chung") + '</select></label>'
      + '<label>Mã tập<input name="episode" required placeholder="3.1" value="' + esc(l.episode || '') + '"></label>'
      + '<label>Bước VN (1 đến 6)<input name="step_vn" type="number" min="1" max="6" value="' + esc(l.step_vn || '') + '"></label>'
      + '<label>Bước US (1 đến 8)<input name="step_us" type="number" min="1" max="8" value="' + esc(l.step_us || '') + '"></label>'
      + '<label>Thứ tự trong bước<input name="sort" type="number" value="' + esc(l.sort || 0) + '"></label>'
      + '<label class="w2">Tên tập<input name="title" required maxlength="160" value="' + esc(l.title || '') + '"></label>'
      + '<label class="w2">Bài tập<textarea name="exercise" rows="2">' + esc(l.exercise || '') + '</textarea></label>'
      + '<label>Kiểu nộp<select name="exercise_type">' + o("text", l.exercise_type || "text", "Chữ") + o("link", l.exercise_type, "Link") + o("image", l.exercise_type, "Ảnh chụp") + '</select></label>'
      + '</div><div class="ac-g">'
      + '<label>Video .mp4<input name="video" type="file" accept="video/mp4"></label>'
      + '<label>Phụ đề .srt<input name="srt" type="file" accept=".srt,.vtt"></label>'
      + '<label>Mục lục .txt<input name="chapters" type="file" accept=".txt,text/plain"></label>'
      + '<label>Tài liệu .pdf<input name="pdf" type="file" accept="application/pdf"></label>'
      + '<label>Ảnh bìa<input name="cover" type="file" accept="image/jpeg,image/png,image/webp"></label>'
      + '</div><label class="ac-ck"><input type="checkbox" name="published"' + (l.published ? ' checked' : '') + '> Công bố cho học viên</label>'
      + '<div><button class="btn primary" type="submit" id="acad-go">Tải lên và lưu</button>' + (l.id ? ' <button class="btn" type="button" data-acad-new>Thêm tập khác</button>' : '') + '</div><p class="ac-log" id="acad-log" aria-live="polite"></p></form>';
  }
  function readText(f) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result || "")); }; r.onerror = rej; r.readAsText(f, "utf-8"); }); }
  function videoDuration(f) { return new Promise(function (res) { var v = document.createElement("video"), u = URL.createObjectURL(f); v.preload = "metadata"; v.onloadedmetadata = function () { res(Math.round(v.duration || 0)); URL.revokeObjectURL(u); }; v.onerror = function () { res(null); URL.revokeObjectURL(u); }; v.src = u; }); }
  async function upload(bucket, path, body, type) {
    if (MOCK) { MOCK.files[path] = URL.createObjectURL(body); return; }
    var r = await sb().storage.from(bucket).upload(path, body, { contentType: type, upsert: true, cacheControl: "3600" });
    if (r.error) throw new Error(path + ": " + r.error.message);
  }
  async function saveLesson(f) {
    var d = new FormData(f), g = function (k) { return (d.get(k) || "").toString().trim(); }, file = function (k) { var x = d.get(k); return x && x.size ? x : null; };
    var log = $("#acad-log"), say = function (m) { log.textContent += m + "\n"; };
    var prog = g("program"), ep = g("episode"), title = g("title"), svn = parseInt(g("step_vn"), 10) || null, sus = parseInt(g("step_us"), 10) || null;
    if (!ep || !title) { toast("Nhập mã tập và tên tập"); return; }
    if (prog === "VN") sus = null; if (prog === "US") svn = null;
    if (!svn && !sus) { toast("Nhập bước của tập (VN, US hoặc cả hai)"); return; }
    var old = A.lessons.filter(function (l) { return f.dataset.id ? l.id === f.dataset.id : (l.program === prog && String(l.episode) === ep); })[0] || null;
    var id = old ? old.id : (prog.toLowerCase() + "-" + slug(ep) + "-" + slug(title)).slice(0, 80);
    var vf = file("video"), sf = file("srt"), cf = file("chapters"), pf = file("pdf"), bf = file("cover");
    if (!old && !vf) { toast("Tập mới cần có video"); return; }
    if (vf && vf.size > 50 * 1024 * 1024) { toast("Video quá 50 MB. Nhờ Đào Tạo xuất bản nhẹ hơn."); return; }
    $("#acad-go").disabled = true; log.textContent = "";
    try {
      var row = { id: id, program: prog, episode: ep, title: title, step_vn: svn, step_us: sus, sort: parseInt(g("sort"), 10) || 0, exercise: g("exercise") || null, exercise_type: g("exercise_type") || "text", published: !!d.get("published") };
      if (vf) { say("Đang tải video (" + Math.round(vf.size / 1048576) + " MB)..."); row.duration_sec = await videoDuration(vf); await upload(BUCKET, id + "/video.mp4", vf, "video/mp4"); row.video_path = id + "/video.mp4"; say("Xong video, " + hms(row.duration_sec) + "."); }
      else row.video_path = old.video_path;
      if (sf) { var st = await readText(sf), vt = /^﻿?WEBVTT/.test(st) ? st : srtToVtt(st); await upload(BUCKET, id + "/phu-de.vtt", new Blob([vt], { type: "text/vtt" }), "text/vtt"); row.vtt_path = id + "/phu-de.vtt"; say("Xong phụ đề."); }
      if (cf) { row.chapters = parseChapters(await readText(cf)); say("Đọc được " + row.chapters.length + " chương."); }
      if (pf) { await upload(BUCKET, id + "/tai-lieu.pdf", pf, "application/pdf"); row.pdf_path = id + "/tai-lieu.pdf"; row.pdf_name = pf.name; say("Xong tài liệu PDF."); }
      if (bf) { var ext = (bf.type.split("/")[1] || "jpg").replace("jpeg", "jpg"); await upload(BUCKET, id + "/bia." + ext, bf, bf.type); row.cover_path = id + "/bia." + ext; say("Xong ảnh bìa."); }
      if (MOCK) { var i = A.lessons.findIndex(function (l) { return l.id === id; }); var m = Object.assign({}, old || { chapters: [] }, row); if (i >= 0) A.lessons[i] = m; else A.lessons.push(m); }
      else { var r = await sb().from("academy_lessons").upsert(row, { onConflict: "id" }); if (r.error) throw new Error(r.error.message); await load(); }
      say("Đã lưu tập " + ep + (row.published ? ", đã công bố." : ", chưa công bố."));
      var done = log.textContent; toast("Đã lưu tập " + ep); changed();
      var nl = $("#acad-log"); if (nl) nl.textContent = done;
    } catch (e) { say("Lỗi: " + ((e && e.message) || e) + "\nFile đã tải trước lỗi vẫn nằm trong kho; tải lại sẽ ghi đè."); toast("Chưa lưu được, xem dòng lỗi"); }
    finally { var b = $("#acad-go"); if (b) b.disabled = false; }
  }
  async function submitWork(f) {
    if (!isStudent()) return;
    var lid = f.dataset.acadSub, sid = f.dataset.sid, d = new FormData(f), img = d.get("image");
    var cur = A.prog[key(sid, lid)], sub = Object.assign({}, (cur && cur.submission) || {});
    sub.text = (d.get("text") || "").toString().trim() || null;
    if (d.has("link")) { var lk = (d.get("link") || "").toString().trim(); if (lk && !/^https:\/\//.test(lk)) { toast("Link cần bắt đầu bằng https://"); return; } sub.link = lk || null; }
    var btn = f.querySelector(".ac-go"); btn.disabled = true;
    try {
      if (img && img.size) {
        if (img.size > 10 * 1024 * 1024) { toast("Ảnh quá 10 MB"); btn.disabled = false; return; }
        var ext = (img.type.split("/")[1] || "jpg").replace("jpeg", "jpg"), path = sid + "/" + lid + "/" + Date.now() + "." + ext;
        await upload(SUBS, path, img, img.type); sub.image_path = path;
      }
      if (!sub.text && !sub.link && !sub.image_path) { toast("Bài nộp đang trống"); btn.disabled = false; return; }
      await saveProgress(sid, lid, { submission: sub });
      toast("Đã nộp bài"); changed();
    } catch (e) { toast("Chưa nộp được: " + ((e && e.message) || e)); btn.disabled = false; }
  }

  /* ---------- sự kiện ---------- */
  document.addEventListener("click", async function (e) {
    var t = e.target.closest("[data-acad-t]");
    if (t) { var v = A.player && A.player.el; if (v) { v.currentTime = +t.dataset.acadT; v.play().catch(function () {}); markChapter(); } return; }
    var s = e.target.closest("[data-acad-sel]");
    if (s) { A.sel[s.dataset.sid] = s.dataset.acadSel; changed(); var pl = document.getElementById("acad-pl"); if (pl) pl.scrollIntoView({ block: "start", behavior: "smooth" }); return; }
    if (e.target.closest("[data-acad-subs]")) { A.subsOn = !A.subsOn; try { localStorage.setItem("acad-subs", A.subsOn ? "1" : "0"); } catch (_) {} applySubs(); changed(); return; }
    var p = e.target.closest("[data-acad-pdf]");
    if (p) { var l = A.lessons.filter(function (x) { return x.id === p.dataset.acadPdf; })[0]; var u = l && await signed(BUCKET, l.pdf_path, { download: l.pdf_name || "tai-lieu.pdf" }); if (u) window.open(u, "_blank", "noopener"); else toast("Chưa mở được tài liệu"); return; }
    var im = e.target.closest("[data-acad-img]");
    if (im) { var iu = await signed(SUBS, im.dataset.acadImg); if (iu) window.open(iu, "_blank", "noopener"); else toast("Chưa mở được ảnh"); return; }
    var mk = e.target.closest("[data-acad-mark]");
    if (mk && A.editor && !window.STUDENT_MODE) {
      var box = mk.closest("[data-acad-rv]"), note = (box.querySelector("textarea").value || "").trim();
      try { await saveProgress(box.dataset.sid, box.dataset.acadRv, { status: mk.dataset.acadMark, mentor_note: note || null, reviewed_at: new Date().toISOString() }); toast("Đã lưu: mentor đã xem"); changed(); }
      catch (err) { toast("Chưa lưu được: " + ((err && err.message) || err)); }
      return;
    }
    var pb = e.target.closest("[data-acad-pub]");
    if (pb && A.editor) {
      var on = pb.dataset.v === "1";
      if (MOCK) A.lessons.forEach(function (x) { if (x.id === pb.dataset.acadPub) x.published = on; });
      else { var r = await sb().from("academy_lessons").update({ published: on }).eq("id", pb.dataset.acadPub); if (r.error) { toast("Chưa đổi được: " + r.error.message); return; } await load(); }
      toast(on ? "Đã công bố" : "Đã ẩn"); changed(); return;
    }
    var ed = e.target.closest("[data-acad-edit]");
    if (ed) { var le = A.lessons.filter(function (x) { return x.id === ed.dataset.acadEdit; })[0], fm = document.getElementById("acad-form"); if (le && fm) { var wrap = document.createElement("div"); wrap.innerHTML = formHtml(le); fm.previousElementSibling.previousElementSibling.replaceWith(wrap.children[0]); fm.previousElementSibling.replaceWith(wrap.children[0]); fm.replaceWith(wrap.children[0]); document.getElementById("acad-fh").scrollIntoView({ behavior: "smooth" }); } return; }
    if (e.target.closest("[data-acad-new]")) { changed(); return; }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id === "acad-form") { e.preventDefault(); saveLesson(e.target); return; }
    if (e.target.dataset && e.target.dataset.acadSub) { e.preventDefault(); submitWork(e.target); }
  });

  /* ---------- kiểu dáng: theo trang học viên (kiểu Notion, phẳng, viền mảnh) ---------- */
  var css = document.createElement("style");
  css.textContent = ".ac-pl{position:relative;border:1px solid rgba(55,53,47,.16);border-radius:6px;overflow:hidden;background:#000;margin:14px 0 0}"
    + ".ac-pl.ov-on{min-height:310px}.ac-ov{position:absolute;inset:0;display:grid;place-items:center;padding:12px;background:rgba(15,15,15,.72);overflow:auto}"
    + ".ac-ovc{background:#fff;color:#37352F;border-radius:6px;padding:14px 16px;width:min(420px,100%);display:grid;gap:8px}"
    + ".ac-ovk{font-size:12.5px;color:rgba(55,53,47,.65)}.ac-ovt{font-size:16px;font-weight:600;line-height:1.35}.ac-ovm{font-size:13px;color:rgba(55,53,47,.65)}"
    + ".ac-ova{display:flex;flex-wrap:wrap;gap:8px}.ac-ova .ntn-bt{min-height:36px;padding:6px 14px}.ac-ova .ac-go{background:#37352F;color:#fff;border-color:#37352F}"
    + ".ac-ovck{display:flex;align-items:center;gap:8px;font-size:13.5px}.ac-ovs{font-size:13px;border-top:1px solid rgba(55,53,47,.12);padding-top:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}"
    + ".ac-nx{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}"
    + ".ac-v{display:block;width:100%;aspect-ratio:16/9;background:#000}.ac-err{margin:0;padding:24px;background:#fff;color:rgba(55,53,47,.65)}"
    + ".ac-hd{padding:12px 0 4px}.ac-k{font-size:13px;color:rgba(55,53,47,.65)}.ac-t{font-size:20px;font-weight:600;margin:2px 0 8px;line-height:1.3;color:#37352F}"
    + ".ac-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.ac-mu{font-size:13px;color:rgba(55,53,47,.65)}"
    + ".ac-ch{margin:10px 0;border:1px solid rgba(55,53,47,.16);border-radius:6px;padding:4px 10px}.ac-ch summary{cursor:pointer;padding:6px 0;font-weight:500}"
    + ".ac-ch ol{list-style:none;margin:0;padding:0 0 6px}.ac-ch button{display:grid;grid-template-columns:56px minmax(0,1fr);gap:6px;width:100%;text-align:left;border:0;background:none;padding:6px 4px;border-radius:4px;cursor:pointer;font:inherit;color:inherit}"
    + ".ac-ch button:hover{background:rgba(55,53,47,.06)}.ac-ch button.on{background:rgba(55,53,47,.08);font-weight:600}.ac-ch button span{color:rgba(55,53,47,.65);font-size:13px;padding-top:1px}"
    + ".ac-ex{border:1px solid rgba(55,53,47,.16);border-radius:6px;padding:12px 14px;margin:12px 0}.ac-exh{display:flex;gap:8px;align-items:center}.ac-ext{margin:6px 0 8px}"
    + ".ac-f,.ac-rv{display:grid;gap:8px;margin-top:8px}.ac-f label,.ac-rv label,.ac-form label{display:grid;gap:4px;font-size:13.5px;color:rgba(55,53,47,.75)}"
    + ".ac-f input,.ac-f textarea,.ac-rv textarea,.ac-form input,.ac-form select,.ac-form textarea{border:1px solid rgba(55,53,47,.2);border-radius:4px;padding:6px 8px;font:inherit;background:#fff;min-width:0}"
    + ".ac-st{margin:16px 0 4px;font-weight:600;font-size:14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}"
    + ".ac-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:8px;width:100%;text-align:left;border:0;border-bottom:1px solid rgba(55,53,47,.09);background:none;padding:8px 4px;cursor:pointer;font:inherit;color:inherit;align-items:baseline}"
    + ".ac-row:hover{background:rgba(55,53,47,.04)}.ac-row.on{background:rgba(55,53,47,.08)}.ac-ep{font-weight:600;font-size:13px}.ac-rs{font-size:12.5px;color:rgba(55,53,47,.65);white-space:nowrap}"
    + "@media (max-width:560px){.ac-row{grid-template-columns:40px minmax(0,1fr)}.ac-rs{grid-column:2;white-space:normal}}"
    + ".ac-h3{font-size:15px;margin:22px 0 8px}.ac-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:10px 0}.ac-g .w2{grid-column:span 2}"
    + "@media (max-width:560px){.ac-g .w2{grid-column:auto}}.ac-ck{display:flex!important;grid-auto-flow:column;align-items:center;gap:8px;margin:6px 0 10px}.ac-log{white-space:pre-wrap;font-size:13px;color:rgba(55,53,47,.75)}"
    + ".ac-mx td,.ac-mx th{white-space:nowrap;font-size:13px}.ac-na{color:rgba(55,53,47,.35)}";
  document.head.appendChild(css);
  try { A.subsOn = localStorage.getItem("acad-subs") !== "0"; A.auto = localStorage.getItem("acad-auto") !== "0"; } catch (_) {}

  window.ACAD = {
    init: async function (o) { if (o && o.onChange) A.onChange = o.onChange; await load(); changed(); },
    reload: async function () { await load(); changed(); },
    view: view, adminView: adminView, mount: mount, count: count,
    _state: A, _srtToVtt: srtToVtt, _parseChapters: parseChapters
  };
})();
