exports.executive = async (req, res) => {
  try {
    const { hostname } = req.body || {};
    if (!hostname) return res.status(400).json({ success: false });
    const Client = require("../../models/Client");
    const store = String(hostname).replace(/^www\./, "").toLowerCase();
    const client = await Client.findOne({ store }).select("agentName agentAvatar poweredByHidden plan");
    if (!client) return res.json({ success: false });
    return res.json({
      success: true,
      executive: {
        name: client.agentName || "Emily",
        gender: req.body.gender || "female",
        avatarType: "custom",
        plan: client.plan,
        poweredByHidden: !!client.poweredByHidden,
        // ---- populated from merchant settings you save below ----
        logo: client.logo || "",
        welcomeAvatar: client.welcomeAvatar || "",
        chatAvatar: client.agentAvatar || "",
        welcomeMessage: client.welcomeMessage || "",
        returningMessage: client.returningMessage || "",
        personality: client.personality || "friendly"
      }
    });
  } catch (e) { return res.status(500).json({ success: false }); }
};

router.post("/executive", ChatController.executive);
