const homeBtn = document.getElementById("homeBtn");
const editBtn = document.getElementById("editBtn");
const settingsBtn = document.getElementById("settingsBtn");

function renderTags(container, items) {
  container.innerHTML = "";

  for (let i = 0; i < items.length; i++) {
    const div = document.createElement("div");
    div.className = "tag";
    div.textContent = items[i];
    container.appendChild(div);
  }
}

function loadProfile() {
  const savedProfile = localStorage.getItem("profileData");

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);

    document.getElementById("viewFirstName").textContent = profile.firstName || "Not set";
    document.getElementById("viewLastName").textContent = profile.lastName || "Not set";
    document.getElementById("viewProgram").textContent = profile.program || "Not set";
    document.getElementById("viewYear").textContent = profile.year || "Not set";
    document.getElementById("viewEmail").textContent = profile.email || "Not set";

    renderTags(document.getElementById("viewInterestList"), profile.interests || []);
    renderTags(document.getElementById("viewCourseList"), profile.coursesTaken || []);
  }
}

if (homeBtn) {
  homeBtn.onclick = function () {
    alert("Home page coming later.");
  };
}

if (editBtn) {
  editBtn.onclick = function () {
    window.location.href = "edit-profile.html";
  };
}

if (settingsBtn) {
  settingsBtn.onclick = function () {
    alert("Settings page coming later.");
  };
}

loadProfile();