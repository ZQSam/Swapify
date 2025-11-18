// src/pages/RegisterWizard.tsx
import { useState } from "react";
import RegisterEmail from "./RegisterEmail";
import VerifyCode from "./VerifyCode";
import SetCredentials from "./SetCredentials";

export default function RegisterWizard({
  onRegistrationComplete,
}: {
  onRegistrationComplete?: () => void;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleBackFromVerify = () => {
    setToken(null);
    setEmail(null); // <- this is what moves you back to the first page
  };

  // Back from SetCredentials -> go to verify step
  const handleBackFromCredentials = () => setToken(null);

  // Done after registration -> you can navigate to / or show success, etc.
  const handleDone = () => {
    setEmail(null);
    setToken(null);
    onRegistrationComplete?.();
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
