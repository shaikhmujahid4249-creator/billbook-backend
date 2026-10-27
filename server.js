const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 🔥 AAPKA MONGO DB LINK (Maine isme database ka naam 'billbook' add kar diya hai)
const MONGO_URI = 'mongodb+srv://shaikhmujahid4249_db_user:ngD79BT68QWiyw5B@calci.fuvudqm.mongodb.net/billbook?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ MongoDB Error: ", err));

// Database Models
const Shop = mongoose.model('Shop', new mongoose.Schema({ mobile: { type: String, unique: true }, shopData: Object }));
const Bill = mongoose.model('Bill', new mongoose.Schema({ mobile: String, billNo: Number, fy: String, billData: Object }));

// 1. Shop Save/Update
app.post('/api/shop', async (req, res) => {
    try {
        const { mobile, shopData } = req.body;
        await Shop.findOneAndUpdate({ mobile }, { shopData }, { upsert: true });
        res.json({ success: true, message: "Shop saved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Shop Fetch
app.get('/api/shop/:mobile', async (req, res) => {
    try {
        const shop = await Shop.findOne({ mobile: req.params.mobile });
        if (shop) res.json(shop.shopData);
        else res.status(404).json({ error: "Shop not found" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Bill Save
app.post('/api/bill', async (req, res) => {
    try {
        const { mobile, billData } = req.body;
        const existing = await Bill.findOne({ mobile, billNo: billData.no, fy: billData.fy });
        if (existing) {
            existing.billData = billData;
            await existing.save();
        } else {
            await Bill.create({ mobile, billNo: billData.no, fy: billData.fy, billData });
        }
        res.json({ success: true, message: "Bill saved" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Bills Fetch
app.get('/api/bills/:mobile', async (req, res) => {
    try {
        const bills = await Bill.find({ mobile: req.params.mobile }).sort({ createdAt: -1 });
        res.json(bills.map(b => b.billData));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Bill Delete
app.delete('/api/bill/:mobile/:no/:fy', async (req, res) => {
    try {
        await Bill.findOneAndDelete({ mobile: req.params.mobile, billNo: req.params.no, fy: req.params.fy });
        res.json({ success: true, message: "Bill deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Backend Server chal raha hai: http://localhost:${PORT}`));