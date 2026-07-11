// backend/src/controllers/campaignController.js
import { db } from '../config/firebase.js';

const campaignsCollection = db.collection('campaigns');

/**
 * Get all active funding campaigns
 * Route: GET /api/campaigns
 */
export const getActiveCampaigns = async (req, res) => {
  try {
    // Fetch only campaigns that are marked as 'active'
    const snapshot = await campaignsCollection.where('status', '==', 'active').get();
    
    const campaigns = [];
    snapshot.forEach(doc => {
      campaigns.push({ campaignId: doc.id, ...doc.data() });
    });

    return res.status(200).json({ success: true, campaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to retrieve campaigns.' });
  }
};

/**
 * Create a new campaign (Admin Only)
 * Route: POST /api/campaigns
 */
export const createCampaign = async (req, res) => {
  try {
    const { title, description, targetGoal, endDate } = req.body;

    // Basic Input Validation
    if (!title || !description || !targetGoal || !endDate) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Build layout matching SRS document specifications exactly
    const newCampaign = {
      title,
      description,
      targetGoal: Number(targetGoal),
      currentCollected: 0, // Baseline start point
      status: 'active',
      endDate: new Date(endDate).toISOString(),
      createdAt: new Date().toISOString()
    };

    // Add document to Firestore (auto-generates campaignId)
    const docRef = await campaignsCollection.add(newCampaign);

    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully.',
      campaignId: docRef.id
    });
  } catch (error) {
    console.error('Error creating campaign:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create campaign.' });
  }
};