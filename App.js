import React from "react";
import { ThemeProvider } from "./context/ThemeContext";
import Navigation from "./navigation";

export default function App() {
  return (
    <ThemeProvider>
      <Navigation />
    </ThemeProvider>
  );
}
