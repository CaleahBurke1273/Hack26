const signinBtn = document.getElementById("signinBtn");
const goCreateBtn = document.getElementById("goCreateBtn");
const errorMessage = document.getElementById("errorMessage");

signinBtn.onclick = function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const savedAccount = JSON.parse(localStorage.getItem("accountData"));

  if (
    savedAccount &&
    username === savedAccount.username &&
    password === savedAccount.password
  ) {
    localStorage.setItem("signedInUser", username);
    localStorage.setItem("mode", "signin");
    window.location.href = "../root/home.html";
  } else {
    errorMessage.textContent = "Invalid username or password.";
  }
};

goCreateBtn.onclick = function () {
  window.location.href = "create-account.html";
};