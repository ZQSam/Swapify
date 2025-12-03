import { useState } from "react";
import { AuthAPI } from "../lib/api";
import AuthCard from "../components/AuthCard";

export default function SetCredentials({
  token,
  onDone,
  onBack,
}: {
  token: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const [nickname, setNickname] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw !== pw2) {
      setErr("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      const { session } = await AuthAPI.register(token, nickname.trim(), pw);
      localStorage.setItem("session", session);
      onDone();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
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
    >
      <form onSubmit={submit}>
        <div className="form-row">
          <label className="label">Username</label>
          <input
            className="input"
            placeholder="Nickname displayed to others"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="label">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="label">Repeat your password</label>
          <input
            type="password"
            className="input"
            placeholder="Repeat your password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />
        </div>

        <div
          className="form-row"
          style={{ display: "grid", placeItems: "center" }}
        >
          <button className="btn btn-primary" disabled={loading}>
            Register
          </button>
        </div>

        {err && <p className="msg-err">{err}</p>}
      </form>
    </AuthCard>
  );
}
