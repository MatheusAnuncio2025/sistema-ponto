// Arquivo: frontend/src/pages/auth/LoginPage.tsx

import React from "react";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
