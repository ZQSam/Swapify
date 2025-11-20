import { z } from "zod";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { User } from "../models/User.model.js";
import { Verification } from "../models/Verification.model.js";
import { sendEmail } from "../utils/email.util.js";
import { signTemp, signSession, verifyToken } from "../utils/token.util.js";

const emailSchema = z
  .string()
  .email()
  .refine((e) => e.toLowerCase().endsWith("@illinois.edu"), {
    message: "UIUC email required (@illinois.edu)",
  });

const nano6 = customAlphabet("0123456789", 6);

export const requestCode = async (req, res) => {
  let email;
  try {
    email = emailSchema.parse((req.body.email || "").trim().toLowerCase());
  } catch (e) {
    return res.status(400).json({ error: e.errors?.[0]?.message || "Invalid email" });
  }

  const code = nano6();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await Verification.deleteMany({ email });
  await Verification.create({ email, codeHash, expiresAt });

  try {
    await sendEmail({
      to: email,
      subject: "Your BookSwap Store verification code",
      text: `Your code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your code is <b>${code}</b>. It expires in 10 minutes.</p>`,
    });
    return res.json({ ok: true, message: "Code sent" });
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    return res.status(502).json({ error: "Email delivery failed. Please try again later." });
  }
};

export const verifyCode = async (req, res) => {
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
};

export const register = async (req, res) => {
  const schema = z.object({
    token: z.string(),
    nickname: z.string().min(2).max(32),
    password: z.string().min(8).max(72),
  });
  const { token, nickname, password } = schema.parse(req.body);

  let decoded;
  try {
    decoded = verifyToken(token);
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
};

export const login = async (req, res) => {
  const schema = z.object({ email: emailSchema, password: z.string() });
  const { email, password } = schema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials." });

  const ok = await bcrypt.compare(password, user.passwordHash || "");
  if (!ok) return res.status(401).json({ error: "Invalid credentials." });

  const session = signSession({ uid: user._id, email: user.email });
  res.json({ ok: true, session, user: { id: user._id, email: user.email, nickname: user.nickname } });
};
