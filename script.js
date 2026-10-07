/* =====================================================
   >>> YOUR PHOTOS, SONG AND VIDEO: CHANGE THEM HERE <<<
   Put your files next to index.html (photos go in a folder named "photos").
   Write each file name between the quotes. Wrong or missing names are fine:
   that box just stays as a tap-to-add box and shows the file name it expects.
   ===================================================== */
var MEDIA = {

  /* SONG: your music file. Leave "" to use the built-in melody. */
  song: "music.mp3",

  /* VIDEO (page 12): your video file. Leave "" to pick one by tapping. */
  video: "video.mp4",

  /* PHOTOS, page by page, in the order they appear on the page */
  photos: {
    1: ["teachersday.jpeg"],                                           /* Cover heart */
    2: ["young.jpeg", "parent.jpeg", "quote.jpeg"],     /* Her Story */
    4: ["pansit.jpeg", "css.jpg", "japethon2.jpeg"],     /* What we love */
    7: ["class.jpg", "css.jpg"],                        /* Our Class */
    8: ["mostofthetime.jpg", "pansit.jpeg"],                        /* Favorite Moments */
    9: ["meeting.jpeg", "wewant.jpg"]                         /* First Day vs Forever */
  },

  /* MEMORY LANE (page 11): 6 photos in each of the two moving rows */
  memory: {
    row1: ["anak.jpeg", "parent.jpeg", "kamay.jpeg", "familypic.jpeg", "familywithdog.jpeg", "daughter.jpeg"],
    row2: ["bthdy.jpeg", "marine.jpeg", "fatherson.jpeg", "flower.jpeg", "young.jpeg", "quote.jpeg"]
  }
};
/* script.js: the behavior of the page (used by index.html) */

/* =====================================================
   JAVASCRIPT = the behavior (what happens when you tap,
   swipe, press Play, etc.)
   Lines starting with // are comments: the computer ignores them.
   "var" creates a variable (a named box that stores something).
   "function" is a named group of steps we can run whenever we want.
   ===================================================== */


/* ---------- 1. PAGE TURNING ---------- */

// Get a list of all pages (every <section class="pg">) and remember which one we're on.
// "cur" = the current page number. It starts at 0 (the first page).
var pages = Array.prototype.slice.call(document.querySelectorAll(".pg")), cur = 0;

// Stack the pages so page 1 is on top, page 2 is under it, and so on.
pages.forEach(function(p, i){ p.style.zIndex = pages.length - i; });

// show(n): go to page number n.
function show(n){
  // Keep n between 0 and the last page (so we never go past the ends)
  cur = Math.max(0, Math.min(pages.length - 1, n));
  // Pages before the current one get the "gone" class (they flip away)
  pages.forEach(function(p, i){ p.classList.toggle("gone", i < cur); });
  // Restart the timer for the new page
  elapsed = 0;
}

// Keyboard: right arrow = next page, left arrow = previous page
document.addEventListener("keydown", function(e){
  if(e.key === "ArrowRight") show(cur + 1);
  if(e.key === "ArrowLeft") show(cur - 1);
});

// Swipe on a phone: remember where the finger started (sx),
// and when it lifts, compare to where it ended.
var sx = null, book = document.getElementById("book");
book.addEventListener("touchstart", function(e){ sx = e.touches[0].clientX; }, {passive:true});
book.addEventListener("touchend", function(e){
  if(sx === null) return;
  var dx = e.changedTouches[0].clientX - sx;           // how far the finger moved sideways
  if(Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); // swipe left = next, swipe right = back
  sx = null;
});


/* ---------- 2. ADDING PHOTOS ---------- */

// We make a hidden "choose file" input that only accepts images.
// "target" remembers which photo box you tapped.
var picker = document.createElement("input"), target = null;
picker.type = "file";
picker.accept = "image/*";

// (This first version is replaced by a newer one further below in section 4.
//  It's left here exactly as it was.)
picker.onchange = function(){
  var f = picker.files[0];            // the chosen file
  if(!f || !target) return;           // nothing chosen? stop
  var r = new FileReader();           // FileReader reads the file from your phone
  r.onload = function(){
    // Use the photo as the background of the box and mark it with "has"
    target.style.backgroundImage = "url(" + r.result + ")";
    target.classList.add("has");
  };
  r.readAsDataURL(f);
  picker.value = "";                  // reset so you can pick the same file again
};

// When you tap any photo box (class "ph") inside the book, open the file chooser.
book.addEventListener("click", function(e){
  var b = e.target.closest(".ph");
  if(b){ target = b; picker.click(); }
});


/* ---------- 3. MARKING THE ACTIVE PAGE ---------- */

// The animations only play on the page that has the class "active".
// Mark the first page active right away.
pages.forEach(function(p, i){ p.classList.toggle("active", i === cur); });

// Wrap show() so that after it changes the page, it also updates which page is "active".
var _show = show;                     // keep a copy of the old show()
show = function(n){
  _show(n);                           // do the original page turning
  pages.forEach(function(p, i){ p.classList.toggle("active", i === cur); });
};

// Give every big page title the "pop" class so it slides up when its page appears.
document.querySelectorAll(".script.abs").forEach(function(h){ h.classList.add("pop"); });


/* ---------- 4. MEMORY LANE (the two scrolling photo rows) ---------- */

// Captions under the photos
var caps = ["Day one", "Fun times", "Class trip", "Group hug", "Our favourite", "Smiles", "Together", "Forever"];

// buildRow(id, offset): fills one row with photo slots.
//   id     = which row ("row1" or "row2")
//   offset = where to start in the captions list (so the two rows look different)
function buildRow(id, offset){
  var row = document.getElementById(id), tilts = [-2, 2, -1, 1.5];   // tilt angles in degrees
  // We add the 6 photo slots TWICE (c = 0, then c = 1) so the sliding loop has no gap.
  for(var c = 0; c < 2; c++){
    for(var k = 0; k < 6; k++){
      var m = document.createElement("div");
      m.className = "mi";
      m.style.setProperty("--r", tilts[k % 4] + "deg");
      // data-m is a label. Both copies of the same slot share it so they get the same photo.
      m.innerHTML = '<div class="sq"><button class="ph" type="button" data-m="' + id + k + '">Add photo</button></div><i>' + caps[(k + offset) % caps.length] + '</i>';
      row.appendChild(m);
    }
  }
}
buildRow("row1", 0);
buildRow("row2", 3);

// Newer version of "when a photo is chosen".
// It also handles Memory Lane slots: when you add a photo to one copy,
// the other copy (same data-m) gets the same photo too.
var r2 = picker.onchange;             // (saved but not used; left as it was)
picker.onchange = function(){
  var f = picker.files[0];
  if(!f || !target) return;
  var key = target.dataset.m, rd = new FileReader();
  rd.onload = function(){
    // If the box has a data-m label, find every box with that label. Otherwise just use the tapped one.
    var list = key ? document.querySelectorAll('[data-m="' + key + '"]') : [target];
    Array.prototype.forEach.call(list, function(t){
      t.style.backgroundImage = "url(" + rd.result + ")";
      t.classList.add("has");
    });
  };
  rd.readAsDataURL(f);
  picker.value = "";
};


/* ---------- 5. VIDEO MESSAGE ---------- */

// Hidden file chooser that only accepts videos
var vp = document.createElement("input");
vp.type = "file";
vp.accept = "video/*";

// Tapping "Tap to add a video" opens the chooser
document.getElementById("vbtn").addEventListener("click", function(){ vp.click(); });

// When a video is chosen, show it in the frame with play controls
vp.onchange = function(){
  var f = vp.files[0];
  if(!f) return;
  var v = document.createElement("video");
  v.controls = true;                          // show play/pause bar
  v.playsInline = true;                       // play inside the page on iPhones
  v.src = URL.createObjectURL(f);             // temporary link to the chosen file
  // If the video can't play, show a message and reload the page when tapped
  v.onerror = function(){
    document.getElementById("vid").innerHTML = '<button class="vbtn" type="button" onclick="location.reload()">This video could not play here</button>';
  };
  var box = document.getElementById("vid");
  box.innerHTML = "";                         // remove the "Tap to add a video" button
  box.appendChild(v);                         // put the video in
};


/* ---------- 6. CONFETTI (final page) ---------- */

var cf = document.getElementById("conf"), cols = ["#f3d36b", "#f4a3a3", "#9fd0e6", "#fffaf0", "#d4a73a"];
// Make 28 little confetti pieces
for(var q = 0; q < 28; q++){
  var s = document.createElement("s");
  s.style.left = (q * 3.6 + Math.random() * 3) + "%";                  // spread across the page
  s.style.background = cols[q % cols.length];                          // pick a color in turn
  s.style.setProperty("--d", (3.5 + Math.random() * 3) + "s");         // random fall duration
  s.style.setProperty("--w", (Math.random() * 3) + "s");               // random wait before falling
  cf.appendChild(s);
}


/* ---------- 7. AUTO-PLAY (turns pages by itself like a film) ---------- */

// How long (in milliseconds) each page stays on screen. 1000 = 1 second.
// First number = page 1, second = page 2, and so on.
var DWELL = [7000, 10000, 11000, 8000, 12000, 12000, 7000, 8000, 8500, 13000, 11000, 12000, 9000, 9000, 14000];

// elapsed  = how long we've been on this page
// paused   = true if you pressed the space bar
// holding  = true while a finger is touching the book
// picking  = true while the file chooser is open
var elapsed = 0, paused = false, holding = false, picking = false, fill = document.getElementById("fill");

// typing(): true if you are currently editing some text
function typing(){
  var a = document.activeElement;
  return a && a.isContentEditable;
}

// This runs every 0.1 seconds (100 ms) and is the "clock" of the film.
setInterval(function(){
  var v = document.querySelector("#vid video");   // the video, if one was added
  // Pause the timer if: not started yet, paused, holding, choosing a file, typing, or a video is playing
  var hold = !started || paused || holding || picking || typing() || (v && !v.paused && !v.ended);
  if(!hold) elapsed += 100;
  var d = DWELL[cur] || 6000;                                  // time for this page (6 seconds if not listed)
  fill.style.width = Math.min(100, elapsed / d * 100) + "%";   // grow the progress bar
  // Time's up? Go to the next page (or back to the first page after the last one)
  if(elapsed >= d) show(cur === pages.length - 1 ? 0 : cur + 1);
}, 100);

// Holding a finger on the book pauses the film; lifting resumes it
book.addEventListener("touchstart", function(){ holding = true; }, {passive:true});
["touchend", "touchcancel"].forEach(function(t){
  book.addEventListener(t, function(){ holding = false; });
});

// Space bar = pause/resume, F = full screen (ignored while typing)
document.addEventListener("keydown", function(e){
  if(typing()) return;
  if(e.key === " "){ e.preventDefault(); paused = !paused; }
  if(e.key === "f" || e.key === "F") toggleFS();
});

// toggleFS(): enter or leave full screen
function toggleFS(){
  var d = document;
  if(d.fullscreenElement){ d.exitFullscreen(); }
  else if(d.documentElement.requestFullscreen){ d.documentElement.requestFullscreen(); }
}
// Double-tap / double-click the book = full screen
book.addEventListener("dblclick", toggleFS);

// While a file chooser is open, pause the film.
// When you come back to the page (window "focus"), resume after a short moment.
picker.addEventListener("click", function(){ picking = true; });
vp.addEventListener("click", function(){ picking = true; });
window.addEventListener("focus", function(){ setTimeout(function(){ picking = false; }, 800); });


/* ---------- 8. OPENING SCREEN + MUSIC ---------- */

// Browsers only allow sound after a tap, so the show starts on Play.
// started = has Play been pressed?   AC = audio engine   master = main volume knob
// userSong = the song you chose (if any)   sndOn = is sound on?
// tmr, step, nextT = used by the built-in music maker
var started = false, AC = null, master = null, userSong = null, sndOn = true, tmr = null, step = 0, nextT = 0;

// CH = 4 chords (each a list of notes). PAT = the order notes are played within a chord.
var CH = [[0, 4, 7, 12], [-3, 0, 4, 9], [-7, -3, 0, 5], [-5, -1, 2, 7]], PAT = [0, 1, 2, 3, 2, 1, 2, 3];

// fq(n): turns a note number into a sound frequency (pitch)
function fq(n){ return 261.63 * Math.pow(2, n / 12); }

// tone(): plays one soft note
//   f = pitch, t = start time, d = how long, g = loudness, type = wave shape, dl = echo effect
function tone(f, t, d, g, type, dl){
  var o = AC.createOscillator(), e = AC.createGain();
  o.type = type;
  o.frequency.value = f;
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(g, t + .03);          // quick fade in
  e.gain.exponentialRampToValueAtTime(.0001, t + d);   // slow fade out
  o.connect(e); e.connect(master); e.connect(dl);
  o.start(t); o.stop(t + d + .05);
}

// startSynth(): starts the built-in background music (a calm looping melody made by code, no music file needed)
function startSynth(){
  var AX = window.AudioContext || window.webkitAudioContext;
  if(!AX) return;                                      // browser can't play sound
  AC = new AX();
  master = AC.createGain();
  master.gain.value = 0;
  master.connect(AC.destination);
  // Echo effect
  var dl = AC.createDelay(); dl.delayTime.value = .38;
  var fb = AC.createGain(); fb.gain.value = .35;
  dl.connect(fb); fb.connect(dl); dl.connect(master);
  master.gain.linearRampToValueAtTime(.55, AC.currentTime + 4);   // fade the music in over 4 seconds
  nextT = AC.currentTime + .1;
  // Every 0.25 seconds, schedule the next notes so the music never stops
  tmr = setInterval(function(){
    while(nextT < AC.currentTime + 1){
      var ch = CH[Math.floor(step / 8) % 4], ni = step % 8;
      if(ni === 0) tone(fq(ch[0] - 12), nextT, 3.4, .16, "sine", dl);       // low bass note
      tone(fq(ch[PAT[ni]] + 12), nextT, 1.6, .09, "triangle", dl);          // melody note
      step++;
      nextT += .45;
    }
  }, 250);
}

// Play button: start the music (your song, or the built-in one), start the film, hide the opening screen
document.getElementById("play").addEventListener("click", function(){
  // Your own song: it is the <audio id="bgm"> tag in index.html. If it can't play (no file), the built-in melody is used.
  var bgm = document.getElementById("bgm");
  var pr = MEDIA.song ? bgm.play() : null;
  if(pr && pr.then){ pr.then(function(){ userSong = bgm; bgm.muted = !sndOn; }).catch(function(){ if(!AC) startSynth(); }); }
  else if(!AC){ startSynth(); }
  started = true;
  elapsed = 0;
  show(0);
  document.getElementById("intro").classList.add("off");
  // After 8 seconds, fade out the hint text
  setTimeout(function(){ document.getElementById("hint").style.opacity = 0; }, 8000);
});

// Safety: if a file chooser is cancelled, or text was left selected, un-pause the film
[picker, vp].forEach(function(i){ i.addEventListener("cancel", function(){ picking = false; }); });
document.addEventListener("click", function(e){
  var a = document.activeElement;
  if(a && a.isContentEditable && !e.target.closest("[contenteditable]")) a.blur();
});

// Sound button (music note): switch the music on or off
document.getElementById("snd").addEventListener("click", function(){
  sndOn = !sndOn;
  this.classList.toggle("mute", !sndOn);               // dim the button when muted
  if(userSong){ userSong.muted = !sndOn; }
  else if(master){
    master.gain.cancelScheduledValues(AC.currentTime);
    master.gain.linearRampToValueAtTime(sndOn ? .55 : 0, AC.currentTime + .5);
  }
});

// Finally, show the first page when the file loads.
show(0);


/* ---------- 9. LOADING YOUR MEDIA (reads the MEDIA settings at the top) ---------- */

// Show a photo in a box. If the file isn't found, the box shows the file name it is waiting for.
function usePhoto(box, url){
  box.textContent = url.replace("photos/", "");
  var im = new Image();
  im.onload = function(){ box.style.backgroundImage = 'url("' + url + '")'; box.classList.add("has"); };
  im.src = url;
}
Object.keys(MEDIA.photos).forEach(function(n){
  var boxes = pages[n - 1].querySelectorAll(".ph");
  MEDIA.photos[n].forEach(function(url, k){ if(boxes[k] && url) usePhoto(boxes[k], url); });
});
Object.keys(MEDIA.memory).forEach(function(row){
  MEDIA.memory[row].forEach(function(url, k){
    document.querySelectorAll('[data-m="' + row + k + '"]').forEach(function(b){ if(url) usePhoto(b, url); });
  });
});

// Song
var bgmEl = document.getElementById("bgm");
if(MEDIA.song){ bgmEl.src = MEDIA.song; }

// Video: load the file into the video frame; if it can't play, the tap-to-add button comes back
if(MEDIA.video){
  var vbox = document.getElementById("vid"), vbtn0 = document.getElementById("vbtn");
  vbtn0.lastChild.textContent = "Add " + MEDIA.video;
  var vtest = document.createElement("video");
  vtest.controls = true; vtest.playsInline = true; vtest.preload = "metadata";
  vtest.onloadedmetadata = function(){ vbox.innerHTML = ""; vbox.appendChild(vtest); };
  vtest.src = MEDIA.video;
}


/* ---------- 10. VIDEO PAGE STAYS UNTIL THE VIDEO ENDS ---------- */

var VIDEO_PAGE = 11;                       // page 12 (counting from 0)

// Locked = the video has started and has not finished yet
function videoLock(){
  var v = document.querySelector("#vid video");
  return cur === VIDEO_PAGE && v && v.dataset.begun === "1" && !v.ended;
}

// While locked, ignore swipes, arrow keys and the auto timer. Arriving on the page starts the video.
var _showBase = show;
show = function(n){
  if(videoLock() && n !== cur) return;
  _showBase(n);
  var v = document.querySelector("#vid video");
  if(cur === VIDEO_PAGE && v){
    v.dataset.begun = "0";
    v.currentTime = 0;
    var pr = v.play();
    if(pr && pr.catch) pr.catch(function(){});   // if the browser blocks autoplay, tap play
  }
};

// Mark the video as started, and keep the page timer at zero while it plays
document.addEventListener("play", function(e){
  if(e.target.closest && e.target.closest("#vid")) e.target.dataset.begun = "1";
}, true);
setInterval(function(){ if(videoLock()) elapsed = 0; }, 50);

// When the video ends, stay a couple of seconds, then the film moves on
document.addEventListener("ended", function(e){
  if(e.target.closest && e.target.closest("#vid")) elapsed = Math.max(0, (DWELL[VIDEO_PAGE] || 6000) - 2000);
}, true);
