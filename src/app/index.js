import React from "react";
import { BrowserRouter , Route , Routes }  from 'react-router-dom';
 import Login from "../pages/login";
// import Loader from "../components/shared/loader";
import Notes from "../pages/notes";
import Main from "../layouts/Main";
import Loader from "../components/shared/loader";

function App() {
    return (
      
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
      
        <Route path="/notes" element={<Main />} >
        
        <Route index element={<Notes />} /> 
        </Route>
        </Routes>
        </BrowserRouter>
    );
  }
  
  export default App;
  