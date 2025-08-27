const api = axios.create({ baseURL: window.location.origin });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "login.html";
  config.headers.authorization = `Bearer ${token}`;
  return config;
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", loadLogs);

async function loadLogs() {
  const filterDate =
    document.getElementById("filterDate")?.value ||
    new Date().toISOString().split("T")[0];

  try {
    const { data } = await api.get(`/intake/getLogs?date=${filterDate}`);
    const tbody = document.querySelector("#logsTable tbody");
    tbody.innerHTML = "";

    if (data.success && data.dailyLogs.length) {
      tbody.innerHTML = data.dailyLogs
        .map(
          (log) => `
          <tr>
            <td>${new Date(log.date).toLocaleDateString()}</td>
            <td>${log.time}</td>
            <td>${log.medicationName}</td>
            <td>${
              log.status
                ? `<span class="status-${log.status}">${log.status}</span>`
                : "-"
            }</td>
            <td>${log.note || "-"}</td>
            <td>
              ${
                log.status
                  ? ""
                  : `
                <button class="action-btn btn-taken" onclick="markLog('${log.medicationId}','${log.date}','${log.time}','taken')">Taken</button>
                <button class="action-btn btn-missed" onclick="markLog('${log.medicationId}','${log.date}','${log.time}','missed')">Missed</button>
              `
              }
            </td>
          </tr>`
        )
        .join("");
    } else {
      tbody.innerHTML = `<tr><td colspan="7">No logs found</td></tr>`;
    }
  } catch (err) {
    console.error("Error loading logs:", err.response?.data || err.message);
  }
}

async function markLog(medicationId, date, time, status) {
  try {
    await api.post("/intake/addLog", { medicationId, date, time, status });
    loadLogs();
  } catch (err) {
    console.error("Error marking log:", err.response?.data || err.message);
  }
}
