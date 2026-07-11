import admin, { db } from "../config/firebase.js";

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregate numbers for the dashboard overview widgets.
 */
const getStats = async (req, res) => {
  try {
    const [membersSnap, paymentsSnap, expensesSnap] = await Promise.all([
      db.collection("users").where("role", "==", "member").get(),
      db.collection("payments").where("status", "==", "approved").get(),
      db.collection("expenses").get(),
    ]);

    const totalIncome = paymentsSnap.docs.reduce(
      (sum, d) => sum + (d.data().amount || 0),
      0
    );
    const totalExpenses = expensesSnap.docs.reduce(
      (sum, d) => sum + (d.data().amount || 0),
      0
    );
    const totalBalance = totalIncome - totalExpenses;

    // Count members with at least one pending payment
    const pendingSnap = await db
      .collection("payments")
      .where("status", "==", "pending")
      .get();
    const pendingCount = pendingSnap.size;

    // Recent activity: last 10 approved payments + last 5 expenses, sorted by date
    const recentPayments = paymentsSnap.docs
      .slice(-10)
      .map((d) => ({
        id: d.id,
        type: "payment",
        text: `${d.data().name} paid Rs. ${d.data().amount?.toLocaleString()} for batch fund`,
        time: d.data().createdAt?.toDate?.()?.toLocaleDateString("en-GB") || "",
      }));

    const recentExpenses = expensesSnap.docs.slice(-5).map((d) => ({
      id: d.id,
      type: "expense",
      text: `Recorded expense: Rs. ${d.data().amount?.toLocaleString()} for ${d.data().item}`,
      time: d.data().date || "",
    }));

    const recentActivity = [...recentPayments, ...recentExpenses]
      .sort((a, b) => (a.time < b.time ? 1 : -1))
      .slice(0, 8);

    return res.status(200).json({
      success: true,
      stats: {
        totalBalance,
        totalIncome,
        totalExpenses,
        pendingCount,
        memberCount: membersSnap.size,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("getStats error:", error);
    return res.status(500).json({ success: false, message: "Failed to load stats.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// SLIP REVIEW
// ─────────────────────────────────────────────

/**
 * GET /api/admin/slips
 * Returns all payment submissions (all statuses), newest first.
 */
const getAllSlips = async (req, res) => {
  try {
    const { status } = req.query; // optional filter: pending | approved | rejected
    let query = db.collection("payments");
    if (status) query = query.where("status", "==", status);

    const snap = await query.get();
    const payments = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Sort descending by createdAt in memory
    payments.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
      return timeB - timeA;
    });

    return res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("getAllSlips error:", error);
    return res.status(500).json({ success: false, message: "Failed to load slips.", error: error.message });
  }
};

/**
 * PATCH /api/admin/slips/:id/approve
 * Sets payment status to "approved".
 */
const approveSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = db.collection("payments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    }

    await docRef.update({
      status: "approved",
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user.uid,
      adminNote: "",
    });

    return res.status(200).json({ success: true, message: "Slip approved successfully." });
  } catch (error) {
    console.error("approveSlip error:", error);
    return res.status(500).json({ success: false, message: "Failed to approve slip.", error: error.message });
  }
};

/**
 * PATCH /api/admin/slips/:id/reject
 * Body: { adminNote: string }
 * Sets payment status to "rejected".
 */
const rejectSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote = "" } = req.body;

    const docRef = db.collection("payments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    }

    await docRef.update({
      status: "rejected",
      adminNote,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      reviewedBy: req.user.uid,
    });

    return res.status(200).json({ success: true, message: "Slip rejected." });
  } catch (error) {
    console.error("rejectSlip error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject slip.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /api/admin/members
 * Returns all registered members (role === "member") with their payment summary.
 */
const getMembers = async (req, res) => {
  try {
    const usersSnap = await db.collection("users").where("role", "==", "member").get();

    // Fetch approved payments to compute totals per user
    const paymentsSnap = await db
      .collection("payments")
      .where("status", "==", "approved")
      .get();

    const paymentsByUid = {};
    paymentsSnap.docs.forEach((d) => {
      const { uid, amount, createdAt } = d.data();
      if (!paymentsByUid[uid]) paymentsByUid[uid] = { totalPaid: 0, lastDate: null };
      paymentsByUid[uid].totalPaid += amount || 0;
      const dateStr = createdAt?.toDate?.()?.toISOString?.() || null;
      if (!paymentsByUid[uid].lastDate || dateStr > paymentsByUid[uid].lastDate) {
        paymentsByUid[uid].lastDate = dateStr;
      }
    });

    const members = usersSnap.docs.map((d) => {
      const data = d.data();
      const pInfo = paymentsByUid[data.uid] || { totalPaid: 0, lastDate: null };
      return {
        uid: data.uid,
        name: data.name,
        email: data.email,
        regNumber: data.regNumber,
        degreeProgram: data.degreeProgram,
        batch: data.batch,
        contactNumber: data.contactNumber,
        amountPaid: pInfo.totalPaid,
        lastPaymentDate: pInfo.lastDate
          ? new Date(pInfo.lastDate).toLocaleDateString("en-GB")
          : "-",
        status:
          pInfo.totalPaid === 0
            ? "Unpaid"
            : pInfo.totalPaid < 3000
            ? "Partially Paid"
            : "Paid",
      };
    });

    return res.status(200).json({ success: true, members });
  } catch (error) {
    console.error("getMembers error:", error);
    return res.status(500).json({ success: false, message: "Failed to load members.", error: error.message });
  }
};

/**
 * DELETE /api/admin/members/:uid
 * Deletes the user from Firebase Auth and Firestore.
 */
const deleteMember = async (req, res) => {
  try {
    const { uid } = req.params;

    // Prevent deleting own account
    if (uid === req.user.uid) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    }

    await admin.auth().deleteUser(uid);
    await db.collection("users").doc(uid).delete();

    return res.status(200).json({ success: true, message: "Member deleted successfully." });
  } catch (error) {
    console.error("deleteMember error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete member.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// EXPENSE MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /api/admin/expenses
 * Returns all expenses, newest first.
 */
const getExpenses = async (req, res) => {
  try {
    const snap = await db.collection("expenses").orderBy("createdAt", "desc").get();
    const expenses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("getExpenses error:", error);
    return res.status(500).json({ success: false, message: "Failed to load expenses.", error: error.message });
  }
};

/**
 * POST /api/admin/expenses
 * Body: { item, amount, date, category, spentBy, desc }
 */
const createExpense = async (req, res) => {
  try {
    const { item, amount, date, category, spentBy, desc } = req.body;

    if (!item || !amount || !date || !category || !spentBy) {
      return res.status(400).json({ success: false, message: "item, amount, date, category, and spentBy are required." });
    }

    const docRef = await db.collection("expenses").add({
      item,
      amount: Number(amount),
      date,
      category,
      spentBy,
      desc: desc || "",
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "Expense recorded successfully.",
      expense: { id: docRef.id, item, amount: Number(amount), date, category, spentBy, desc },
    });
  } catch (error) {
    console.error("createExpense error:", error);
    return res.status(500).json({ success: false, message: "Failed to record expense.", error: error.message });
  }
};

/**
 * DELETE /api/admin/expenses/:id
 */
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("expenses").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }
    await db.collection("expenses").doc(id).delete();
    return res.status(200).json({ success: true, message: "Expense deleted." });
  } catch (error) {
    console.error("deleteExpense error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete expense.", error: error.message });
  }
};

// ─────────────────────────────────────────────
// EVENT MANAGEMENT
// ─────────────────────────────────────────────

/**
 * GET /api/admin/events
 * Returns all events, newest first.
 */
const getEvents = async (req, res) => {
  try {
    const snap = await db.collection("events").orderBy("createdAt", "desc").get();
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("getEvents error:", error);
    return res.status(500).json({ success: false, message: "Failed to load events.", error: error.message });
  }
};

/**
 * POST /api/admin/events
 * Body: { eventTitle, date, venue, contributionAmount, description }
 */
const createEvent = async (req, res) => {
  try {
    const { eventTitle, date, venue, contributionAmount, description } = req.body;

    if (!eventTitle || !date || !venue) {
      return res.status(400).json({ success: false, message: "eventTitle, date, and venue are required." });
    }

    const docRef = await db.collection("events").add({
      title: eventTitle,
      date,
      venue,
      dues: Number(contributionAmount) || 0,
      desc: description || "",
      rsvp: 0,
      createdBy: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event: {
        id: docRef.id,
        title: eventTitle,
        date,
        venue,
        dues: Number(contributionAmount) || 0,
        desc: description || "",
        rsvp: 0,
      },
    });
  } catch (error) {
    console.error("createEvent error:", error);
    return res.status(500).json({ success: false, message: "Failed to create event.", error: error.message });
  }
};

/**
 * DELETE /api/admin/events/:id
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("events").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }
    await db.collection("events").doc(id).delete();
    return res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    console.error("deleteEvent error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete event.", error: error.message });
  }
};

/**
 * POST /api/admin/announcements
 * Body: { title, content, priority }
 */
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority = "Normal" } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "title and content are required." });
    }

    const docRef = await db.collection("announcements").add({
      title,
      content,
      priority,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid,
    });

    return res.status(201).json({
      success: true,
      message: "Announcement created.",
      announcement: { id: docRef.id, title, content, priority },
    });
  } catch (error) {
    console.error("createAnnouncement error:", error);
    return res.status(500).json({ success: false, message: "Failed to create announcement.", error: error.message });
  }
};

/**
 * DELETE /api/admin/announcements/:id
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("announcements").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }
    await db.collection("announcements").doc(id).delete();
    return res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (error) {
    console.error("deleteAnnouncement error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete announcement.", error: error.message });
  }
};

export default {
  getStats,
  getAllSlips,
  approveSlip,
  rejectSlip,
  getMembers,
  deleteMember,
  getExpenses,
  createExpense,
  deleteExpense,
  getEvents,
  createEvent,
  deleteEvent,
  createAnnouncement,
  deleteAnnouncement,
};
