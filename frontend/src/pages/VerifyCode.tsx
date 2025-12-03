import { useEffect, useState } from "react";
import { AuthAPI } from "../lib/api";
import AuthCard from "../components/AuthCard";

export default function VerifyCode({
  email,
  onVerified,
  onBack,
}: {
  email: string;
  onVerified: (token: string) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      const { emailVerifiedToken } = await AuthAPI.verifyCode(
        email,
        code.trim()
      );
      onVerified(emailVerifiedToken);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function resend() {
    setErr(null);
    setMsg(null);
    try {
      await AuthAPI.requestCode(email);
      setMsg("A new verification code has been sent.");
      setCooldown(30);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <AuthCard
      onBack={onBack}
      title={
        <span>
          Register for <span className="brand">BookSwap</span> Store
        </span>
      }
      subtitle={
        <span>
          A verification code has been sent to:
          <br />
          <b>{email}</b>
        </span>
      }
    >
      <form onSubmit={submit}>
        <div className="form-row">
          <label className="label">Verification Code</label>
          <div className="inline-row">
            <input
              className="input"
              placeholder="Enter your Verification Code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button className="btn btn-primary" disabled={loading}>
              Verify
            </button>
          </div>
        </div>

        {msg && <p className="msg-ok">{msg}</p>}
        {err && <p className="msg-err">{err}</p>}

        <div className="form-row">
          <button
            type="button"
            className="btn-ghost btn"
            onClick={resend}
            disabled={cooldown > 0}
            style={{ minWidth: 220 }}
          >
            Resend Verification Email
          </button>
          {cooldown > 0 && <span className="meta"> ({cooldown}s)</span>}
        </div>
      </form>
    </AuthCard>
  );
}
