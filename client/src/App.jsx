import { useEffect, useState } from "react";
import "./App.css";
import Interface from "./pages/Interface";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:roomId" element={<Interface />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
