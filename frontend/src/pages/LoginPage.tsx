import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../lib/api";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../contexts/AuthContext";

const uiucRegex = /^[a-z0-9._%+-]+@illinois\.edu$/i;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const trimmed = email.trim().toLowerCase();
    if (!uiucRegex.test(trimmed)) {
      setErr("Please use your @illinois.edu email.");
      return;
    }

    if (!password || password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);
      const { session, user } = await AuthAPI.login(trimmed, password);
      setMsg("Login successful!");

      login(session, {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        averageRating: 0,
        ratingCount: 0,
      });

      setTimeout(() => navigate("/"), 500);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
          <span style={{ fontSize: "18px" }}>Sign in to</span>
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label className="label">Password</label>
          <input
            className="input"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div
          className="form-row"
          style={{ display: "grid", placeItems: "center" }}
        >
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {msg && <p className="msg-ok">{msg}</p>}
        {err && <p className="msg-err">{err}</p>}

        <div
          className="form-row"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <span className="meta">Don't have an account?</span>
          <Link to="/register" className="btn-link btn">
            Create one here
          </Link>
        </div>
      </form>
    </AuthCard>
  );
}
