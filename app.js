// app.js - Bộ điều khiển chính của Chùa Online 3D Nhập Vai

(function () {
  const DATA = window.CHUA_DATA;

  const state = {
    started: false,
    insideTemple: false,
    merit: 0,
    sen: 50,
    ngoc: 5,
    level: 1,
    character: {
      type: "monk",
      robeId: 1,
      robeColor: DATA.robeColors[0].robe,
      sashColor: DATA.robeColors[0].sash,
      name: "Tịnh Nghiêm 50",
      hat: false,
      halo: false,
      companion: "cat"
    },
    beadCount: 0,
    woodenFishStrikes: 0,
    selectedSutraIdx: 0,
    activeSutraLine: 0,
    autoWoodenFishTimer: null,
    selectedOfferingId: "incense",
    wishes: [...DATA.initialWishes],
    chat: [...DATA.initialChat],
    questProgress: {
      enter_gate: 0,
      bow: 0,
      incense: 0,
      beads: 0,
      chant: 0,
      bell: 0,
      lantern: 0
    },
    questClaimed: {}
  };

  let world = null;

  const el = (id) => document.getElementById(id);

  // 1. Vẽ Preview Nhân Vật Chibi trong Modal Tạo Nhân Vật
  function drawCharacterPreview() {
    const canvas = el("entryPreviewCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2 + 12;

    // Bóng đổ dưới chân
    ctx.fillStyle = "rgba(73, 55, 34, 0.16)";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 68, 38, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hào quang sau đầu nếu bật
    if (state.character.halo) {
      ctx.strokeStyle = "#f2c14e";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy - 34, 44, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Giày vải nâu
    ctx.fillStyle = "#3b2313";
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy + 64, 11, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 14, cy + 64, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thân áo tràng
    ctx.fillStyle = state.character.robeColor;
    ctx.beginPath();
    ctx.moveTo(cx - 26, cy - 4);
    ctx.lineTo(cx + 26, cy - 4);
    ctx.lineTo(cx + 36, cy + 60);
    ctx.lineTo(cx - 36, cy + 60);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3b2313";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Đai lưng & Tràng hạt cổ
    ctx.fillStyle = state.character.sashColor;
    ctx.fillRect(cx - 30, cy + 22, 60, 9);
    ctx.fillRect(cx + 4, cy + 22, 9, 26);

    // Hai tay áo chắp trước ngực
    ctx.fillStyle = state.character.robeColor;
    ctx.beginPath();
    ctx.arc(cx - 28, cy + 16, 13, 0, Math.PI * 2);
    ctx.arc(cx + 28, cy + 16, 13, 0, Math.PI * 2);
    ctx.fill();

    // Đầu tròn dễ thương
    ctx.fillStyle = "#f5cfa6";
    ctx.beginPath();
    ctx.arc(cx, cy - 34, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#4a301e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Kiểu tóc
    if (state.character.type === "male") {
      ctx.fillStyle = "#2d1d12";
      ctx.beginPath();
      ctx.arc(cx, cy - 38, 34, Math.PI, Math.PI * 2);
      ctx.fill();
    } else if (state.character.type === "female") {
      ctx.fillStyle = "#2d1d12";
      ctx.beginPath();
      ctx.arc(cx, cy - 38, 34, Math.PI * 0.92, Math.PI * 2.08);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy - 72, 13, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tiểu tăng: 6 chấm giới hương trên đỉnh đầu
      ctx.fillStyle = "#c89b6e";
      [-8, 0, 8].forEach((ox) => {
        ctx.beginPath();
        ctx.arc(cx + ox, cy - 56, 2, 0, Math.PI * 2);
        ctx.arc(cx + ox, cy - 62, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Đôi mắt to long lanh & Nụ cười hiền
    ctx.fillStyle = "#241409";
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy - 30, 4.5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy - 30, 4.5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 13.5, cy - 32, 1.8, 0, Math.PI * 2);
    ctx.arc(cx + 10.5, cy - 32, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#6e4226";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 22, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Nón lá nếu đội
    if (state.character.hat) {
      ctx.fillStyle = "#e6cf9c";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 82);
      ctx.lineTo(cx - 46, cy - 48);
      ctx.lineTo(cx + 46, cy - 48);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // 2. Khởi tạo UI Modal Tạo Nhân Vật
  function initEntryModal() {
    const swatchGrid = el("robeSwatchGrid");
    swatchGrid.innerHTML = "";
    DATA.robeColors.forEach((rc, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch" + (idx === 0 ? " active" : "");
      btn.style.background = rc.robe;
      btn.title = rc.name;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".color-swatch").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.character.robeId = rc.id;
        state.character.robeColor = rc.robe;
        state.character.sashColor = rc.sash;
        drawCharacterPreview();
      });
      swatchGrid.appendChild(btn);
    });

    document.querySelectorAll("#charTypeGrid .type-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#charTypeGrid .type-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        state.character.type = chip.dataset.type;
        drawCharacterPreview();
      });
    });

    el("btnRandomDharmaName").addEventListener("click", () => {
      const base = DATA.dharmaNames[Math.floor(Math.random() * DATA.dharmaNames.length)];
      const num = Math.floor(10 + Math.random() * 89);
      el("dharmaNameInput").value = `${base} ${num}`;
    });

    el("chkWearHat").addEventListener("change", (e) => {
      state.character.hat = e.target.checked;
      drawCharacterPreview();
    });

    el("chkWearHalo").addEventListener("change", (e) => {
      state.character.halo = e.target.checked;
      drawCharacterPreview();
    });

    el("btnConfirmEnterTemple").addEventListener("click", () => {
      const inputName = el("dharmaNameInput").value.trim() || "Tịnh Nghiêm 50";
      state.character.name = inputName;
      el("entryModal").hidden = true;
      el("btnCloseEntryModal").hidden = false;

      window.templeAudio.init();
      window.templeAudio.startBGM();
      updateHUD();

      if (world) {
        world.updatePlayerAppearance(state.character);
      }

      if (!state.started) {
        state.started = true;
        // Hiện màn hình chuyển cảnh "Đang về Chùa Vô Lượng · Khởi hành trước Cổng Tam Quan"
        const trans = el("transitionScreen");
        trans.hidden = false;
        setTimeout(() => {
          trans.hidden = true;
          showToast("⛩️ Bạn đã xuất hiện trước Cổng Tam Quan. Hãy bước qua cổng để vào Chùa hành lễ!");
        }, 1250);
      } else {
        showToast("👘 Đã cập nhật diện mạo & pháp danh nhân vật!");
      }
    });

    el("btnCloseEntryModal").addEventListener("click", () => {
      el("entryModal").hidden = true;
    });

    drawCharacterPreview();
  }

  // 3. Cộng Công Đức & Kiểm tra Lên Cấp Tu
  function addMerit(amount, reasonText = "") {
    state.merit += amount;
    spawnFloatingMeritText(`+${amount} Công đức`);
    if (reasonText) {
      showToast(`${reasonText} (+${amount} Công đức 🪷)`);
    }

    // Kiểm tra cấp tu
    let newLvl = DATA.levels[0];
    for (const lv of DATA.levels) {
      if (state.merit >= lv.minMerit) {
        newLvl = lv;
      }
    }
    if (newLvl.level > state.level) {
      state.level = newLvl.level;
      state.sen += newLvl.rewardSen;
      window.templeAudio.playGreatBell();
      addChatMessage("Hệ thống", `🎉 Pháp danh ${state.character.name} vừa chứng đạt cấp tu 【${newLvl.name}】! (+${newLvl.rewardSen} Sen)`, true);
      showToast(`🌟 Chúc mừng lên Cấp ${newLvl.level}: ${newLvl.name}! (${newLvl.unlock})`);
    }

    updateHUD();
  }

  function advanceQuest(questId, step = 1) {
    if (!(questId in state.questProgress)) return;
    const q = DATA.quests.find((item) => item.id === questId);
    if (!q) return;

    state.questProgress[questId] = Math.min(q.target, state.questProgress[questId] + step);
    if (state.questProgress[questId] >= q.target && !state.questClaimed[questId]) {
      state.questClaimed[questId] = true;
      state.sen += q.rewardSen;
      addMerit(q.rewardMerit, `📜 Hoàn thành nhiệm vụ: ${q.title}`);
    }
    renderQuests();
  }

  function spawnFloatingMeritText(text) {
    const container = el("floatingMeritContainer");
    const item = document.createElement("div");
    item.className = "floating-merit";
    item.textContent = text;
    container.appendChild(item);
    setTimeout(() => item.remove(), 1450);
  }

  let toastTimer = null;
  function showToast(msg) {
    const banner = el("toastBanner");
    banner.textContent = msg;
    banner.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      banner.hidden = true;
    }, 3600);
  }

  function updateHUD() {
    el("hudName").textContent = state.character.name;
    el("hudAvatar").textContent = state.character.name.charAt(0).toUpperCase();
    const curLevelObj = DATA.levels.find((l) => l.level === state.level) || DATA.levels[0];
    el("hudLevel").textContent = `Cấp ${curLevelObj.level} · ${curLevelObj.name}`;
    el("hudMerit").textContent = state.merit.toLocaleString("vi-VN");
    el("hudSen").textContent = state.sen.toLocaleString("vi-VN");
    el("hudNgoc").textContent = state.ngoc.toLocaleString("vi-VN");
  }

  function renderQuests() {
    const container = el("questListContainer");
    if (!container) return;
    container.innerHTML = "";
    let doneCount = 0;
    DATA.quests.forEach((q) => {
      const cur = state.questProgress[q.id] || 0;
      const isDone = cur >= q.target;
      if (isDone) doneCount++;
      const row = document.createElement("div");
      row.className = "quest-item" + (isDone ? " done" : "");
      row.innerHTML = `<span>${isDone ? "✓" : "•"} ${q.title}</span><b>${cur}/${q.target}</b>`;
      container.appendChild(row);
    });
    el("questProgressSummary").textContent = `${doneCount}/${DATA.quests.length}`;
  }

  // 4. Xử lý khi Nhân Vật BƯỚC QUA CỔNG TAM QUAN VÀO TRONG CHÙA
  function handleEnterTempleGrounds() {
    if (state.insideTemple) return;
    state.insideTemple = true;
    document.body.classList.remove("outside-gate");
    el("gateWelcomeBanner").hidden = true;

    advanceQuest("enter_gate", 1);
    addChatMessage("Hệ thống", `🙏 Phật tử ${state.character.name} vừa bước qua Cổng Tam Quan vào Chùa Vô Lượng.`, true);
    showToast("⛩️ Bạn đã bước vào trong Chùa Vô Lượng! Các Menu Hành Lễ đã hiện lên.");
  }

  function handleZoneChange(zone) {
    const titleEl = el("hudZoneTitle");
    document.querySelectorAll(".zone-btn").forEach((b) => b.classList.remove("active"));
    if (zone === "outside") {
      titleEl.textContent = "⛩️ Trước Cổng Tam Quan";
      el("btnGoGate").classList.add("active");
    } else if (zone === "courtyard") {
      titleEl.textContent = "🌳 Sân Chùa Vô Lượng";
      el("btnGoCourtyard").classList.add("active");
      handleEnterTempleGrounds();
    } else if (zone === "mainhall") {
      titleEl.textContent = "🏯 Chánh Điện Tam Bảo";
      el("btnGoMainHall").classList.add("active");
      handleEnterTempleGrounds();
    }
  }

  function handleHotspotChange(hotspot) {
    const btn = el("hotspotPromptBtn");
    const txt = el("hotspotPromptText");
    if (!hotspot) {
      btn.hidden = true;
      return;
    }
    btn.hidden = false;
    txt.textContent = hotspot.prompt;
  }

  // 5. Thực hiện các Nghi Thức Hành Lễ (kèm di chuyển tới điểm lễ + Animation 3D + Giao diện)
  function showRitualStatus(text) {
    const pill = el("ritualStatusPill");
    el("ritualStatusText").textContent = text;
    pill.hidden = false;
  }

  function hideRitualStatus() {
    el("ritualStatusPill").hidden = true;
    document.querySelectorAll(".practice-btn").forEach((b) => b.classList.remove("active"));
  }

  function highlightPracticeBtn(ritualId) {
    document.querySelectorAll(".practice-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.ritual === ritualId);
    });
  }

  function performRitual(ritualId) {
    if (!world) return;
    handleEnterTempleGrounds();
    highlightPracticeBtn(ritualId);

    if (ritualId === "bow") {
      // Lạy Phật: Nếu đang ở ngoài sân thì tự bước vào chiếu lễ giữa Chánh Điện (0, -14.2) rồi quỳ lạy dập đầu 3 lạy
      const distToHall = Math.hypot(world.player.pos.x - 0, world.player.pos.z - (-14.2));
      const startBowing = () => {
        showRitualStatus("🙇 Đang thành tâm Lạy Phật перед bàn thờ Tam Thế (Lạy 1/3 - Chắp tay & Dập đầu)...");
        world.startRitualAction("bow");
      };
      if (distToHall > 4.5) {
        showRitualStatus("🚶 Đang bước lên chiếu Bồ Đoàn trong Chánh Điện để Lạy Phật...");
        world.walkTo(0, -14.2, startBowing);
      } else {
        startBowing();
      }
    } else if (ritualId === "incense") {
      // Thắp Hương: Đi tới trước Lư Hương Đồng (0, -0.4), nâng 3 nén hương vái 3 vái và mở bảng Dâng Lễ
      const startIncense = () => {
        showRitualStatus("🪔 Nhân vật đang cầm 3 nén hương khấn nguyện trước Lư Hương Đại Đồng...");
        world.startRitualAction("incense");
        el("incenseModal").hidden = false;
      };
      const dist = Math.hypot(world.player.pos.x - 0, world.player.pos.z - (-0.4));
      if (dist > 3.2) {
        showRitualStatus("🚶 Đang tiến tới Lư Hương Đại Đồng trước thềm Chánh Điện...");
        world.walkTo(0, -0.4, startIncense);
      } else {
        startIncense();
      }
    } else if (ritualId === "beads") {
      // Lần Tràng Hạt 108 Hạt: Ngồi trên bồ đoàn bên trái (-3.2, -14.6)
      const startBeads = () => {
        showRitualStatus("📿 Đang ngồi kiết già trên bồ đoàn lần tràng hạt 108 hạt...");
        world.startRitualAction("beads");
        drawBeadsRing();
        el("beadsModal").hidden = false;
      };
      const dist = Math.hypot(world.player.pos.x - (-3.2), world.player.pos.z - (-14.6));
      if (dist > 3.5) {
        showRitualStatus("🚶 Đang đi tới Bồ Đoàn Tràng Hạt...");
        world.walkTo(-3.2, -14.6, startBeads);
      } else {
        startBeads();
      }
    } else if (ritualId === "chant") {
      // Tụng kinh & Gõ mõ: Ngồi trên bồ đoàn bên phải cạnh cái Mõ Gỗ (3.2, -14.6)
      const startChant = () => {
        showRitualStatus("📖 Đang ngồi trước Mõ Gỗ tụng kinh & gõ mõ...");
        world.startRitualAction("chant");
        renderSutraLines();
        el("chantModal").hidden = false;
      };
      const dist = Math.hypot(world.player.pos.x - 3.2, world.player.pos.z - (-14.6));
      if (dist > 3.5) {
        showRitualStatus("🚶 Đang đi tới Bồ Đoàn Mõ Gỗ trong Chánh Điện...");
        world.walkTo(3.2, -14.6, startChant);
      } else {
        startChant();
      }
    } else if (ritualId === "meditate") {
      // Ngồi thiền tịnh tâm ngay trên bồ đoàn hoặc tại chỗ
      world.startRitualAction("meditate");
      showRitualStatus("🧘 Đang ngồi Thiền Định quán chiếu hơi thở (Hít vào bình an – Thở ra nhẹ nhàng)...");
      addMerit(3, "🧘 Ngồi thiền định tâm");
    } else if (ritualId === "companion") {
      renderCompanionModal();
      el("companionModal").hidden = false;
    } else if (ritualId === "bell") {
      // Thỉnh Đại Hồng Chuông tại Gác Chuông (-9.5, 2.0)
      const ringNow = () => {
        world.startRitualAction("bell");
        showRitualStatus("🔔 Đang thỉnh Đại Hồng Chuông ngân vang khắp sân chùa...");
        addMerit(3, "🔔 Thỉnh Đại Hồng Chuông");
        advanceQuest("bell", 1);
        addChatMessage("Hệ thống", `🔔 Tiếng Đại Hồng Chuông ngân vang từ ${state.character.name}, cầu nguyện quốc thái dân an.`, true);
        setTimeout(() => hideRitualStatus(), 2800);
      };
      const dist = Math.hypot(world.player.pos.x - (-9.5), world.player.pos.z - 2.0);
      if (dist > 3.5) {
        showRitualStatus("🚶 Đang bước tới Gác Chuông Hai Tầng...");
        world.walkTo(-9.5, 2.0, ringNow);
      } else {
        ringNow();
      }
    } else if (ritualId === "fortune") {
      // Xin Xăm tại Gác Trống (9.5, 2.0)
      const openFortune = () => {
        world.startRitualAction("fortune");
        showRitualStatus("🎋 Đang quỳ trước án thư xin xăm đầu năm...");
        el("fortuneStage").hidden = false;
        el("fortuneResultBox").hidden = true;
        el("fortuneModal").hidden = false;
      };
      const dist = Math.hypot(world.player.pos.x - 9.5, world.player.pos.z - 2.0);
      if (dist > 3.5) {
        showRitualStatus("🚶 Đang bước tới Ống Xăm cạnh Gác Trống...");
        world.walkTo(9.5, 2.0, openFortune);
      } else {
        openFortune();
      }
    } else if (ritualId === "lantern") {
      // Thả Đèn Hoa Đăng tại bờ Hồ Sen (-5.2, 12.5)
      const openLantern = () => {
        showRitualStatus("🪷 Đang đứng bên bờ Hồ Sen chuẩn bị thả Đèn Hoa Đăng...");
        el("lanternModal").hidden = false;
      };
      const dist = Math.hypot(world.player.pos.x - (-5.2), world.player.pos.z - 12.5);
      if (dist > 3.5) {
        showRitualStatus("🚶 Đang đi tới bờ Hồ Sen Cá Koi...");
        world.walkTo(-5.2, 12.5, openLantern);
      } else {
        openLantern();
      }
    } else if (ritualId === "sweep") {
      // Quét lá Bồ Đề rơi (8.2, 13.0)
      const sweepNow = () => {
        world.startRitualAction("sweep");
        showRitualStatus("🧹 Đang cầm chổi tre quét lá Bồ Đề trên sân chùa...");
        addMerit(2, "🧹 Quét sạch lá Bồ Đề sân chùa");
        setTimeout(() => hideRitualStatus(), 2300);
      };
      const dist = Math.hypot(world.player.pos.x - 8.2, world.player.pos.z - 13.0);
      if (dist > 3.8) {
        showRitualStatus("🚶 Đang đi tới gốc Cây Bồ Đề để quét lá...");
        world.walkTo(8.2, 13.0, sweepNow);
      } else {
        sweepNow();
      }
    }
  }

  // 6. Vòng Tràng Hạt 108 Hạt Canvas
  function drawBeadsRing() {
    const canvas = el("beadsCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = 108;
    const total = 36; // Hiển thị 36 hạt đại diện cho vòng 108 hạt dễ nhìn, mỗi hạt có hiệu ứng sáng
    const activeBeads = state.beadCount % 108;

    // Dây tràng hạt
    ctx.strokeStyle = "#b88a44";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < total; i++) {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const bx = cx + Math.cos(angle) * radius;
      const by = cy + Math.sin(angle) * radius;
      const isLit = i <= Math.floor((activeBeads / 108) * total);

      ctx.beginPath();
      ctx.arc(bx, by, i === 0 ? 10 : 7.5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? "#d9534f" : isLit ? "#f2b84b" : "#8c5a2b";
      ctx.fill();
      ctx.strokeStyle = isLit ? "#fff3c4" : "#4a2c11";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    el("beadCountDisplay").textContent = `${state.beadCount} / 108`;
  }

  function tapOneBead() {
    state.beadCount++;
    if (world) world.triggerBeadPulse();
    drawBeadsRing();
    advanceQuest("beads", 1);

    if (state.beadCount % 108 === 0) {
      addMerit(20, "📿 Viên mãn 1 vòng 108 hạt niệm Phật");
    } else {
      addMerit(1, "📿 Niệm: Nam Mô A Di Đà Phật");
    }
  }

  // 7. Tụng Kinh & Gõ Mõ
  function initSutraModal() {
    const sel = el("sutraSelect");
    sel.innerHTML = "";
    DATA.sutras.forEach((s, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = `${s.title} (${s.subtitle})`;
      sel.appendChild(opt);
    });
    sel.addEventListener("change", () => {
      state.selectedSutraIdx = Number(sel.value);
      state.activeSutraLine = 0;
      renderSutraLines();
    });

    el("btnStrikeWoodenFish").addEventListener("click", () => {
      strikeWoodenFishOnce();
    });

    el("btnToggleAutoWoodenFish").addEventListener("click", () => {
      if (state.autoWoodenFishTimer) {
        clearInterval(state.autoWoodenFishTimer);
        state.autoWoodenFishTimer = null;
        el("btnToggleAutoWoodenFish").textContent = "▶️ Tự động gõ mõ (80 nhịp/phút)";
      } else {
        el("btnToggleAutoWoodenFish").textContent = "⏸️ Dừng tự động gõ mõ";
        state.autoWoodenFishTimer = setInterval(() => {
          if (el("chantModal").hidden) {
            clearInterval(state.autoWoodenFishTimer);
            state.autoWoodenFishTimer = null;
            el("btnToggleAutoWoodenFish").textContent = "▶️ Tự động gõ mõ (80 nhịp/phút)";
            return;
          }
          strikeWoodenFishOnce();
        }, 750);
      }
    });
  }

  function renderSutraLines() {
    const box = el("sutraLinesContainer");
    const sutra = DATA.sutras[state.selectedSutraIdx] || DATA.sutras[0];
    box.innerHTML = "";
    sutra.lines.forEach((line, idx) => {
      const div = document.createElement("div");
      div.className = "sutra-line" + (idx === state.activeSutraLine ? " active" : "");
      div.textContent = line;
      box.appendChild(div);
      if (idx === state.activeSutraLine) {
        div.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
  }

  function strikeWoodenFishOnce() {
    state.woodenFishStrikes++;
    el("woodenFishCount").textContent = state.woodenFishStrikes;
    if (world) world.triggerWoodenFishStrike();

    const sutra = DATA.sutras[state.selectedSutraIdx] || DATA.sutras[0];
    state.activeSutraLine = (state.activeSutraLine + 1) % sutra.lines.length;
    renderSutraLines();

    advanceQuest("chant", 1);
    addMerit(1, "🪵 Gõ mõ tụng kinh");
  }

  // 8. Dâng Lễ & Thắp Hương
  function initIncenseModal() {
    const grid = el("offeringGrid");
    grid.innerHTML = "";
    DATA.offerings.forEach((off) => {
      const card = document.createElement("div");
      card.className = "select-card" + (off.id === state.selectedOfferingId ? " active" : "");
      card.innerHTML = `
        <span class="select-card-icon">${off.icon}</span>
        <b>${off.name}</b>
        <small>+${off.merit} Công đức</small>
      `;
      card.addEventListener("click", () => {
        state.selectedOfferingId = off.id;
        initIncenseModal();
      });
      grid.appendChild(card);
    });
  }

  // 9. Khung Đèn Nguyện & Thả Đèn Hoa Đăng
  function renderWishes() {
    const list = el("wishListContainer");
    el("wishCountText").textContent = state.wishes.length;
    list.innerHTML = "";
    state.wishes.forEach((w) => {
      const item = document.createElement("div");
      item.className = "wish-card";
      item.innerHTML = `
        <p>“${w.text}”</p>
        <div class="wish-meta">
          <span><b>${w.author}</b> · ${w.time}</span>
          <button type="button" class="wish-like-btn">🙏 ${w.likes}</button>
        </div>
      `;
      item.querySelector(".wish-like-btn").addEventListener("click", () => {
        w.likes++;
        renderWishes();
        addMerit(1, "🙏 Tùy hỷ lời nguyện lành");
      });
      list.appendChild(item);
    });
  }

  // 10. Trò chuyện cộng đồng sân chùa
  function renderChat() {
    const box = el("chatMessages");
    box.innerHTML = "";
    state.chat.forEach((m) => {
      const div = document.createElement("div");
      div.className = "chat-line" + (m.sys ? " sys" : "") + (m.abbot ? " abbot" : "");
      div.innerHTML = `<b>${m.sender}:</b> ${m.text}`;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  }

  function addChatMessage(sender, text, sys = false) {
    state.chat.push({ sender, text, sys });
    if (state.chat.length > 30) state.chat.shift();
    renderChat();
  }

  // 11. Modal Linh Thú & Cấp Tu
  function renderCompanionModal() {
    const grid = el("companionGrid");
    grid.innerHTML = "";
    DATA.companions.forEach((pet) => {
      const card = document.createElement("div");
      card.className = "select-card" + (state.character.companion === pet.id ? " active" : "");
      card.innerHTML = `
        <span class="select-card-icon">${pet.icon}</span>
        <b>${pet.name}</b>
        <small>${pet.desc}</small>
      `;
      card.addEventListener("click", () => {
        state.character.companion = pet.id;
        if (world) world.updatePlayerAppearance(state.character);
        renderCompanionModal();
        showToast(`🐾 Đã chọn linh thú đồng hành: ${pet.name}`);
      });
      grid.appendChild(card);
    });
  }

  function renderLevelModal() {
    const curLevelObj = DATA.levels.find((l) => l.level === state.level) || DATA.levels[0];
    el("modalCurrentLevelName").textContent = `Cấp ${curLevelObj.level} · ${curLevelObj.name}`;
    el("modalCurrentMerit").textContent = state.merit.toLocaleString("vi-VN");

    const list = el("levelProgressionList");
    list.innerHTML = "";
    DATA.levels.forEach((lv) => {
      const unlocked = state.merit >= lv.minMerit;
      const row = document.createElement("div");
      row.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:10px;background:${unlocked ? "#e6d4a8" : "#efe7d6"};border:1px solid #d5c3a1;font-size:13px;`;
      row.innerHTML = `
        <div>
          <b>Cấp ${lv.level} · ${lv.name}</b> ${unlocked ? "✅" : "🔒"}
          <div style="font-size:11.5px;color:#7a6648;">${lv.unlock}</div>
        </div>
        <b style="font-family:var(--font-mono);color:#8a5a19;">${lv.minMerit} 🪷</b>
      `;
      list.appendChild(row);
    });
  }

  // 12. Vẽ Bản đồ nhỏ Minimap
  function drawMinimap() {
    const canvas = el("minimapCanvas");
    if (!canvas || !world) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Nền sân chùa
    ctx.fillStyle = "#241911";
    ctx.fillRect(0, 0, w, h);

    const mapX = (x) => w / 2 + (x / 22) * (w / 2);
    const mapZ = (z) => h / 2 + ((z - 5) / 34) * (h / 2);

    // Chánh Điện phía Bắc
    ctx.fillStyle = "#8c2d19";
    ctx.fillRect(mapX(-9), mapZ(-21), 48, 22);

    // Hồ Sen bên trái
    ctx.fillStyle = "#1b5c63";
    ctx.fillRect(mapX(-13), mapZ(9), 22, 18);

    // Lư hương ở giữa
    ctx.fillStyle = "#d9a74a";
    ctx.beginPath();
    ctx.arc(mapX(0), mapZ(-2.2), 4, 0, Math.PI * 2);
    ctx.fill();

    // Cổng Tam Quan (z = 23)
    ctx.strokeStyle = "#f2c14e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mapX(-14), mapZ(23));
    ctx.lineTo(mapX(14), mapZ(23));
    ctx.stroke();

    // Các NPC
    ctx.fillStyle = "#6ee787";
    world.npcs.forEach((n) => {
      ctx.beginPath();
      ctx.arc(mapX(n.x), mapZ(n.z), 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vị trí người chơi
    const px = mapX(world.player.pos.x);
    const pz = mapZ(world.player.pos.z);
    ctx.fillStyle = "#ffd56b";
    ctx.beginPath();
    ctx.arc(px, pz, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 13. Kết nối toàn bộ sự kiện nút bấm & phím tắt
  function bindUIEvents() {
    // Chuyển nhanh khu vực
    el("btnGoGate").addEventListener("click", () => world?.teleportTo("gate"));
    el("btnGoCourtyard").addEventListener("click", () => {
      handleEnterTempleGrounds();
      world?.teleportTo("courtyard");
    });
    el("btnGoMainHall").addEventListener("click", () => {
      handleEnterTempleGrounds();
      world?.teleportTo("mainhall");
    });

    // Nút tương tác điểm vàng [E]
    el("hotspotPromptBtn").addEventListener("click", () => {
      triggerActiveHotspot();
    });

    el("btnStopRitual").addEventListener("click", () => {
      world?.resetPlayerPose();
      hideRitualStatus();
    });

    // 6 Nút Hành Lễ Chính góc dưới phải
    document.querySelectorAll("#practiceGrid .practice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        performRitual(btn.dataset.ritual);
      });
    });

    // Hàng menu phụ góc dưới trái
    el("btnActionBell").addEventListener("click", () => performRitual("bell"));
    el("btnActionFortune").addEventListener("click", () => performRitual("fortune"));
    el("btnActionSweep").addEventListener("click", () => performRitual("sweep"));
    el("btnOpenLevelModal").addEventListener("click", () => {
      renderLevelModal();
      el("levelModal").hidden = false;
    });
    el("openProfilePill").addEventListener("click", () => {
      renderLevelModal();
      el("levelModal").hidden = false;
    });
    el("btnOpenCharacterModal").addEventListener("click", () => {
      drawCharacterPreview();
      el("entryModal").hidden = false;
    });
    el("btnGuide").addEventListener("click", () => {
      el("guideModal").hidden = false;
    });

    // Tràng hạt
    el("btnTapBead").addEventListener("click", tapOneBead);
    el("beadsCanvas").addEventListener("click", tapOneBead);

    // Dâng hương & lời nguyện
    el("btnSubmitIncense").addEventListener("click", () => {
      const off = DATA.offerings.find((o) => o.id === state.selectedOfferingId) || DATA.offerings[0];
      const wishText = el("incenseWishInput").value.trim() || "Cầu mong gia đình bình an, thân tâm thường lạc.";
      world?.addIncenseStickToBurner();
      world?.spawnIncenseSmoke(14);
      window.templeAudio.playBowlChime();

      state.wishes.unshift({
        author: state.character.name,
        time: "Vừa xong",
        text: wishText,
        likes: 1
      });
      renderWishes();
      advanceQuest("incense", 1);
      addMerit(off.merit, `🪔 Đã dâng ${off.name} & cắm hương vào Lư Đồng`);
      addChatMessage("Hệ thống", `🪔 ${state.character.name} vừa thành tâm dâng ${off.name} trước Tam Bảo.`, true);
      el("incenseWishInput").value = "";
      el("incenseModal").hidden = true;
      setTimeout(() => {
        world?.resetPlayerPose();
        hideRitualStatus();
      }, 2200);
    });

    // Thả đèn hoa đăng
    el("btnOpenLanternModal").addEventListener("click", () => performRitual("lantern"));
    el("btnSubmitLantern").addEventListener("click", () => {
      const text = el("lanternWishInput").value.trim() || "Nguyện cầu bình an, may mắn đến với mọi người.";
      world?.startRitualAction("lantern");
      window.templeAudio.playBowlChime();
      state.wishes.unshift({
        author: state.character.name,
        time: "Vừa xong",
        text,
        likes: 1
      });
      renderWishes();
      advanceQuest("lantern", 1);
      addMerit(3, "🪷 Đã thả Đèn Hoa Đăng xuống Hồ Sen");
      addChatMessage("Hệ thống", `🪷 ${state.character.name} vừa thả một ngọn Đèn Hoa Đăng sáng rực trên Hồ Sen.`, true);
      el("lanternWishInput").value = "";
      el("lanternModal").hidden = true;
      setTimeout(() => hideRitualStatus(), 2000);
    });

    // Xin xăm
    el("btnShakeFortune").addEventListener("click", () => {
      const cyl = el("bambooCylinder");
      cyl.classList.add("shaking");
      window.templeAudio.playFortuneShake();
      setTimeout(() => {
        cyl.classList.remove("shaking");
        const f = DATA.fortunes[Math.floor(Math.random() * DATA.fortunes.length)];
        el("fortuneTitleText").textContent = `Quẻ Số ${f.num} · ${f.title}`;
        el("fortuneRankBadge").textContent = f.rank;
        el("fortunePoemText").textContent = f.poem;
        el("fortuneOverallText").textContent = f.overall;
        el("fortuneWorkText").textContent = f.work;
        el("fortuneLoveText").textContent = f.love;
        el("fortuneHealthText").textContent = f.health;
        el("fortuneStage").hidden = true;
        el("fortuneResultBox").hidden = false;
        addMerit(2, `🎋 Xin được Quẻ Xăm số ${f.num} (${f.rank})`);
      }, 1100);
    });

    el("btnRedrawFortune").addEventListener("click", () => {
      el("fortuneStage").hidden = false;
      el("fortuneResultBox").hidden = true;
    });

    // Đóng các modal
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modalId = btn.getAttribute("data-close");
        el(modalId).hidden = true;
        world?.resetPlayerPose();
        hideRitualStatus();
      });
    });

    // Chat form
    el("chatForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const val = el("chatInput").value.trim();
      if (!val) return;
      addChatMessage(state.character.name, val, false);
      el("chatInput").value = "";
      addMerit(1, "💬 Gửi lời ái ngữ thiện lành");
    });

    // Âm thanh & Zoom
    el("btnToggleMusic").addEventListener("click", () => {
      const on = window.templeAudio.toggleMusic();
      el("btnToggleMusic").setAttribute("data-off", String(!on));
    });
    el("btnToggleMute").addEventListener("click", () => {
      const muted = window.templeAudio.toggleMute();
      el("btnToggleMute").setAttribute("data-off", String(muted));
      el("btnToggleMute").textContent = muted ? "🔇" : "🔊";
    });
    el("btnZoomIn").addEventListener("click", () => world?.zoomCamera(-1.8));
    el("btnZoomOut").addEventListener("click", () => world?.zoomCamera(1.8));

    // Phím tắt bàn phím (E, B, T, K, M, H, P, Space, Escape)
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;

      if (e.code === "KeyE") {
        e.preventDefault();
        triggerActiveHotspot();
      } else if (e.code === "KeyB") {
        e.preventDefault();
        performRitual("bow");
      } else if (e.code === "KeyT") {
        e.preventDefault();
        performRitual("beads");
      } else if (e.code === "KeyK") {
        e.preventDefault();
        performRitual("chant");
      } else if (e.code === "KeyM") {
        e.preventDefault();
        performRitual("meditate");
      } else if (e.code === "KeyH") {
        e.preventDefault();
        performRitual("incense");
      } else if (e.code === "KeyP") {
        e.preventDefault();
        performRitual("companion");
      } else if (e.code === "Space" && !el("beadsModal").hidden) {
        e.preventDefault();
        tapOneBead();
      } else if (e.code === "Escape") {
        ["beadsModal", "chantModal", "incenseModal", "lanternModal", "fortuneModal", "companionModal", "levelModal", "guideModal"].forEach((id) => {
          el(id).hidden = true;
        });
        world?.resetPlayerPose();
        hideRitualStatus();
      }
    });
  }

  function triggerActiveHotspot() {
    if (!world) return;
    const h = world.activeHotspot;
    if (!h || h.id === "gate") {
      // Nhân vật tự bước qua Cổng Tam Quan vào Sân Chùa (z = 16.5)
      showRitualStatus("🚶 Đang bước qua Cổng Tam Quan vào Sân Chùa Vô Lượng...");
      world.walkTo(0, 16.5, () => {
        hideRitualStatus();
        handleEnterTempleGrounds();
      });
      return;
    }

    if (h.id === "incense") performRitual("incense");
    else if (h.id === "mainhall_altar") performRitual("bow");
    else if (h.id === "wooden_fish") performRitual("chant");
    else if (h.id === "beads_mat") performRitual("beads");
    else if (h.id === "bell_tower") performRitual("bell");
    else if (h.id === "fortune_tower") performRitual("fortune");
    else if (h.id === "lotus_pond") performRitual("lantern");
    else if (h.id === "bodhi_tree") performRitual("sweep");
  }

  // Khởi chạy toàn bộ ứng dụng
  window.addEventListener("DOMContentLoaded", () => {
    initEntryModal();
    initSutraModal();
    initIncenseModal();
    renderWishes();
    renderChat();
    renderQuests();
    updateHUD();
    bindUIEvents();

    world = new window.TempleWorld3D(el("stage3d"), {
      onEnterTemple: () => handleEnterTempleGrounds(),
      onZoneChange: (zone) => handleZoneChange(zone),
      onHotspotChange: (hotspot) => handleHotspotChange(hotspot),
      onBowComplete: (bowIdx, finished) => {
        if (!finished) {
          showRitualStatus(`🙇 Đang thành tâm Lạy Phật trước bàn thờ Tam Thế (Lạy thứ ${bowIdx + 1}/3 - Dập đầu)...`);
        } else {
          advanceQuest("bow", 3);
          addMerit(2, "🙇 Thành tâm đảnh lễ Tam Bảo (3 lạy)");
          addChatMessage("Hệ thống", `🙇 ${state.character.name} vừa thành tâm đảnh lễ 3 lạy trước bàn thờ Phật Tam Thế.`, true);
          hideRitualStatus();
        }
      }
    });

    // Vòng lặp vẽ Minimap
    setInterval(drawMinimap, 120);
  });
})();

