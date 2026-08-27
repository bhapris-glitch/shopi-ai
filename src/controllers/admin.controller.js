const Client = require("../../models/Client");
const Contact = require("../../models/Contact");

// GET /api/admin/summary
exports.summary = async (req, res) => {
  const [clients, active, trials, locked, contacts] = await Promise.all([
    Client.countDocuments(),
    Client.countDocuments({ status: "active" }),
    Client.countDocuments({ status: "trial" }),
    Client.countDocuments({ locked: true }),
    Contact.countDocuments()
  ]);
  const totalRevenue = (await Client.aggregate([{ $group: { _id: null, r: { $sum: "$revenue" } } }]))[0]?.r || 0;
  res.json({ success: true, data: { clients, active, trials, locked, contacts, revenue: total } });
};

// GET /api/admin/clients
exports.listClients = async (req, res) => {
  const clients = await Client.find().select("-passwordHash -token -apiKey").sort({ createdAt: -1 }).limit(500);
  res.json({ success: true, clients });
};

// GET /api/admin/clients/:id
exports.getClient = async (req, res) => {
  const c = await Client.findById(req.params.id);
  res.json({ success: true, client: c });
};

// PUT /api/admin/clients/:id
exports.updateClient = async (req, res) => {
  const allowed = ["plan", "status", "locked", "trialEnds", "renewalDate", "paid", "notes"];
  const update = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
  // extend/extend trial helper
  if (req.body.extendTrialDays) {
    const c = await Client.findById(req.params.id);
    update.trialEnds = Date.now() + (req.body.extendTrialDays * 24 * 3600 * 1000);
    update.locked = false;
    update.status = "trial";
  }
  await Client.findByIdAndUpdate(req.params.id, { $set: update });
  res.json({ success: true });
};
