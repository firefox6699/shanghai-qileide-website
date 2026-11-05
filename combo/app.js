(() => {
  const COMBO_WINDOW_MS = 1200;

  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const bestEl = document.getElementById("best");
  const hintEl = document.getElementById("hint");
  const tapBtn = document.getElementById("tapBtn");
  const resetBtn = document.getElementById("resetBtn");

  let score = 0;
  let combo = 0;
  let best = 0;
  let lastTapAt = 0;

  function render() {
    scoreEl.textContent = String(score);
    comboEl.textContent = String(combo);
    bestEl.textContent = String(best);
  }

  function setHint(text) {
    hintEl.textContent = text;
  }

  function pulseCombo() {
    comboEl.classList.remove("pulse");
    void comboEl.offsetWidth;
    comboEl.classList.add("pulse");
  }

  function onTap() {
    const now = Date.now();
    if (lastTapAt && now - lastTapAt <= COMBO_WINDOW_MS) {
      combo += 1;
    } else {
      combo = 1;
    }
    lastTapAt = now;
    score += 1;
    if (combo > best) best = combo;

    if (combo >= 10) {
      setHint(`燃起来了！${combo} 连击`);
    } else if (combo >= 5) {
      setHint(`不错！${combo} 连击`);
    } else if (combo >= 2) {
      setHint(`连击 ×${combo}`);
    } else {
      setHint("继续点，保持连击！");
    }

    pulseCombo();
    render();
  }

  function onReset() {
    score = 0;
    combo = 0;
    best = 0;
    lastTapAt = 0;
    setHint("已重置，重新开始吧！");
    render();
  }

  tapBtn.addEventListener("click", onTap);
  resetBtn.addEventListener("click", onReset);
  render();
})();
