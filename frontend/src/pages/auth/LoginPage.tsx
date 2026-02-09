// Arquivo: frontend/src/pages/auth/LoginPage.tsx

import React from "react";
import { Box, Container } from "@mui/material";
import LoginForm from "../../components/auth/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(1200px 600px at 20% -10%, rgba(0,149,48,0.12), transparent 60%), radial-gradient(900px 500px at 80% -10%, rgba(16,185,129,0.1), transparent 60%), #f5f7f5",
      }}
    >
      <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center" }}>
        <LoginForm />
      </Container>
    </Box>
  );
};

export default LoginPage;
