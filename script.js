const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const escapeHtml = (text) => text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// [[text]] 는 시험 전까지 표시 없이 두었다가 오답이 나오면 ‘설명 못 한 부분’으로, {{text}} 는 ‘설명 완료’로 표시된다.
const markup = (text) =>
  escapeHtml(text)
    .replace(/\[\[(.+?)\]\]/g, '<mark class="pending">$1</mark>')
    .replace(/\{\{(.+?)\}\}/g, '<mark class="ok">$1</mark>');

// 비교 섹션: 화면에 들어오면 두 공부 방식을 차례로 보여준다.
const compare = document.querySelector("#compare");

if (compare) {
  compare.querySelectorAll(".compare-toggle button").forEach((button) => {
    button.addEventListener("click", () => {
      compare.dataset.show = button.dataset.show;
      compare.querySelectorAll(".compare-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    });
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    compare.classList.add("is-waiting");
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      compare.classList.remove("is-waiting");
    }, { threshold: 0.25 });
    observer.observe(compare);
  }
}

// 데모 탭
const tabs = document.querySelectorAll(".demo-tabs [role=tab]");

function selectMode(mode) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.mode === mode;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll(".demo-pane").forEach((pane) => {
    pane.hidden = pane.dataset.pane !== mode;
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectMode(tab.dataset.mode));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = [...tabs].find((t) => t !== tab);
    selectMode(next.dataset.mode);
    next.focus();
  });
});

// 공부하기 모드: 원자료를 보며 코넬식 노트를 채운다.
const studyButton = document.querySelector("#studyButton");
const cueList = document.querySelector("#cueList");
const noteList = document.querySelector("#noteList");
const summaryText = document.querySelector("#summaryText");
const studySteps = document.querySelectorAll("#studySteps li");

const studyFlow = [
  {
    notes: ["자전축이 약 23.5° 기울어져 있음", "태양 쪽으로 기울면 → 햇빛이 높게, 낮이 길게 → 여름", "거리 변화는 약 3%뿐! 1월에 오히려 가장 가까움"],
    next: "단서 질문 만들기",
  },
  {
    cues: ["계절은 왜 생길까?", "햇빛 각도가 왜 중요할까?", "거리는 상관없을까?"],
    next: "한 줄로 요약하기",
  },
  {
    summary: "계절은 태양과의 거리가 아니라 자전축 기울기 때문이다. 기울기 → 햇빛 각도·낮 길이 차이 → 기온 차이.",
    next: "이제 후배에게 가르쳐 보기",
  },
];

let studyStep = 0;

function addItems(list, items) {
  items.forEach((text, index) => {
    const item = document.createElement("li");
    item.textContent = text;
    item.style.animationDelay = `${index * 120}ms`;
    list.appendChild(item);
  });
}

function resetStudy() {
  studyStep = 0;
  cueList.innerHTML = "";
  noteList.innerHTML = "";
  summaryText.textContent = "";
  document.querySelectorAll(".study-source [data-hl]").forEach((span) => span.classList.remove("is-hl"));
  studySteps.forEach((li) => li.classList.remove("is-done"));
  studyButton.innerHTML = '필기하기 <span aria-hidden="true">→</span>';
}

studyButton?.addEventListener("click", () => {
  if (studyStep >= studyFlow.length) {
    selectMode("teach");
    document.querySelector("#tabTeach").focus();
    return;
  }
  const step = studyFlow[studyStep];
  if (step.notes) {
    document.querySelectorAll(".study-source [data-hl]").forEach((span) => span.classList.add("is-hl"));
    addItems(noteList, step.notes);
  }
  if (step.cues) addItems(cueList, step.cues);
  if (step.summary) summaryText.textContent = step.summary;
  studySteps[studyStep].classList.add("is-done");
  studyStep += 1;
  studyButton.innerHTML = `${step.next} <span aria-hidden="true">→</span>`;
});

// 가르치기 모드: 후배에게 설명하고, 후배는 가르친 것만으로 시험을 본다.
const demoChat = document.querySelector("#demoChat");
const demoButton = document.querySelector("#demoButton");
const demoScore = document.querySelector("#demoScore");
const demoMeter = document.querySelector("#demoMeter");
const examItems = document.querySelectorAll("#examList li");

const juniorAvatar = "./public/junior-student.webp?v=2";

const teachFlow = [
  {
    me: "여름엔 {{햇빛이 높은 각도로 비치고}} 낮도 길어서 더운 거야.",
    junior: "그럼 햇빛은 왜 여름에만 높게 들어와요?",
    next: "이어서 설명하기",
  },
  {
    me: "음… 그건 [[여름엔 지구가 태양에 더 가까워지니까]] 그래.",
    junior: "아하, 가까워지니까 높게 들어오는 거군요! 이제 시험 볼게요 ✏️",
    next: "후배 시험 보기",
  },
  {
    exam: [
      ["ok", "높은 각도로, 낮도 길게 비쳐요."],
      ["gap", "선배 말대로면 1월이 제일 더워야 하는데…"],
      ["gap", "모르겠어요. 안 배웠어요."],
    ],
    score: 1,
    junior: "1문제밖에 못 맞혔어요 😢 선배가 가르쳐 준 ‘가까워서’로는 2번, 3번이 안 풀려요.",
    next: "틀린 부분 다시 가르치기",
  },
  {
    me: "다시 설명할게. 거리는 거의 안 변해. {{자전축이 23.5° 기울어져 있어서}} {{태양 쪽으로 기운 반구가 여름}}이 되는 거야. 그래서 {{북반구가 여름이면 남반구는 겨울}}이야.",
    junior: "아! 그래서 1월에 가까워도 한국은 겨울이고, 호주는 여름이군요!",
    next: "다시 시험 보기",
  },
  {
    exam: [
      ["ok", "높은 각도로, 낮도 길게 비쳐요."],
      ["ok", "거리가 아니라 기울기 때문! 1월엔 북반구가 태양 반대쪽으로 기울어요."],
      ["ok", "그때 남반구가 태양 쪽으로 기울어서 여름이에요."],
    ],
    score: 3,
    junior: "만점이에요! 이제 이 개념은 ‘설명 완료’예요 🎉",
    next: "처음부터 다시 보기",
  },
];

let teachStep = 0;

function addMessage(role, text) {
  const row = document.createElement("div");
  row.className = `demo-msg is-${role}`;
  row.innerHTML = role === "junior"
    ? `<img src="${juniorAvatar}" alt="" /><div><span>후배</span><p>${markup(text)}</p></div>`
    : `<div><span>나</span><p>${markup(text)}</p></div>`;
  demoChat.appendChild(row);
  demoChat.scrollTo({ top: demoChat.scrollHeight, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function setExam(results, score) {
  examItems.forEach((item, index) => {
    const [state, answer] = results ? results[index] : ["", ""];
    item.dataset.state = state;
    item.querySelector("span").textContent = answer ? `후배: “${answer}”` : "";
  });
  demoScore.textContent = score ?? "–";
  demoMeter.style.width = `${((score ?? 0) / 3) * 100}%`;
}

function resetTeach() {
  teachStep = 0;
  demoChat.innerHTML = "";
  addMessage("junior", "선배, 여름은 왜 더워요? 가르쳐 주세요!");
  setExam(null, null);
  demoButton.innerHTML = '설명하기 <span aria-hidden="true">→</span>';
}

demoButton?.addEventListener("click", () => {
  if (teachStep >= teachFlow.length) {
    resetTeach();
    return;
  }
  const step = teachFlow[teachStep];
  teachStep += 1;
  demoButton.disabled = true;

  if (step.me) addMessage("me", step.me);
  if (step.exam) {
    setExam(step.exam, step.score);
    if (step.score < 3) demoChat.querySelectorAll("mark.pending").forEach((mark) => mark.classList.replace("pending", "gap"));
  }

  window.setTimeout(() => {
    addMessage("junior", step.junior);
    demoButton.disabled = false;
    demoButton.innerHTML = teachStep === teachFlow.length
      ? `${step.next} <span aria-hidden="true">↻</span>`
      : `${step.next} <span aria-hidden="true">→</span>`;
  }, step.exam ? 400 : 700);
});

if (studyButton) resetStudy();
if (demoChat) resetTeach();

// 공감 카드: 무한 스크롤을 위해 각 열을 한 번 복제한다.
document.querySelectorAll(".moment-track").forEach((track) => {
  [...track.children].forEach((card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  });
});

// 개념 카드 복도: 스크롤할수록 앞으로 나아가며, 가까워진 카드는 ‘설명 완료’로 바뀐다.
const corridor = document.querySelector("#corridor");
const corridorStage = document.querySelector("#corridorStage");
const corridorDone = document.querySelector("#corridorDone");
const corridorTotal = document.querySelector("#corridorTotal");

const concepts = [
  ["교육심리", "기억의 인출"], ["네트워크", "TCP 3-way handshake"],
  ["경제", "수요의 가격탄력성"], ["생물", "광합성의 명반응"],
  ["운영체제", "프로세스와 스레드"], ["경제", "한계효용 체감"],
  ["물리", "뉴턴 운동 제2법칙"], ["알고리즘", "이진 탐색"],
  ["화학", "공유 결합"], ["사회", "삼권분립"],
  ["운영체제", "가상 메모리"], ["경제", "기회비용"],
  ["수학", "미분의 정의"], ["데이터베이스", "B-Tree 인덱스"],
  ["생물", "삼투 현상"], ["철학", "코기토 에르고 숨"],
];

if (corridor && corridorStage) {
  const GAP = 420;
  const START = 900;
  const perSide = concepts.length / 2;
  const travel = START + (perSide - 1) * GAP - 380;

  const cards = concepts.map(([subject, title], index) => {
    const card = document.createElement("div");
    card.className = "concept-card";
    card.innerHTML = `<span class="concept-subject">${subject}</span><strong>${title}</strong><span class="concept-state"><i></i><em></em></span>`;
    corridorStage.appendChild(card);
    return { card, side: index % 2 === 0 ? -1 : 1, z: -(START + Math.floor(index / 2) * GAP), done: null };
  });
  corridorTotal.textContent = cards.length;

  let ticking = false;

  const render = () => {
    ticking = false;
    const rect = corridor.getBoundingClientRect();
    const scrollable = corridor.offsetHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    const offsetX = Math.min(window.innerWidth * 0.34, 480);
    const camera = progress * travel;
    let done = 0;

    cards.forEach((item) => {
      const relZ = item.z + camera;
      const isDone = relZ > -800;
      const fade = relZ > -320 ? Math.max(0, -relZ / 320) : 1;
      item.card.style.transform = `translate3d(${item.side * offsetX}px, 0, ${relZ}px) rotateY(${item.side * -52}deg)`;
      item.card.style.opacity = fade;
      if (isDone !== item.done) {
        item.done = isDone;
        item.card.classList.toggle("is-done", isDone);
        item.card.querySelector("em").textContent = isDone ? "설명 완료" : "설명 부족";
      }
      if (isDone) done += 1;
    });
    corridorDone.textContent = done;
    corridor.classList.toggle("is-complete", done === cards.length);
  };

  const requestRender = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(render);
    }
  };

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
  render();
}
