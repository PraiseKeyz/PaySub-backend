const getVirtualAccount = async (req, res) => {
    try {
        // ✅ Extract user from the auth middleware
        const user = req.user;

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // ✅ Check if the user has a virtual account
        if (!user.virtualAccount) {
            return res.status(200).json({ hasVirtualAccount: false });
        }

        // ✅ Return the virtual account details
        res.status(200).json({
            hasVirtualAccount: true,
            virtualAccount: user.virtualAccount,
        });
    } catch (error) {
        console.error("Error fetching virtual account:", error);
        res.status(500).json({ error: "Server error. Could not fetch virtual account." });
    }
};

module.exports = getVirtualAccount;
