const createAccountBtn = document.getElementById("createAccountBtn");
const backToSignInBtn = document.getElementById("backToSignInBtn");
const createErrorMessage = document.getElementById("createErrorMessage");

createAccountBtn.onclick = function () {
  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (newUsername === "" || newPassword === "" || confirmPassword === "") {
    createErrorMessage.textContent = "Please fill in all fields.";
    return;
  }

  if (newPassword !== confirmPassword) {
    createErrorMessage.textContent = "Passwords do not match.";
    return;
  }

  const accountData = {
    username: newUsername,
    password: newPassword
  };

  localStorage.setItem("accountData", JSON.stringify(accountData));
  localStorage.setItem("mode", "new");
  localStorage.setItem("signedInUser", newUsername);

  window.location.href = "../root/home.html";
};

backToSignInBtn.onclick = function () {
  window.location.href = "signin.html";
};