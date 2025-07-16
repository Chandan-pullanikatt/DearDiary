import React from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "../contexts/ThemeContext";
import Login from "../pages/login";
import Notes from "../pages/notes";
import Main from "../layouts/Main";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen transition-all duration-300">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/notes" element={<Main />}>
              <Route index element={<Notes />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
  