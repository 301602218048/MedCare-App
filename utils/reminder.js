const cron = require("node-cron");
const Medication = require("../models/medication");
const User = require("../models/user");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendEmail = async ({ to, subject, text }) => {
  const msg = {
    to,
    from: "abhinav.sharma29032000@gmail.com",
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    if (
      err.response?.body?.errors?.[0]?.message?.includes(
        "Maximum credits exceeded"
      )
    ) {
      console.error("🚨 SendGrid quota exceeded. Skipping emails until reset.");
      return;
    }
    console.error("SendGrid error:", err.response?.body || err.message);
  }
};

const formatTime = (date) =>
  date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

cron.schedule("0,30 * * * *", async () => {
  const currentTime = formatTime(new Date());

  try {
    const dueMeds = await Medication.find({ timeSlots: currentTime }).populate(
      "userId",
      "email name"
    );

    if (!dueMeds.length) return;

    const medsByUser = {};
    dueMeds.forEach((med) => {
      if (!med.userId?.email) return;
      if (!medsByUser[med.userId.email]) {
        medsByUser[med.userId.email] = {
          user: med.userId,
          meds: [],
        };
      }
      medsByUser[med.userId.email].meds.push(med);
    });

    for (const [email, data] of Object.entries(medsByUser)) {
      const { user, meds } = data;
      const medList = meds.map((m) => `- ${m.name} (${m.dosage})`).join("\n");

      await sendEmail({
        to: email,
        subject: "💊 Medication Reminder",
        text: `Hey ${
          user.name || "User"
        },\n\nIt's time to take your medication(s):\n${medList}\n\n⏰ Time: ${currentTime}\n\nStay healthy!`,
      });
    }
  } catch (err) {
    console.error("Reminder cron error:", err);
  }
});

cron.schedule("0 1 * * *", async () => {
  try {
    const lowStockMeds = await Medication.find({
      $expr: { $lte: ["$stock", "$refillThreshold"] },
    }).populate("userId", "email name");

    if (!lowStockMeds.length) return;

    const medsByUser = {};
    lowStockMeds.forEach((med) => {
      if (!med.userId?.email) return;
      if (!medsByUser[med.userId.email]) {
        medsByUser[med.userId.email] = {
          user: med.userId,
          meds: [],
        };
      }
      medsByUser[med.userId.email].meds.push(med);
    });

    for (const [email, data] of Object.entries(medsByUser)) {
      const { user, meds } = data;
      const medList = meds
        .map(
          (m) =>
            `- ${m.name} | Current stock: ${m.stock}, Threshold: ${m.refillThreshold}`
        )
        .join("\n");

      await sendEmail({
        to: email,
        subject: "⚠️ Stock Alert: Some medications are running low",
        text: `Hello ${
          user.name || "User"
        },\n\nThe following medications are running low:\n${medList}\n\nPlease reorder soon to avoid missing doses.`,
      });
    }
  } catch (err) {
    console.error("Refill cron error:", err);
  }
});
