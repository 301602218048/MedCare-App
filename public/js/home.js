const api = axios.create({ baseURL: window.location.origin });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "login.html";
  config.headers.authorization = `Bearer ${token}`;
  return config;
});

const modal = document.getElementById("medicineModal");
const openModalBtn = document.getElementById("addMedicineBtn");
const closeModal = document.querySelector(".close");
const username = document.querySelector("#username");
const form = document.getElementById("medForm");
const tbody = document.getElementById("medicineTableBody");
const prescriptionsList = document.getElementById("latestPresList");
const remindersList = document.getElementById("remindersList");

function logout() {
  localStorage.removeItem("token");
  location.href = "./login.html";
}

openModalBtn.onclick = () => {
  modal.style.display = "block";
  form.reset();
  form.dataset.medId = "";
  document.getElementById("modalTitle").innerText = "Add Medicine";
};
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (e) => e.target === modal && (modal.style.display = "none");

document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("token")) return (location.href = "./login.html");
  document.body.style.display = "block";
  username.innerHTML = localStorage.getItem("name").split(" ")[0];
  loadMeds();
  loadReminders();
  loadPrescriptions();
  document.getElementById("search").oninput = loadMeds;
});

async function loadMeds() {
  const search = document.getElementById("search").value;
  try {
    const res = await api.get(`/med/getFilteredMeds`, {
      params: { search },
    });
    res.data.success
      ? renderMeds(res.data.meds || [])
      : (tbody.innerHTML = "<tr><td colspan='7'>No medicines found</td></tr>");
  } catch (err) {
    console.error(err);
  }
}

function renderMeds(meds) {
  tbody.innerHTML = "";
  const today = new Date();
  meds.forEach((med) => {
    let stockStatus =
      med.stock <= med.refillThreshold
        ? `<span style="color:red;font-weight:bold;">Low (${med.stock})</span>`
        : med.stock;
    let status = "Running";
    if (
      med.endDate &&
      new Date(med.endDate).setDate(new Date(med.endDate).getDate() + 1) < today
    )
      status = "Completed";
    if (med.startDate && new Date(med.startDate) > today)
      status = "Not Started";

    tbody.innerHTML += `
      <tr>
        <td>${med.name}</td>
        <td>${med.dosage}</td>
        <td>${med.timeSlots.join(", ")}</td>
        <td>${stockStatus}</td>
        <td>${med.refillThreshold}</td>
        <td>${status}</td>
        <td>
          <button onclick='editMed(${JSON.stringify(med)})'>Edit</button>
          <button onclick='deleteMed("${med._id}")'>Delete</button>
        </td>
      </tr>`;
  });
}

async function addMed(e) {
  e.preventDefault();
  const medId = form.dataset.medId;
  const med = {
    name: form.name.value,
    dosage: form.dosage.value,
    timeSlots: form.timeSlots.value.split(","),
    stock: form.stock.value,
    refillThreshold: form.refillThreshold.value,
    startDate: form.startDate.value,
    endDate: form.endDate.value,
  };
  try {
    const url = medId ? `/med/updateMed/${medId}` : `/med/addMed`;
    const method = medId ? "put" : "post";
    const res = await api[method](url, med);
    if (res.data.success) {
      loadMeds();
      loadPrescriptions();
      modal.style.display = "none";
      form.reset();
      form.dataset.medId = "";
    } else alert(res.data.msg || "Something went wrong");
  } catch (err) {
    console.error(err);
  }
}

function editMed(med) {
  form.dataset.medId = med._id;
  modal.style.display = "block";
  document.getElementById("modalTitle").innerText = "Edit Medicine";
  form.name.value = med.name || "";
  form.dosage.value = med.dosage || "";
  form.timeSlots.value = med.timeSlots?.join(",") || "";
  form.stock.value = med.stock || "";
  form.refillThreshold.value = med.refillThreshold || "";
  form.startDate.value = med.startDate?.split("T")[0] || "";
  form.endDate.value = med.endDate?.split("T")[0] || "";
}

async function deleteMed(id) {
  if (!confirm("Are you sure you want to delete this medicine?")) return;
  try {
    const res = await api.delete(`/med/deleteMed/${id}`);
    res.data.success
      ? (loadMeds(), loadPrescriptions())
      : alert(res.data.msg || "Failed to delete");
  } catch (err) {
    console.error(err);
  }
}

async function loadReminders() {
  remindersList.innerHTML = "<li>Loading...</li>";
  try {
    const res = await api.get(`/intake/today`);
    if (res.data.success && res.data.reminders.length) {
      remindersList.innerHTML = res.data.reminders
        .map(
          (r) =>
            `<li>${r.medicationName} at ${r.time} → ${
              r.status === "taken" ? "✅ Taken" : "⏰ Pending"
            }</li>`
        )
        .join("");
    } else remindersList.innerHTML = "<li>No reminders for now.</li>";
  } catch (err) {
    console.error(err);
    remindersList.innerHTML = "<li>Error fetching reminders.</li>";
  }
}

async function loadPrescriptions() {
  prescriptionsList.innerHTML = "<li>Loading...</li>";
  try {
    const res = await api.get(`/med/latest`);
    if (res.data.success && res.data.prescriptions.length) {
      prescriptionsList.innerHTML = res.data.prescriptions
        .map(
          (p) =>
            `<li>${p.name} (${p.dosage}) → Prescribed on ${new Date(
              p.startDate
            ).toLocaleDateString()}</li>`
        )
        .join("");
    } else prescriptionsList.innerHTML = "<li>No prescriptions found.</li>";
  } catch (err) {
    console.error(err);
    prescriptionsList.innerHTML = "<li>Error fetching prescriptions.</li>";
  }
}
