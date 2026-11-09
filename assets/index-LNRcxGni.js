const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BsBtlyct.js","assets/three-DFCmejtz.js","assets/index-D7QeuxK9.css"])))=>i.map(i=>d[i]);
(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(n){if(n.ep)return;n.ep=!0;const r=t(n);fetch(n.href,r)}})();const X="modulepreload",J=function(e){return"/"+e},V={},Q=function(o,t,a){let n=Promise.resolve();if(t&&t.length>0){let s=function(m){return Promise.all(m.map(g=>Promise.resolve(g).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),y=l?.nonce||l?.getAttribute("nonce");n=s(t.map(m=>{if(m=J(m),m in V)return;V[m]=!0;const g=m.endsWith(".css"),p=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${m}"]${p}`))return;const f=document.createElement("link");if(f.rel=g?"stylesheet":X,g||(f.as="script"),f.crossOrigin="",f.href=m,y&&f.setAttribute("nonce",y),document.head.appendChild(f),g)return new Promise((d,c)=>{f.addEventListener("load",d),f.addEventListener("error",()=>c(new Error(`Unable to preload CSS for ${m}`)))})}))}function r(s){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=s,window.dispatchEvent(l),!l.defaultPrevented)throw s}return n.then(s=>{for(const l of s||[])l.status==="rejected"&&r(l.reason);return o().catch(r)})},ee={},F={},te={},ne=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");function H(e){const o=new Map,t=[];for(const[a,n]of Object.entries(e))if(n&&(o.set(a,n),/\{\d\}/.test(a))){const r=a.match(/\{\d\}/g),s=new RegExp(`^${a.split(/(\{\d\})/).map(l=>/^\{\d\}$/.test(l)?"(.*?)":ne(l)).join("")}$`,"s");t.push({re:s,out:n.replace(/\{(\d)\}/g,(l,y)=>`{${r.indexOf(`{${y}}`)}}`)})}return t.sort((a,n)=>n.re.source.length-a.re.source.length),{exact:o,patterns:t}}function K(e){const o=ee[e];return!o||F[e]?Promise.resolve():te[e]??=o().then(t=>{F[e]=H(t.default)}).catch(()=>{F[e]=H({})})}function ve(e,o){const t=F[e];if(!t||!/\p{L}/u.test(o))return o;const a=t.exact.get(o);if(a!==void 0)return a;for(const n of t.patterns){const r=o.match(n.re);if(r)return n.out.replace(/\{(\d)\}/g,(s,l)=>r[Number(l)+1]??"")}return o}function oe(e,o=.45){
  let ctx=null,timer=0,bowlTimer=0,playing=!1,vol=o,stepIdx=0;
  let audioEl=null,blobUrl=null;
  let mode=localStorage.getItem("chua.bgmMode")||"auto";
  let customName=localStorage.getItem("chua.bgmName")||"";
  let customUrl=localStorage.getItem("chua.bgmUrl")||"";
  let hasRepoBgm=!1;

  const TRACKS=[
    {id:"custom_file",label:"📂 Nhạc từ máy của bạn",sub:"Chọn file .mp3 / .m4a / .wav / .ogg"},
    {id:"repo_bgm",label:"🏯 Nhạc mặc định của Chùa (/bgm.mp3)",sub:"File bgm.mp3 trong thư mục web"},
    {id:"synth_guqin",label:"🎶 Cổ Cầm & Chuông Xoay Tịnh Tâm",sub:"Giai điệu ngũ cung thư thái"},
    {id:"synth_amitabha",label:"🙏 Giai Điệu Niệm Phật A Di Đà",sub:"Đàn tranh & chuông chùa êm dịu"},
    {id:"synth_flute",label:"🎋 Sáo Trúc & Suối Thiền Lâm",sub:"Tiếng sáo trúc thanh tịnh"},
    {id:"synth_bell",label:"🔔 Chuông Chùa & Mõ Đêm",sub:"Đại hồng chung & nhịp mõ tịnh tâm"}
  ];

  function openDB(){
    return new Promise((res,rej)=>{
      const req=indexedDB.open("chua_custom_bgm_v1",1);
      req.onupgradeneeded=()=>req.result.createObjectStore("files");
      req.onsuccess=()=>res(req.result);
      req.onerror=()=>rej(req.error);
    });
  }
  async function saveBlobToDB(file){
    try{
      const db=await openDB();
      await new Promise((res,rej)=>{
        const tx=db.transaction("files","readwrite");
        tx.objectStore("files").put({blob:file,name:file.name,at:Date.now()},"user_bgm");
        tx.oncomplete=res;tx.onerror=rej;
      });
    }catch(err){console.warn("Save BGM failed",err)}
  }
  async function loadBlobFromDB(){
    try{
      const db=await openDB();
      return await new Promise((res,rej)=>{
        const tx=db.transaction("files","readonly");
        const req=tx.objectStore("files").get("user_bgm");
        req.onsuccess=()=>res(req.result||null);
        req.onerror=()=>rej(req.error);
      });
    }catch{return null}
  }

  function ensureAudioEl(){
    if(!audioEl){
      audioEl=new Audio();
      audioEl.loop=!0;
      audioEl.preload="auto";
      audioEl.volume=Math.max(0,Math.min(1,vol*1.5));
    }
    return audioEl;
  }

  function stopSynth(){
    clearTimeout(timer);
    clearTimeout(bowlTimer);
  }
  function stopAudioEl(){
    if(audioEl&&!audioEl.paused){
      try{audioEl.pause()}catch{}
    }
  }

  function playNote(freq,dur,type="sine",gainMul=0.16,attack=0.06){
    if(!playing)return;
    try{
      ctx??=new(window.AudioContext||window.webkitAudioContext);
      if(ctx.state==="suspended")ctx.resume();
      const now=ctx.currentTime;
      const osc=ctx.createOscillator(),osc2=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
      osc.type=type;
      osc2.type="sine";
      osc.frequency.setValueAtTime(freq,now);
      osc2.frequency.setValueAtTime(freq*2,now);
      flt.type="lowpass";
      flt.frequency.setValueAtTime(1600,now);
      const peak=Math.max(0.001,Math.min(0.65,vol*gainMul));
      g.gain.setValueAtTime(0.0001,now);
      g.gain.linearRampToValueAtTime(peak,now+attack);
      g.gain.exponentialRampToValueAtTime(0.0001,now+dur);
      const g2=ctx.createGain();
      g2.gain.setValueAtTime(0.22,now);
      osc.connect(flt);
      osc2.connect(g2);g2.connect(flt);
      flt.connect(g);
      g.connect(ctx.destination);
      osc.start(now);osc2.start(now);
      osc.stop(now+dur+0.05);osc2.stop(now+dur+0.05);
    }catch{}
  }

  const MELODIES={
    synth_guqin:[261.63,293.66,329.63,392.00,440.00,392.00,329.63,293.66, 329.63,392.00,440.00,523.25,440.00,392.00,329.63,261.63],
    synth_amitabha:[329.63,329.63,293.66,261.63, 293.66,329.63,392.00,329.63, 440.00,440.00,392.00,329.63, 293.66,261.63,293.66,261.63],
    synth_flute:[392.00,440.00,523.25,587.33,659.25,587.33,523.25,440.00, 392.00,329.63,392.00,440.00,392.00,329.63,293.66,261.63],
    synth_bell:[130.81,196.00,261.63,196.00,164.81,220.00,130.81,196.00]
  };

  function tickSynth(){
    if(!playing||!mode.startsWith("synth_"))return;
    const seq=MELODIES[mode]||MELODIES.synth_guqin;
    const freq=seq[stepIdx%seq.length];
    stepIdx++;
    if(mode==="synth_guqin"){
      playNote(freq,3.4,"triangle",0.22,0.03);
      if(stepIdx%4===1)playNote(freq*0.5,5.5,"sine",0.15,0.4);
      timer=window.setTimeout(tickSynth,950);
    }else if(mode==="synth_amitabha"){
      playNote(freq,2.6,"triangle",0.24,0.04);
      if(stepIdx%4===1)playNote(196.00,4.8,"sine",0.14,0.35);
      timer=window.setTimeout(tickSynth,780);
    }else if(mode==="synth_flute"){
      playNote(freq,2.9,"sine",0.24,0.18);
      if(stepIdx%3===0)playNote(freq*0.5,4.2,"sine",0.11,0.5);
      timer=window.setTimeout(tickSynth,880);
    }else{
      playNote(freq,5.2,"sine",0.28,0.02);
      playNote(freq*2.756,2.4,"sine",0.08,0.01);
      timer=window.setTimeout(tickSynth,2200);
    }
  }

  function applyPlayback(){
    stopSynth();
    if(!playing){
      stopAudioEl();
      updateUI();
      return;
    }
    if(mode==="custom_file"||mode==="custom_url"||mode==="repo_bgm"){
      const el=ensureAudioEl();
      let targetSrc="";
      if(mode==="custom_file"&&blobUrl)targetSrc=blobUrl;
      else if(mode==="custom_url"&&customUrl)targetSrc=customUrl;
      else if(mode==="repo_bgm")targetSrc="/bgm.mp3";
      if(targetSrc){
        if(el.src!==targetSrc&&!el.src.endsWith(targetSrc)){
          el.src=targetSrc;
        }
        el.volume=Math.max(0,Math.min(1,vol*1.5));
        el.play().then(()=>updateUI()).catch(()=>{
          updateUI();
        });
        return;
      }
      // Fallback to synth_guqin if custom file/repo_bgm is not ready yet
      mode="synth_guqin";
    }
    stopAudioEl();
    tickSynth();
    updateUI();
  }

  // Unlock audio on any user interaction
  const unlockEvents=["pointerdown","keydown","touchend"];
  function onUserGesture(){
    if(ctx&&ctx.state==="suspended")ctx.resume().catch(()=>{});
    if(playing&&(mode==="custom_file"||mode==="custom_url"||mode==="repo_bgm")&&audioEl&&audioEl.paused){
      audioEl.play().then(()=>updateUI()).catch(()=>{});
    }
  }
  for(const ev of unlockEvents)window.addEventListener(ev,onUserGesture,{passive:!0,capture:!0});

  // Initialize saved custom file or check /bgm.mp3
  (async()=>{
    const saved=await loadBlobFromDB();
    if(saved&&saved.blob){
      blobUrl=URL.createObjectURL(saved.blob);
      customName=saved.name||customName||"Nhạc của bạn";
    }
    try{
      const r=await fetch("/bgm.mp3",{method:"HEAD"});
      const ct=r.headers.get("content-type")||"";
      if(r.ok&&(ct.includes("audio")||ct.includes("octet-stream"))){
        hasRepoBgm=!0;
      }
    }catch{}
    if(mode==="auto"){
      if(blobUrl)mode="custom_file";
      else if(customUrl)mode="custom_url";
      else if(hasRepoBgm)mode="repo_bgm";
      else mode="synth_guqin";
    }else if(mode==="custom_file"&&!blobUrl){
      mode=hasRepoBgm?"repo_bgm":"synth_guqin";
    }
    if(playing)applyPlayback();
    else updateUI();
  })();

  function getActiveLabel(){
    if(mode==="custom_file")return"📂 "+(customName||"Nhạc từ máy của bạn");
    if(mode==="custom_url")return"🔗 "+(customName||"Nhạc từ link MP3");
    if(mode==="repo_bgm")return"🏯 Nhạc Chùa (/bgm.mp3)";
    const found=TRACKS.find(t=>t.id===mode);
    return found?found.label:"🎶 Cổ Cầm & Chuông Xoay";
  }

  let fabEl=null,modalBackdrop=null,statusTextEl=null,trackBtns=new Map(),volInputEl=null,toggleBtnEl=null;

  function updateUI(){
    const lbl=getActiveLabel();
    if(fabEl){
      fabEl.classList.toggle("is-paused",!playing);
      const span=fabEl.querySelector(".chua-bgm-label");
      if(span)span.textContent=playing?lbl:"🔇 Nhạc nền (Đang tắt)";
    }
    if(statusTextEl){
      statusTextEl.textContent=(playing?"Đang phát: ":"Đang tạm dừng: ")+lbl;
    }
    if(toggleBtnEl){
      toggleBtnEl.textContent=playing?"⏸ Tạm dừng":"▶ Phát nhạc";
    }
    for(const[id,btn]of trackBtns.entries()){
      btn.classList.toggle("active",id===mode);
      if(id==="custom_file"){
        const sub=btn.querySelector("small");
        if(sub)sub.textContent=customName?("Đang lưu: "+customName):"Chưa chọn file (bấm nút phía trên)";
      }
    }
  }

  function ensureUI(){
    if(fabEl||typeof document==="undefined")return;
    fabEl=document.createElement("button");
    fabEl.type="button";
    fabEl.className="chua-bgm-fab";
    fabEl.title="Chọn nhạc nền hoặc tải nhạc MP3 của bạn";
    fabEl.innerHTML='<span>🎵</span><span class="chua-bgm-label">Nhạc của mình</span>';
    fabEl.addEventListener("click",()=>openModal());
    document.body.appendChild(fabEl);

    modalBackdrop=document.createElement("div");
    modalBackdrop.className="chua-bgm-modal-backdrop";
    modalBackdrop.hidden=!0;
    modalBackdrop.innerHTML=`
      <div class="chua-bgm-modal" role="dialog" aria-label="Chọn nhạc nền Long Sơn Tự">
        <div class="chua-bgm-head">
          <h3>🎵 Nhạc Nền Long Sơn Tự</h3>
          <button type="button" class="chua-bgm-close" aria-label="Đóng">✕</button>
        </div>
        <div class="chua-bgm-status">
          <span class="chua-bgm-status-txt">Đang phát...</span>
          <button type="button" class="chua-bgm-toggle" style="padding:5px 11px;border-radius:8px;border:1px solid rgba(255,214,138,0.45);background:rgba(255,198,92,0.18);color:#ffe8a8;font-weight:700;cursor:pointer;white-space:nowrap">⏸ Tạm dừng</button>
        </div>
        <label class="chua-bgm-upload-btn">
          <span>📂 Chọn file nhạc từ máy (.mp3, .m4a, .wav, .ogg)</span>
          <input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.flac" hidden>
        </label>
        <div class="chua-bgm-url-row">
          <input type="url" placeholder="Hoặc dán link nhạc .mp3 trực tiếp..." aria-label="Link nhạc MP3">
          <button type="button">Phát link</button>
        </div>
        <div class="chua-bgm-list"></div>
        <div class="chua-bgm-vol">
          <span>🔊 Âm lượng nhạc</span>
          <input type="range" min="0" max="100" value="${Math.round(Math.min(100,vol*200))}">
        </div>
        <p class="chua-bgm-hint">
          💡 <b>Mẹo:</b> Nhạc bạn chọn từ máy sẽ được <b>lưu tự động trên trình duyệt</b> cho những lần vào chùa sau. Nếu muốn đặt bài nhạc cố định cho tất cả mọi người khi truy cập web trên Vercel, bạn chỉ cần bỏ file nhạc tên <code>bgm.mp3</code> vào thư mục gốc của dự án!
        </p>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    statusTextEl=modalBackdrop.querySelector(".chua-bgm-status-txt");
    toggleBtnEl=modalBackdrop.querySelector(".chua-bgm-toggle");
    volInputEl=modalBackdrop.querySelector('.chua-bgm-vol input[type="range"]');
    const closeBtn=modalBackdrop.querySelector(".chua-bgm-close");
    const fileInput=modalBackdrop.querySelector('input[type="file"]');
    const urlInput=modalBackdrop.querySelector('.chua-bgm-url-row input');
    const urlBtn=modalBackdrop.querySelector('.chua-bgm-url-row button');
    const listEl=modalBackdrop.querySelector(".chua-bgm-list");

    if(customUrl)urlInput.value=customUrl;

    for(const tr of TRACKS){
      const item=document.createElement("button");
      item.type="button";
      item.className="chua-bgm-item";
      item.innerHTML=`<div><div>${tr.label}</div><small style="color:#a9957b;font-weight:400;font-size:12px">${tr.sub}</small></div><span>▶</span>`;
      item.addEventListener("click",()=>{
        if(tr.id==="custom_file"&&!blobUrl){
          fileInput.click();
          return;
        }
        mode=tr.id;
        localStorage.setItem("chua.bgmMode",mode);
        enableMusicAndPlay();
      });
      trackBtns.set(tr.id,item);
      listEl.appendChild(item);
    }

    closeBtn.addEventListener("click",()=>{modalBackdrop.hidden=!0});
    modalBackdrop.addEventListener("click",ev=>{if(ev.target===modalBackdrop)modalBackdrop.hidden=!0});

    toggleBtnEl.addEventListener("click",()=>{
      const musicBtn=document.getElementById("music");
      if(musicBtn)musicBtn.click();
      else{
        playing=!playing;
        applyPlayback();
      }
    });

    fileInput.addEventListener("change",async()=>{
      const file=fileInput.files?.[0];
      if(!file)return;
      if(blobUrl)URL.revokeObjectURL(blobUrl);
      blobUrl=URL.createObjectURL(file);
      customName=file.name;
      mode="custom_file";
      localStorage.setItem("chua.bgmMode","custom_file");
      localStorage.setItem("chua.bgmName",customName);
      await saveBlobToDB(file);
      enableMusicAndPlay();
    });

    urlBtn.addEventListener("click",()=>{
      const val=urlInput.value.trim();
      if(!val)return;
      customUrl=val;
      customName=val.split("/").pop()?.split("?")[0]||"Link MP3";
      mode="custom_url";
      localStorage.setItem("chua.bgmMode","custom_url");
      localStorage.setItem("chua.bgmUrl",customUrl);
      localStorage.setItem("chua.bgmName",customName);
      enableMusicAndPlay();
    });

    volInputEl.addEventListener("input",()=>{
      vol=Number(volInputEl.value)/200;
      if(audioEl)audioEl.volume=Math.max(0,Math.min(1,vol*1.5));
    });

    updateUI();
  }

  function enableMusicAndPlay(){
    localStorage.setItem("chua.music","1");
    localStorage.setItem("chua.muted","0");
    const musicBtn=document.getElementById("music");
    if(musicBtn&&musicBtn.hasAttribute("data-off")){
      musicBtn.click();
    }
    playing=!0;
    applyPlayback();
  }

  function openModal(){
    ensureUI();
    modalBackdrop.hidden=!1;
    updateUI();
  }

  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ensureUI);
    else setTimeout(ensureUI,50);
  }

  const api={
    play(){
      playing=!0;
      applyPlayback();
    },
    setVolume(c){
      vol=Math.max(0,Math.min(1,c));
      if(audioEl)audioEl.volume=Math.max(0,Math.min(1,vol*1.5));
      if(volInputEl)volInputEl.value=String(Math.round(Math.min(100,vol*200)));
    },
    stop(){
      playing=!1;
      applyPlayback();
    },
    destroy(){
      playing=!1;
      stopSynth();
      stopAudioEl();
    },
    openModal
  };
  window.__chuaBGM=api;
  return api;
}const O={name:{vi:"Long Sơn Tự"},tagline:{vi:"Đi chùa online cùng mọi người: thắp hương, thỉnh chuông, lạy Phật, lần tràng hạt"},controls:[{key:{en:"WASD / arrows",vi:"WASD / mũi tên"},action:{en:"Walk (hold Shift to run)",vi:"Đi lại (giữ Shift để chạy)"}},{key:{en:"Click ground",vi:"Bấm xuống đất"},action:{en:"Walk to that spot",vi:"Đi tới chỗ đó"}},{key:{en:"Drag / scroll",vi:"Kéo / cuộn"},action:{en:"Look around, zoom",vi:"Xoay nhìn, zoom"}},{key:{en:"E",vi:"E"},action:{en:"Use the nearby spot (incense, bell, fortune...)",vi:"Dùng điểm gần đó (hương, chuông, xăm...)"}},{key:{en:"Enter / Space / B / T",vi:"Enter / Space / B / T"},action:{en:"Chat / join palms / bow / prayer beads",vi:"Chat / chắp tay / lạy Phật / tràng hạt"}},{key:{en:"- / +",vi:"- / +"},action:{en:"Zoom out / zoom in",vi:"Zoom xa / zoom gần"}},{key:{en:"Joystick / tap",vi:"Joystick / chạm"},action:{en:"Phone: left half to walk, right half to look, tap ground to go",vi:"Điện thoại: nửa trái để đi, nửa phải xoay nhìn, chạm đất để đi"}}],sections:[{h2:{en:"How to play Zen Temple",vi:"Cách chơi Long Sơn Tự"},body:[{en:"Pick a male or female novice, a robe color and a dharma name, then step in under the three-arched tam quan gate. The temple is a 3D space shared with everyone online: you see other players walking around, a wandering master, two sweeping novices, a novice who rings the bell and a visitor who comes to pray. Walk with WASD or the arrow keys, hold Shift to run, or click the ground to walk there. Drag to look around and scroll to zoom the camera between 4 and 24 meters; the round minimap in the corner shows where everyone is.",vi:"Bạn chọn tiểu nam hay tiểu nữ, màu áo tràng và pháp danh rồi bước qua cổng tam quan ba lối vào sân. Chùa là không gian 3D dùng chung với mọi người đang online: bạn thấy người khác đi lại, sư thầy dạo quanh sân, hai tiểu quét lá, một tiểu đánh chuông và một phật tử đi lễ. Đi bằng WASD hoặc mũi tên, giữ Shift để chạy, hoặc bấm xuống đất để đi tới đó. Kéo chuột để xoay nhìn, cuộn để zoom camera từ 4 đến 24 mét; bản đồ nhỏ hình tròn ở góc cho biết mọi người đang ở đâu."},{en:"A wide stone path runs from the gate past the big lotus pond with its arched bridge and koi, between the tall white Quan Am statue on the left and the 9-tier pagoda on the right, up to the main hall. Walk up to a spot and a golden prompt appears: press E or tap it. The giant bronze burner in front of the steps lights incense, the two-story bell tower rings the bronze bell for everyone nearby, the bamboo tube by the drum tower draws a fortune, the pond releases a lantern with your wish, and the broom sweeps fallen leaves. The wide steps lead into the main hall with its three-roof facade, where you bow to the Buddha at the Tam The altar and strike the wooden fish.",vi:"Đường lát đá rộng chạy từ cổng qua hồ sen lớn có cầu đá cong và cá koi, giữa tượng Quan Âm trắng cao bên trái và tháp 9 tầng bên phải, dẫn thẳng lên Chánh Điện. Đi tới gần một điểm là có nút vàng nổi lên: bấm E hoặc chạm vào. Lư hương đồng rất lớn trước thềm để thắp hương, gác chuông hai tầng để thỉnh chuông cho cả sân cùng nghe, ống tre cạnh gác trống để xin xăm, hồ sen để thả đèn hoa đăng kèm điều ước, chổi để quét lá rụng. Bậc thềm rộng dẫn vào Chánh Điện ba tầng mái, nơi bạn lạy Phật trước bàn thờ Tam Thế và gõ mõ."},{en:"Press Enter to open chat and talk with people on the same map. Yellow lines are system messages: who entered, who rang the bell, who leveled up. If the server is unreachable you can still walk around and earn merit locally, and the game reconnects on its own.",vi:"Bấm Enter để mở chat và nói chuyện với người cùng bản đồ. Dòng màu vàng là tin hệ thống: ai vừa vào chùa, ai thỉnh chuông, ai lên cấp. Nếu không nối được máy chủ, bạn vẫn đi lại và tích công đức trên máy, game tự kết nối lại sau."}]},{h2:{en:"Merit and practice levels in Zen Temple",vi:"Công đức và cấp tu trong Long Sơn Tự"},body:[{en:"Every good deed earns merit: incense gives 5 (once a minute), ringing the bell 3 (every 30 seconds), bowing 2, joining palms 1, each swept leaf 1 (up to 30 a day), a lantern 3 (up to 15 a day), and every 10 strikes of the wooden fish 1. A full round of 108 prayer beads gives 10. Action merit is capped at 150 a day; the daily check-in (10 merit plus 2 per streak day, up to 30) and the quest bonus are on top.",vi:"Mỗi việc lành đều có công đức: thắp hương 5 (mỗi phút một lần), thỉnh chuông 3 (mỗi 30 giây), lạy Phật 2, chắp tay 1, mỗi lá quét được 1 (tối đa 30 lá một ngày), thả đèn 3 (tối đa 15 đèn), mỗi 10 tiếng mõ được 1. Lần trọn một vòng 108 hạt được 10. Công đức từ hành động tối đa 150 mỗi ngày; điểm danh (10 cộng 2 cho mỗi ngày chuỗi, tối đa 30) và thưởng nhiệm vụ tính riêng."},{en:"Total merit sets your practice level: Beginner Heart from 0, Diligence at 100, Calm Mind at 500, Compassion at 1,500, Wisdom at 4,000 and Serenity at 10,000. Your level shows next to your name above your head and on the merit board, which lists the top 10 players and your own rank. Your best merit total is also saved as the game record on this device.",vi:"Tổng công đức quyết định cấp tu: Sơ tâm từ 0, Tinh tấn ở 100, Định tâm 500, Từ bi 1.500, Trí huệ 4.000 và An lạc 10.000. Cấp hiện cạnh pháp danh trên đầu nhân vật và trong bảng công đức, nơi liệt kê top 10 cùng hạng của bạn. Tổng công đức cao nhất cũng được lưu làm kỷ lục trên máy này."}]},{h2:{en:"Recite the Buddha name online with 108 prayer beads",vi:"Niệm Phật online với tràng hạt 108 hạt"},body:[{en:'Press the Prayer beads button (or T) to sit on a cushion and open the 108-bead ring. Each bead you tap (or each press of Space) is one recitation, usually "Namo Amitabha Buddha". Every bead earns 1 merit and finishing all 108 adds 20 more. Recite alone or sit with everyone in the main hall and the worship yard.',vi:"Niệm Phật online trong Long Sơn Tự rất đơn giản: bấm nút Tràng hạt (hoặc phím T) để ngồi xuống bồ đoàn và mở vòng 108 hạt. Mỗi lần chạm một hạt (hoặc bấm phím Space) là một câu niệm, thường là “Nam mô A Di Đà Phật”. Mỗi hạt được 1 công đức, lần trọn 108 hạt được thêm 20 công đức. Bạn có thể niệm Phật một mình hoặc ngồi cùng đại chúng trong Chánh Điện và ngoài sân lễ."},{en:"To chant online, open Chant: five recitations are counted line by line while you strike the wooden fish by hand or let it keep a 40 to 120 beat. During the morning (5:00 to 5:20), noon (12:00 to 12:30) and evening (20:00 to 20:30) services, Vietnam time, practice merit is doubled; on the 1st and 15th of the lunar month it is multiplied by 1.5.",vi:"Muốn tụng kinh online, chọn Tụng kinh: có 5 bài niệm và tụng, đếm từng câu, gõ mõ bằng tay hoặc để mõ tự gõ theo nhịp 40 tới 120. Vào thời khoá sáng (5:00 tới 5:20), trưa (12:00 tới 12:30) và tối (20:00 tới 20:30) giờ Việt Nam, công đức tu tập được nhân đôi; ngày Mùng 1 và Rằm được nhân 1,5."},{en:"Daily quests include bowing 27 times, finishing one round of beads, striking the wooden fish 108 times, meditating 5 minutes, chanting one full recitation, lighting incense and ringing the bell; weekly quests are bigger. Completing them gives Sen, merit and offerings.",vi:"Mỗi ngày có các nhiệm vụ như lạy 27 lạy, lần trọn một chuỗi, gõ mõ 108 tiếng, thiền 5 phút, tụng trọn một bài, thắp một nén hương, thỉnh chuông; mỗi tuần có thêm nhiệm vụ lớn hơn. Hoàn thành được nhận Sen, công đức và lễ vật."}]},{h2:{en:"Companions, outfits and fortune sticks",vi:"Linh thú, trang phục và xin xăm"},body:[{en:"Each new level unlocks a companion that follows you around the temple: a temple cat at Diligence, a sparrow at Calm Mind, a rabbit at Compassion, a turtle at Wisdom and a crane at Serenity. Pick one in the Outfit panel, where you can also change your name, body, robe color, sash color and head wear. The conical hat opens at Calm Mind and the halo at Wisdom.",vi:"Mỗi cấp mới mở một linh thú đi theo bạn khắp chùa: mèo chùa ở Tinh tấn, chim sẻ ở Định tâm, thỏ ở Từ bi, rùa ở Trí huệ và hạc ở An lạc. Chọn trong bảng Trang phục, nơi bạn cũng đổi được pháp danh, dáng, màu áo, màu đai và đồ đội đầu. Nón lá mở ở Định tâm, hào quang mở ở Trí huệ."},{en:"The fortune tube by the drum tower gives one of 60 original fortune sticks a day, the same stick if you ask again. Each card shows the number, a rank (Supreme, Good, Fair or a gentle reminder), a four-line poem and short readings for overall, work, love and health. They are written to be kind and are just for fun.",vi:"Ống xăm cạnh gác trống cho mỗi ngày một trong 60 quẻ tự viết, xin lại trong ngày vẫn ra quẻ đó. Thẻ quẻ có số, bậc (Thượng thượng, Thượng, Trung hoặc Hạ), bài thơ bốn câu và lời giải ngắn cho tổng quát, công việc, tình cảm, sức khỏe. Lời quẻ viết nhẹ nhàng, chỉ để vui."}]},{h2:{en:"Can you play Zen Temple on a phone?",vi:"Long Sơn Tự chơi trên điện thoại được không?"},body:[{en:"Yes. On touch screens a virtual joystick appears wherever you press on the left half of the screen, the right half turns the camera, two fingers zoom, and a tap on the ground walks there. The spot prompt becomes a large tap button, the action bar sits at the bottom, the minimap moves under the top right buttons (tap it to hide) and every panel closes with the X button. The 3D scene lowers detail and turns off shadows on phones to keep the frame rate smooth even with the large courtyard, and the interface is sized for 360 pixel wide screens.",vi:"Được. Trên màn cảm ứng, joystick ảo hiện ở chỗ bạn đặt tay trên nửa trái màn hình, nửa phải để xoay camera, hai ngón để zoom, chạm xuống đất để đi tới. Nút gợi ý tại điểm tương tác thành nút chạm lớn, thanh hành động nằm dưới cùng, bản đồ nhỏ nằm dưới hàng nút góc trên phải (chạm để ẩn) và panel nào cũng đóng được bằng nút X. Cảnh 3D tự giảm chi tiết và tắt bóng trên điện thoại cho mượt dù sân chùa rất rộng, giao diện vừa với màn 360 pixel."}]}]},ie={playNow:{en:"Play now",vi:"Chơi ngay"},loading:{en:"Loading…",vi:"Đang tải…"},tryAgain:{en:"Try again",vi:"Thử lại"},loadError:{en:"Couldn't load the game. Give it another try.",vi:"Không tải được game, bạn thử lại nha."},best:{en:"Best",vi:"Kỷ lục"},restart:{en:"Restart",vi:"Chơi lại từ đầu"},mute:{en:"Mute",vi:"Tắt tiếng"},unmute:{en:"Unmute",vi:"Bật tiếng"},musicOn:{en:"Turn music on",vi:"Bật nhạc nền"},musicOff:{en:"Turn music off",vi:"Tắt nhạc nền"},fullScreen:{en:"Full screen",vi:"Toàn màn hình"},exitFullScreen:{en:"Exit full screen",vi:"Thoát toàn màn hình"},controlsOf:{en:"{0} controls",vi:"Cách điều khiển {0}"},language:{en:"Language",vi:"Ngôn ngữ"}};function u(e,o,...t){const n=ie[o].vi;return t.length?n.replace(/\{(\d)\}/g,(r,s)=>String(t[Number(s)]??"")):n}const ae=e=>e==="vi"?"/":`/${e}/`,x=(e,o)=>o.vi,h=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),re={play:'<polygon points="7 4 20 12 7 20 7 4"/>',merit:'<path d="M12 3c2.4 2.9 3.5 5.8 3.5 8.6S14 17.4 12 19.3c-2-1.9-3.5-4.9-3.5-7.7S9.6 5.9 12 3z"/><path d="M4 11.5c3.3 0 6.2 1.6 7.6 3.9.5.9.8 2.4.4 3.9-3 0-5.8-1.5-7.2-3.9-.6-1-.9-2.4-.8-3.9z"/><path d="M20 11.5c-3.3 0-6.2 1.6-7.6 3.9-.5.9-.8 2.4-.4 3.9 3 0 5.8-1.5 7.2-3.9.6-1 .9-2.4.8-3.9z"/>',restart:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',sound:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',soundOff:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/>',full:'<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',exitFull:'<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>'},E=(e,o=18)=>`<svg width="${o}" height="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${re[e]}</svg>`,se="https://www.facebook.com/chuaonline.org/";function ce(e){const o=x(e,O.name),t=O.controls.map(n=>`<li><kbd>${h(x(e,n.key))}</kbd><span>${h(x(e,n.action))}</span></li>`).join(""),a=O.sections.map(n=>`<section class="card"><h2>${h(x(e,n.h2))}</h2>${n.body.map(r=>`<p>${h(x(e,r))}</p>`).join("")}</section>`).join("");return`
<header class="top">
  <a class="brand" href="${ae(e)}"><img src="/favicon.svg" width="34" height="34" alt=""><span>${h(o)}</span></a>
</header>
<main class="wrap">
  <h1>${h(o)}</h1>
  <p class="lead">${h(x(e,O.tagline))}</p>
  <div class="player" id="player">
    <div class="stageWrap">
      <div class="stage" id="stage" tabindex="0" role="application" aria-label="${h(o)}"></div>
      <div class="cover" id="cover">
        <div class="coverImg"></div>
        <div class="coverBody">
          <img class="coverLogo" src="/favicon.svg" width="64" height="64" alt="">
          <p class="coverName">${h(o)}</p>
          <button type="button" class="playBtn" id="play">${E("play",20)}<span>${h(u(e,"playNow"))}</span></button>
          <p class="coverMsg" id="coverMsg" hidden></p>
        </div>
      </div>
    </div>
    <div class="bar">
      <span class="best" title="${h(u(e,"best"))}">${E("merit")}<span>${h(u(e,"best"))}</span><b id="best">-</b></span>
      <span class="tools">
        <button type="button" class="tool" id="restart" title="${h(u(e,"restart"))}" aria-label="${h(u(e,"restart"))}" hidden>${E("restart")}</button>
        <button type="button" class="tool" id="music" title="${h(u(e,"musicOff"))}" aria-label="${h(u(e,"musicOff"))}">${E("music")}</button>
        <button type="button" class="tool" id="mute" title="${h(u(e,"mute"))}" aria-label="${h(u(e,"mute"))}">${E("sound")}</button>
        <button type="button" class="tool" id="full" title="${h(u(e,"fullScreen"))}" aria-label="${h(u(e,"fullScreen"))}">${E("full")}</button>
      </span>
    </div>
  </div>
  <section class="card controls"><h2>${h(u(e,"controlsOf",o))}</h2><ul>${t}</ul></section>
  ${a}
</main>
<footer class="foot">
  <p>© 2026 ${h(o)} · chuaonline.org · <a href="${se}" target="_blank" rel="noopener">Fanpage Facebook</a></p>
</footer>`}const U="chua.installLater";let L=null;const le=e=>{try{return localStorage.getItem(e)}catch{return null}},he=(e,o)=>{try{localStorage.setItem(e,o)}catch{}};typeof window<"u"&&(window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),L=e}),window.addEventListener("appinstalled",()=>{L=null,Y(3650)}));const ue=()=>matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches||navigator.standalone===!0,de=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1,ye=()=>!ue()&&Date.now()>Number(le(U)||0)&&(!!L||de()),be=()=>!!L;async function we(){const e=L;if(!e)return!1;L=null,await e.prompt();const{outcome:o}=await e.userChoice;return o==="accepted"&&Y(3650),o==="accepted"}function Y(e){he(U,String(Date.now()+e*864e5))}function me(){"serviceWorker"in navigator&&window.addEventListener("load",()=>{Promise.resolve().catch(()=>{})})}const I="chua.best",W="chua.muted",R="chua.music",B=e=>{try{return localStorage.getItem(e)}catch{return null}},C=(e,o)=>{try{localStorage.setItem(e,o)}catch{}},ge=()=>"vi";me();async function pe(){const e=ge(),o=document.getElementById("app");o.querySelector("#player")||(await K(e),o.innerHTML=ce(e));const t=i=>document.getElementById(i),a=t("player"),n=t("stage"),r=t("cover"),s=t("play"),l=t("coverMsg"),y=t("best"),m=t("restart"),g=t("music"),p=t("mute"),f=t("full");let d=B(W)==="1",c=B(R)!=="0",$=.8,w=!1,k=null,S=oe("/bgm-v2.mp3",$*.45);const N=()=>{const i=Number(B(I));return B(I)!=null&&Number.isFinite(i)?i:null},G=i=>i.toLocaleString(document.documentElement.lang||"vi"),_=()=>{const i=N();y.textContent=i==null?"-":G(i)};_();function T(){const i=c?u(e,"musicOff"):u(e,"musicOn");g.title=i,g.setAttribute("aria-label",i),g.toggleAttribute("data-off",!c||d),g.setAttribute("aria-pressed",String(c));const v=d?u(e,"unmute"):u(e,"mute");p.title=v,p.setAttribute("aria-label",v),p.innerHTML=E(d?"soundOff":"sound"),p.toggleAttribute("data-off",d);const b=j(),q=b?u(e,"exitFullScreen"):u(e,"fullScreen");f.title=q,f.setAttribute("aria-label",q),f.innerHTML=E(b?"exitFull":"full")}function A(){w&&c&&!d?(S??=oe("/bgm-v2.mp3",$*.45)).play():S?.stop()}const Z={lang:e,best:()=>N(),finish(i){const v=N();if(!Number.isFinite(i))return{best:v??0,record:!1};const b=v==null||i>v,q=b&&(v!=null||i>0);return b&&C(I,String(i)),_(),{best:b?i:v,record:q}},variant(){},setAudio(i){d=!i.sound,c=i.music,$=i.volume,C(W,d?"1":"0"),C(R,c?"1":"0"),S?.setVolume($*.45),A(),T()},muted:()=>d};async function D(i){i&&(s.disabled=!0,s.querySelector("span").textContent=u(e,"loading"),l.hidden=!0);try{const[v]=await Promise.all([Q(()=>import("./index-BsBtlyct.js"),__vite__mapDeps([0,1,2])),K(e)]);if(k?.(),k=null,n.replaceChildren(),k=v.default(n,Z),w=!0,r.hidden=!0,m.hidden=!1,i&&A(),n.focus({preventScroll:!0}),i){const b=a.getBoundingClientRect();(b.top<0||b.bottom>innerHeight)&&a.scrollIntoView({block:"center",behavior:"smooth"})}}catch(v){console.error(v),s.disabled=!1,s.querySelector("span").textContent=u(e,"tryAgain"),l.textContent=u(e,"loadError"),l.hidden=!1}}document.body.classList.add("game-page"),fe(),D(!0),s.addEventListener("click",()=>void D(!0)),m.addEventListener("click",()=>{D(!1)});for(const i of[m,g,p,f])i.addEventListener("mousedown",v=>{w&&v.preventDefault()});g.addEventListener("click",()=>{c=!c,C(R,c?"1":"0"),A(),T(),n.focus({preventScroll:!0})}),p.addEventListener("click",()=>{d=!d,C(W,d?"1":"0"),A(),T(),n.focus({preventScroll:!0})});const M=document,j=()=>a.hasAttribute("data-fake")||(M.fullscreenElement??M.webkitFullscreenElement)===a,z=()=>{a.toggleAttribute("data-full",j()),T()};document.addEventListener("fullscreenchange",z),document.addEventListener("webkitfullscreenchange",z);function P(i){a.toggleAttribute("data-fake",i),a.toggleAttribute("data-full",i),document.documentElement.style.overflow=i?"hidden":"",T()}document.addEventListener("keydown",i=>{i.key==="Escape"&&a.hasAttribute("data-fake")&&P(!1)}),f.addEventListener("click",()=>{const i=a;a.hasAttribute("data-fake")?P(!1):document.fullscreenElement?document.exitFullscreen().catch(()=>{}):M.webkitFullscreenElement?M.webkitExitFullscreen?.():i.requestFullscreen?i.requestFullscreen().catch(()=>P(!0)):i.webkitRequestFullscreen?i.webkitRequestFullscreen():P(!0),n.focus({preventScroll:!0})}),addEventListener("pagehide",()=>{k?.(),k=null,S?.destroy()}),T()}function fe(){document.documentElement.classList.add("no-zoom"),document.querySelector("meta[name=viewport]")?.setAttribute("content","width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover");for(const e of["gesturestart","gesturechange","gestureend"])document.addEventListener(e,o=>o.preventDefault(),{passive:!1})}pe();export{de as a,Y as b,be as c,ue as i,we as p,ye as s,ve as t};
