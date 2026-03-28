const backBtn = document.getElementById("backBtn");

const interestSelect = document.getElementById("interestSelect");
const addInterest = document.getElementById("addInterest");
const interestList = document.getElementById("interestList");

const courseSelect = document.getElementById("courseSelect");
const addCourse = document.getElementById("addCourse");
const courseList = document.getElementById("courseList");

const saveBtn = document.getElementById("save");

const mode = localStorage.getItem("mode");

let interests = [];
let courses = [];

function renderRemovableTags(container, items, type) {
  container.innerHTML = "";

  for (let i = 0; i < items.length; i++) {
    const div = document.createElement("div");
    div.className = "removable-tag";
    div.textContent = items[i];

    div.onclick = function () {
      if (type === "interest") {
        interests = interests.filter(item => item !== items[i]);
        renderRemovableTags(interestList, interests, "interest");
      } else if (type === "course") {
        courses = courses.filter(item => item !== items[i]);
        renderRemovableTags(courseList, courses, "course");
      }
    };

    container.appendChild(div);
  }
}

function loadProfileIntoForm() {
  const savedProfile = localStorage.getItem("profileData");

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);

    document.getElementById("firstName").value = profile.firstName || "";
    document.getElementById("lastName").value = profile.lastName || "";
    document.getElementById("program").value = profile.program || "";
    document.getElementById("year").value = profile.year || "";
    document.getElementById("email").value = profile.email || "";

    interests = profile.interests || [];
    courses = profile.coursesTaken || [];

    renderRemovableTags(interestList, interests, "interest");
    renderRemovableTags(courseList, courses, "course");
  }
}

if (backBtn) {
  backBtn.onclick = function () {
    window.location.href = "profile.html";
  };
}

addInterest.onclick = function () {
  const value = interestSelect.value;

  if (value && !interests.includes(value)) {
    interests.push(value);
    renderRemovableTags(interestList, interests, "interest");
  }
};

addCourse.onclick = function () {
  const value = courseSelect.value;

  if (value && !courses.includes(value)) {
    courses.push(value);
    renderRemovableTags(courseList, courses, "course");
  }
};

saveBtn.onclick = function () {
  const profile = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    program: document.getElementById("program").value,
    year: document.getElementById("year").value,
    email: document.getElementById("email").value,
    interests: interests,
    coursesTaken: courses
  };

  localStorage.setItem("profileData", JSON.stringify(profile));
  localStorage.removeItem("mode");
  window.location.href = "profile.html";
};

loadProfileIntoForm();