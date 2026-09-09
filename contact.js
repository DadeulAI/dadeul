const form = document.querySelector("#contactForm");
const status = document.querySelector("#formStatus");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    status.textContent = "필수 항목과 개인정보 동의를 확인해주세요.";
    status.className = "form-status error";
    form.reportValidity();
    return;
  }
  status.textContent = "문의 화면이 준비되었습니다. 실제 전송 기능은 문의 채널 연결 후 활성화됩니다.";
  status.className = "form-status success";
});
