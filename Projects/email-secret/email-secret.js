function maskEmail(email) {
  const atIndex = email.indexOf("@");
  
  if (atIndex === -1) {
      return "Invalid email address";
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex);

  // Handle short local parts
  if (localPart.length <= 2) {
      return "*".repeat(localPart.length) + domain;
  }

  const masked =
    localPart[0] +
    "*".repeat(localPart.length - 2) +
    localPart[localPart.length - 1];

  return masked + domain;
}

document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("emailInput");
    const maskBtn = document.getElementById("maskBtn");
    const resultContainer = document.getElementById("resultContainer");
    const maskedResult = document.getElementById("maskedResult");

    maskBtn.addEventListener("click", () => {
        const email = emailInput.value.trim();
        
        if (email) {
            // Function output requested by user
            const result = maskEmail(email);
            console.log(result);
            
            // UI Update
            maskedResult.textContent = result;
            
            resultContainer.classList.remove("show");
            void resultContainer.offsetWidth; // Trigger reflow for animation
            resultContainer.classList.add("show");
            
            if (result === "Invalid email address") {
                maskedResult.style.color = "#f87171";
            } else {
                maskedResult.style.color = "#34d399";
            }
        } else {
            emailInput.style.animation = "shake 0.5s cubic-bezier(.36,.07,.19,.97) both";
            setTimeout(() => {
                emailInput.style.animation = "";
            }, 500);
        }
    });

    emailInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            maskBtn.click();
        }
    });
});

const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
`;
document.head.appendChild(style);
