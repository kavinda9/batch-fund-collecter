const getProfile = (req, res) => {

    res.status(200).json({

        success: true,

        message: "Profile Loaded",

        user: req.user

    });

};

export default {

    getProfile

};