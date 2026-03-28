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

async function loadMyPosts() {
    const signedInUser = localStorage.getItem("signedInUser");
    const profileDataRaw = localStorage.getItem("profileData");
    let displayName = "Anonymous";

    if (signedInUser) displayName = signedInUser;

    if (profileDataRaw) {
        try {
            const profileData = JSON.parse(profileDataRaw);
            if (profileData.firstName) displayName = profileData.firstName;
        } catch(e) {}
    }

    try {
        const res = await fetch('/posts');
        if (!res.ok) throw new Error('Failed to load posts');
        
        const posts = await res.json();
        const myPosts = posts.filter(post => post.author === displayName);
        
        const container = document.getElementById("myPostsList");
        
        if (myPosts.length > 0) {
            container.innerHTML = ""; 
            container.style.padding = "0";
            container.style.border = "none";
            container.style.background = "transparent";

            myPosts.forEach(post => {
                const div = document.createElement('div');
                div.className = 'post';

                const firstLetter = post.author ? post.author.charAt(0).toUpperCase() : '?';
                const tagsHTML = (post.tags || []).map(tag => `<span class="tag">#${tag}</span>`).join('');

                div.innerHTML = `
                    <div class="post-header">
                        <div class="pfp-small">${firstLetter}</div>
                        <div>
                            <h3 style="margin:0; font-size: 16px; margin-bottom: 2px;">${post.title}</h3>
                            <small>By ${post.author} • ${post.time || ''}</small>
                        </div>
                    </div>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">${post.content}</p>
                    <div class="tags">${tagsHTML}</div>
                `;
                container.appendChild(div);
            });
        }
    } catch(e) {
        console.error("Could not load history", e);
    }
}

loadMyPosts();