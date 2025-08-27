function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadReports();
});

async function loadReports() {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  try {
    const res = await fetch("/report/analytics", {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (!data.success) return alert("Error loading reports");

    renderAdherenceChart(data.adherence);
    renderIntakeTrend(data.intakeTrend);
    renderSideEffectChart(data.sideEffects);
    renderSummary(data.summary);
  } catch (err) {
    console.error("Error loading reports:", err);
  }
}

function renderAdherenceChart(adherence) {
  new Chart(document.getElementById("adherenceChart"), {
    type: "pie",
    data: {
      labels: ["Taken", "Missed"],
      datasets: [
        {
          data: [adherence.taken, adherence.missed],
          backgroundColor: ["#4CAF50", "#F44336"],
        },
      ],
    },
  });
}

function renderIntakeTrend(trend) {
  new Chart(document.getElementById("intakeTrendChart"), {
    type: "line",
    data: {
      labels: trend.dates,
      datasets: [
        {
          label: "Taken",
          data: trend.takenCounts,
          borderColor: "#4CAF50",
          fill: false,
        },
        {
          label: "Missed",
          data: trend.missedCounts,
          borderColor: "#F44336",
          fill: false,
        },
      ],
    },
  });
}

function renderSideEffectChart(sideEffects) {
  new Chart(document.getElementById("sideEffectChart"), {
    type: "bar",
    data: {
      labels: ["1", "2", "3", "4", "5"],
      datasets: [
        {
          label: "Reports",
          data: sideEffects,
          backgroundColor: "#2196F3",
        },
      ],
    },
  });
}

function renderSummary(summary) {
  const box = document.getElementById("summaryBox");
  box.innerHTML = `
    <p><strong>Total Medications:</strong> ${summary.totalMeds}</p>
    <p><strong>Total Intakes Logged:</strong> ${summary.totalIntakes}</p>
    <p><strong>Overall Adherence:</strong> ${summary.adherenceRate}%</p>
    <p><strong>Side Effects Logged:</strong> ${summary.totalSideEffects}</p>
  `;
}
