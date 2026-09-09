const teachButton = document.querySelector("#teachButton");
const chat = document.querySelector("#chat");
const lessonCount = document.querySelector("#lessonCount");
const meterValue = document.querySelector("#meterValue");
const meterFill = document.querySelector("#meterFill");

const lessons = [
  {
    senior: "기억은 정보를 저장하는 것뿐 아니라, 필요할 때 꺼내는 과정이야.",
    junior: "아… 그럼 읽을 때 익숙하면, 꺼낼 수도 있는 거죠?",
    score: 34,
  },
  {
    senior: "꼭 그렇진 않아. 자료 없이 스스로 떠올려봐야 실제로 꺼낼 수 있는지 알 수 있어.",
    junior: "그럼 제가 자료를 안 보고 설명해보면 되는 건가요?",
    score: 67,
  },
  {
    senior: "맞아. 그리고 새로운 문제에도 적용할 수 있어야 제대로 이해한 거야.",
    junior: "이제 알겠어요! 그런데 ‘새로운 문제’는 어떤 게 새롭다는 거예요?",
    score: 86,
  },
];

let currentLesson = 0;

teachButton?.addEventListener("click", () => {
  if (currentLesson >= lessons.length) {
    currentLesson = 0;
    chat.innerHTML = '<div class="chat-bubble junior">선배, 오늘은 뭘 가르쳐줄 거예요?</div>';
    meterFill.style.width = "0%";
    meterValue.textContent = "0%";
    lessonCount.textContent = "0 / 3";
    teachButton.innerHTML = '한 문장 가르쳐보기 <span>→</span>';
    return;
  }

  const lesson = lessons[currentLesson];
  const seniorBubble = document.createElement("div");
  seniorBubble.className = "chat-bubble senior";
  seniorBubble.textContent = lesson.senior;
  chat.appendChild(seniorBubble);

  window.setTimeout(() => {
    const juniorBubble = document.createElement("div");
    juniorBubble.className = "chat-bubble junior";
    juniorBubble.textContent = lesson.junior;
    chat.appendChild(juniorBubble);
    chat.scrollTop = chat.scrollHeight;
  }, 260);

  currentLesson += 1;
  lessonCount.textContent = `${currentLesson} / 3`;
  meterValue.textContent = `${lesson.score}%`;
  meterFill.style.width = `${lesson.score}%`;
  teachButton.innerHTML = currentLesson === lessons.length
    ? '처음부터 다시 보기 <span>↻</span>'
    : '다음 문장 가르치기 <span>→</span>';
});
