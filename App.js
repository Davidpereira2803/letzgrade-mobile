import './i18n';
import React, { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navigation from "./navigation";
import OnAuthGate from "./screens/auth/OnAuthGate";

export default function App() {

  return (
    <ThemeProvider>
      <OnAuthGate>
        <Navigation />
      </OnAuthGate>
    </ThemeProvider>
  );
}
