// src/pages/RegisterWizard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterEmail from "./RegisterEmail";
import VerifyCode from "./VerifyCode";
import SetCredentials from "./SetCredentials";

export default function RegisterWizard() {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleBackFromVerify = () => {
    setToken(null);
    setEmail(null);
  };

  const handleBackFromCredentials = () => setToken(null);

  const handleDone = () => {
    setEmail(null);
    setToken(null);
    navigate("/login");
  };

  if (!email) return <RegisterEmail onNext={setEmail} />;
  if (!token)
    return (
      <VerifyCode
        email={email}
        onVerified={setToken}
        onBack={handleBackFromVerify}
      />
    );
  return (
    <SetCredentials
      token={token}
      onBack={handleBackFromCredentials}
      onDone={handleDone}
    />
  );
}
