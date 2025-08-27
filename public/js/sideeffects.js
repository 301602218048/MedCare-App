function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

const api = axios.create({ baseURL: window.location.origin });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "login.html";
  config.headers.authorization = `Bearer ${token}`;
  return config;
});

document.addEventListener("DOMContentLoaded", () => {
  loadSideEffects();

  document
    .getElementById("sideEffectForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;

      const payload = {
        date: form.date.value,
        symptoms: form.symptoms.value.split(",").map((s) => s.trim()),
        severity: form.severity.value,
        notes: form.notes.value,
      };

      try {
        await api.post("/sideeffect/add", payload);
        form.reset();
        loadSideEffects();
      } catch (err) {
        console.error(
          "Error saving side effect:",
          err.response?.data || err.message
        );
      }
    });
});

async function loadSideEffects() {
  try {
    const { data } = await api.get("/sideeffect/list");
    const tbody = document.querySelector("#sideEffectsTable tbody");

    tbody.innerHTML =
      data.success && data.sideEffects.length
        ? data.sideEffects
            .map(
              (se) => `
          <tr>
            <td>${new Date(se.date).toLocaleDateString()}</td>
            <td>${se.symptoms.join(", ")}</td>
            <td>${se.severity}</td>
            <td>${se.notes || "-"}</td>
          </tr>`
            )
            .join("")
        : `<tr><td colspan="4">No side effects logged</td></tr>`;
  } catch (err) {
    console.error(
      "Error loading side effects:",
      err.response?.data || err.message
    );
  }
}
