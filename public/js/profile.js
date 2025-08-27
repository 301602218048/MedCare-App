const api = "http://localhost:3000";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "./login.html";
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "./login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
  document.body.style.display = "block";
  try {
    const res = await axios.get(`${api}/user/getUser`, {
      headers: { authorization: `Bearer ${token}` },
    });

    console.log(res);
    if (res.data.success) {
      const user = res.data.profile;
      document.getElementById("dispName").textContent = user.name;
      document.getElementById("dispEmail").textContent = user.email;
      document.getElementById("dispAge").textContent = user.age || "N/A";
      document.getElementById("dispHealth").textContent =
        (user.healthConditions && user.healthConditions.join(", ")) || "None";

      document.getElementById("name").value = user.name;
      document.getElementById("email").value = user.email;
      document.getElementById("age").value = user.age || "";
      document.getElementById("healthcon").value =
        user.healthConditions?.join(", ") || "";
    }
  } catch (err) {
    console.error("Profile load error:", err.response?.data || err.message);
    alert("Error loading profile. Please try again.");
  }
});

const form = document.getElementById("profileForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Updating...";

    const updated = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      age: document.getElementById("age").value,
      healthcon: document.getElementById("healthcon").value
        ? document
            .getElementById("healthcon")
            .value.split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        : [],
    };

    const password = document.getElementById("password").value;
    if (password) updated.password = password;

    try {
      const res = await axios.put(`${api}/user/editUser`, updated, {
        headers: { authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        alert("Profile updated!");
        document.getElementById("password").value = "";
        window.location.reload();
      }
    } catch (err) {
      console.error("Profile update error:", err.response?.data || err.message);
      alert("Error updating profile. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update Profile";
    }
  });
}
