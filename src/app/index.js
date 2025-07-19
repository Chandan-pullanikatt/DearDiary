import React from "react";
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "../contexts/ThemeContext";
import Login from "../pages/login";
import { HashRouter } from 'react-router-dom';
import Notes from "../pages/notes";
import DiaryPage from "../pages/diary";
import Main from "../layouts/Main";

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <div className="min-h-screen transition-all duration-300">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/notes" element={<Main />}>
              <Route index element={<Notes />} />
            </Route>
            <Route path="/diary" element={<DiaryPage />} />
          </Routes>
        </div>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
  