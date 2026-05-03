const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

const goHomeAsDemoUser = () => {
  localStorage.setItem("bookingme_user", JSON.stringify({
    name: "Sokha Chea",
    email: "sokha.chea@example.com"
  }));

  window.location.href = "/index.html";
};

if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    container.classList.add("active");
  });
}

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    container.classList.remove("active");
  });
}

document.querySelectorAll(".form-box form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    goHomeAsDemoUser();
  });
});

document.querySelectorAll(".social-icons a").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    goHomeAsDemoUser();
  });
});
