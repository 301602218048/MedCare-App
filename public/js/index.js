const api = `${window.location.origin}/user`;
const msg = document.getElementById("message");

function handleSignUp(e) {
  e.preventDefault();
  const obj = {
    name: e.target.name.value.trim(),
    email: e.target.email.value.trim(),
    password: e.target.password.value.trim(),
    age: e.target.age.value.trim(),
    healthcon: e.target.healthcon.value.split(/[\s,]+/).filter(Boolean),
  };
  toggleButton(e.target, true);
  addData(obj).finally(() => toggleButton(e.target, false));
  e.target.reset();
}

async function addData(obj) {
  try {
    const user = await axios.post(`${api}/signup`, obj);
    if (user.data.success) {
      showMessage(user.data.msg, "green");
      setTimeout(() => {
        window.location.href = "../html/login.html";
      }, 1000);
    }
  } catch (error) {
    console.error(error);
    updateDOM(error);
  }
}

function handleLogin(e) {
  e.preventDefault();
  const obj = {
    email: e.target.email.value.trim(),
    password: e.target.password.value.trim(),
  };
  toggleButton(e.target, true);
  userLogin(obj).finally(() => toggleButton(e.target, false));
  e.target.reset();
}

async function userLogin(obj) {
  try {
    const user = await axios.post(`${api}/login`, obj);
    if (user.data.success) {
      showMessage(user.data.msg, "green");
      localStorage.setItem("token", user.data.token);
      localStorage.setItem("name", user.data.name);
      setTimeout(() => {
        window.location.href = "../html/home.html";
      }, 1500);
    }
  } catch (error) {
    console.error(error);
    updateDOM(error);
  }
}

function updateDOM(error) {
  msg.innerHTML = "";
  const para = document.createElement("p");
  para.textContent = `Error: ${
    error.response?.data?.msg || "Something went wrong"
  }`;
  para.style.color = "red";
  msg.appendChild(para);

  setTimeout(() => {
    msg.innerHTML = "";
  }, 4000);
}

function showMessage(text, color) {
  msg.innerHTML = "";
  const para = document.createElement("p");
  para.textContent = text;
  para.style.color = color;
  msg.appendChild(para);

  setTimeout(() => {
    msg.innerHTML = "";
  }, 4000);
}

function toggleButton(form, disable) {
  const btn = form.querySelector("button[type='submit']");
  if (!btn) return;

  if (disable) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Please wait...`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || "Submit";
  }
}
