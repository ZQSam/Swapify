import { useState } from "react";
import { AuthAPI } from "../lib/api";
import AuthCard from "../components/AuthCard";

const uiucRegex = /^[a-z0-9._%+-]+@illinois\.edu$/i;

export default function RegisterEmail({
  onNext,
}: {
  onNext: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    const trimmed = email.trim().toLowerCase();
    if (!uiucRegex.test(trimmed)) {
      setErr("Please use your @illinois.edu email.");
      return;
    }
    try {
      setLoading(true);
      await AuthAPI.requestCode(trimmed);
      setMsg("Verification code sent. Check your inbox (and spam).");
      onNext(trimmed);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
          <span style={{ fontSize: "18px" }}>Register for</span>
          <span style={{ fontWeight: 700, fontSize: "28px" }}>
            <span style={{ color: "#FF5F05" }}>BookSwap</span>
            {" "}
            <span style={{ color: "#13294B" }}>Store</span>
          </span>
        </div>
      }
    >
      <form onSubmit={submit}>
        <div className="form-row">
          <label className="label">Illinois Email</label>
          <input
            className="input"
            placeholder="Enter your Illinois Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div
          className="form-row"
          style={{ display: "grid", placeItems: "center" }}
        >
          <button className="btn btn-primary" disabled={loading}>
            Send the Verification Email
          </button>
        </div>

        {msg && <p className="msg-ok">{msg}</p>}
        {err && <p className="msg-err">{err}</p>}
      </form>
    </AuthCard>
  );
}
