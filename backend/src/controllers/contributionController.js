// backend/src/controllers/contributionController.js
import { db } from '../config/firebase.js';

const contributionsCollection = db.collection('contributions');
const campaignsCollection = db.collection('campaigns');

/**
 * Record a new pending fund contribution
 * Route: POST /api/contributions
 */
export const createContribution = async (req, res) => {
  try {
    const { campaignId, amount } = req.body;
    const { uid, email } = req.user; // Injected by verifyToken middleware

    if (!campaignId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid campaign ID or amount.' });
    }

    // Prepare contribution document following the strict SRS specification mapping
    const newContribution = {
      campaignId,
      contributorUid: uid,
      contributorEmail: email,
      amount: Number(amount),
      status: 'pending', // Baseline state before administrative approval
      slipUrl: req.file ? `/uploads/${req.file.filename}` : null, // Captured via file processor
      timestamp: new Date().toISOString()
    };

    const docRef = await contributionsCollection.add(newContribution);

    return res.status(201).json({
      success: true,
      message: 'Contribution submitted successfully and pending administrative review.',
      contributionId: docRef.id
    });
  } catch (error) {
    console.error('Error logging contribution:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to submit contribution.' });
  }
};

/**
 * Get current authenticated user's personal transaction logs
 * Route: GET /api/contributions/my-history
 */
export const getMyContributionHistory = async (req, res) => {
  try {
    const { uid } = req.user;

    const snapshot = await contributionsCollection
      .where('contributorUid', '==', uid)
      .orderBy('timestamp', 'desc')
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({ contributionId: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error('Error fetching contribution history:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve transaction logs.' });
  }
};

/**
 * Administrative Update: Approve or Reject a Contribution Transaction
 * Route: PUT /api/contributions/:id/status
 */
export const updateContributionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update option.' });
    }

    const contributionRef = contributionsCollection.doc(id);
    const contributionDoc = await contributionRef.get();

    if (!contributionDoc.exists) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    const contributionData = contributionDoc.data();

    // Prevent double processing if it's already approved
    if (contributionData.status === 'approved') {
      return res.status(400).json({ success: false, message: 'This transaction has already been approved.' });
    }

    // Atomic transaction: Update status, and if approved, add amount to campaign total
    await db.runTransaction(async (transaction) => {
      transaction.update(contributionRef, { status });

      if (status === 'approved') {
        const campaignRef = campaignsCollection.doc(contributionData.campaignId);
        const campaignDoc = await transaction.get(campaignRef);

        if (campaignDoc.exists) {
          const currentCollected = campaignDoc.data().currentCollected || 0;
          const newTotal = currentCollected + contributionData.amount;
          transaction.update(campaignRef, { currentCollected: newTotal });
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: `Contribution status updated to ${status} successfully.`
    });
  } catch (error) {
    console.error('Transaction processing error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to complete transaction balance update.' });
  }
};