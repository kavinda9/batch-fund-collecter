import { db } from "../config/firebase.js";
import admin from "../config/firebase.js";

/**
 * GET /api/user/stats
 * General stats visible to batch members.
 */
const getStats = async (req, res) => {
  try {
    const uid = req.user.uid;

    // 1. Get total batch fund collected (all approved payments)
    const approvedPaymentsSnap = await db
      .collection("payments")
      .where("status", "==", "approved")
      .get();
    
    const totalCollected = approvedPaymentsSnap.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    // 2. Get this member's personal payments
    const myPaymentsSnap = await db
      .collection("payments")
      .where("uid", "==", uid)
      .get();

    let totalPaid = 0;
    let totalPending = 0;
    myPaymentsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.status === "approved") totalPaid += data.amount || 0;
      if (data.status === "pending") totalPending += data.amount || 0;
    });

    return res.status(200).json({
      success: true,
      totalCollected,
      targetSemester: 240000,
      totalPaid,      // member's own approved payments
      totalPending,   // member's own pending payments
    });
  } catch (error) {
    console.error("user getStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch general stats.",
      error: error.message,
    });
  }
};

/**
 * GET /api/user/announcements
 * Retrieve list of announcements, sorted by creation date.
 */
const getAnnouncements = async (req, res) => {
  try {
    const snap = await db
      .collection("announcements")
      .orderBy("createdAt", "desc")
      .get();

    const announcements = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }));

    return res.status(200).json({
      success: true,
      announcements,
    });
  } catch (error) {
    console.error("getAnnouncements error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load announcements.",
      error: error.message,
    });
  }
};

/**
 * GET /api/user/events
 * Retrieve list of events and check current user's RSVP status.
 */
const getEvents = async (req, res) => {
  try {
    const uid = req.user.uid;
    const [eventsSnap, rsvpSnap] = await Promise.all([
      db.collection("events").orderBy("createdAt", "desc").get(),
      db.collection("rsvps").where("uid", "==", uid).get(),
    ]);

    const userRsvps = {};
    rsvpSnap.docs.forEach((doc) => {
      const data = doc.data();
      userRsvps[data.eventId] = data.status; // 'Attending' or 'Declined'
    });

    const events = eventsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        date: data.date,
        dues: data.dues,
        fee: data.dues || 0, // mapping both
        venue: data.venue,
        rsvp: userRsvps[doc.id] || "Unconfirmed",
        desc: data.desc || "",
      };
    });

    return res.status(200).json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("getEvents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load events.",
      error: error.message,
    });
  }
};

/**
 * POST /api/user/events/:id/rsvp
 * Toggle or set RSVP status for the logged-in user.
 * Body: { status: 'Attending' | 'Declined' }
 */
const toggleRSVP = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { status } = req.body;
    const uid = req.user.uid;

    if (!status || !["Attending", "Declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Attending' or 'Declined'.",
      });
    }

    // Check if event exists
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const rsvpId = `${uid}_${eventId}`;
    const rsvpRef = db.collection("rsvps").doc(rsvpId);
    const existingRsvp = await rsvpRef.get();

    // Perform transaction to keep RSVP counter updated in events document
    await db.runTransaction(async (transaction) => {
      const currentRsvpStatus = existingRsvp.exists ? existingRsvp.data().status : null;
      
      // Update rsvps collection doc
      transaction.set(rsvpRef, {
        uid,
        eventId,
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Recalculate event RSVPs (only counting 'Attending')
      let rsvpDiff = 0;
      if (status === "Attending" && currentRsvpStatus !== "Attending") {
        rsvpDiff = 1;
      } else if (status !== "Attending" && currentRsvpStatus === "Attending") {
        rsvpDiff = -1;
      }

      if (rsvpDiff !== 0) {
        const currentEvent = await transaction.get(db.collection("events").doc(eventId));
        const currentCount = currentEvent.data().rsvp || 0;
        transaction.update(db.collection("events").doc(eventId), {
          rsvp: Math.max(0, currentCount + rsvpDiff),
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: `RSVP status updated to ${status}.`,
    });
  } catch (error) {
    console.error("toggleRSVP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update RSVP status.",
      error: error.message,
    });
  }
};

export default { getStats, getAnnouncements, getEvents, toggleRSVP };
