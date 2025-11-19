import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { customAlphabet } from "nanoid";

/* ---------- app & middleware ---------- */
const app = express();

// allow multiple origins: "http://localhost:5173,https://swapify-frontend.onrender.com"
const allowed = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // curl / healthchecks
      cb(null, allowed.includes(origin));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());
app.use(express.json());

/* ---------- health ---------- */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "production", time: new Date().toISOString() });
});

/* ---------- Mongo ---------- */
mongoose.set("strictQuery", true);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, index: true },
    uiucVerified: { type: Boolean, default: false },
    nickname: { type: String },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

const verificationSchema = new mongoose.Schema(
  {
    email: { type: String, index: true },
    codeHash: String,
    expiresAt: { type: Date, index: { expires: 0 } }, // TTL set dynamically
    consumed: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Verification = mongoose.model("Verification", verificationSchema);

/* ---------- Mailer ---------- */
const secure =
  String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
  Number(process.env.SMTP_PORT) === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

/* ---------- Helpers ---------- */
const emailSchema = z
  .string()
  .email()
  .refine((e) => e.toLowerCase().endsWith("@illinois.edu"), {
    message: "UIUC email required (@illinois.edu)",
  });

const nano6 = customAlphabet("0123456789", 6);
const signTemp = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
const signSession = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

/* ---------- 1) Request verification code ---------- */
app.post("/api/auth/request-code", async (req, res) => {
  let email;
  try {
    email = emailSchema.parse((req.body.email || "").trim().toLowerCase());
  } catch (e) {
    return res.status(400).json({ error: e.errors?.[0]?.message || "Invalid email" });
  }

  const code = nano6(); // "483921"
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Verification.deleteMany({ email }); // one active at a time
  await Verification.create({ email, codeHash, expiresAt });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Your BookSwap Store verification code",
    text: `Your code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your code is <b>${code}</b>. It expires in 10 minutes.</p>`,
  });

  // optional: log preview URL if using Ethereal
  if (typeof nodemailer.getTestMessageUrl === "function") {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log("✉️  Preview:", url);
  }

  res.json({ ok: true, message: "Code sent" });
});

/* ---------- 2) Verify code -> short-lived token ---------- */
app.post("/api/auth/verify-code", async (req, res) => {
  const schema = z.object({ email: emailSchema, code: z.string().length(6) });
  const { email, code } = schema.parse(req.body);

  const rec = await Verification.findOne({ email, consumed: false }).sort({ createdAt: -1 });
  if (!rec) return res.status(400).json({ error: "No active code. Request a new one." });
  if (rec.expiresAt < new Date()) return res.status(400).json({ error: "Code expired." });

  if (!(await bcrypt.compare(code, rec.codeHash))) {
    rec.attempts += 1;
    await rec.save();
    return res.status(400).json({ error: "Invalid code." });
  }

  rec.consumed = true;
  await rec.save();

  const emailVerifiedToken = signTemp({ email, uiucVerified: true });
  res.json({ ok: true, emailVerifiedToken });
});

/* ---------- 3) Complete registration ---------- */
app.post("/api/auth/register", async (req, res) => {
  const schema = z.object({
    token: z.string(),
    nickname: z.string().min(2).max(32),
    password: z.string().min(8).max(72),
  });
  const { token, nickname, password } = schema.parse(req.body);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Email verification token invalid/expired." });
  }

  const email = decoded.email;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: "An account has been registered with this email." });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, uiucVerified: true, nickname, passwordHash });

  const session = signSession({ uid: user._id, email: user.email });
  res.status(201).json({ ok: true, session, user: { id: user._id, email, nickname } });
});

/* ---------- 4) Login ---------- */
app.post("/api/auth/login", async (req, res) => {
  const schema = z.object({ email: emailSchema, password: z.string() });
  const { email, password } = schema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials." });

  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials." });

  const session = signSession({ uid: user._id, email: user.email });
  res.json({ ok: true, session, user: { id: user._id, email: user.email, nickname: user.nickname } });
});

/* ---------- 404 (keep at end) ---------- */
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

/* ---------- boot ---------- */
const PORT = process.env.PORT || 4000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
