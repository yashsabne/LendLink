import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import IndexPage from "./pages/IndexPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import GroupDetails from "./pages/GroupDetails";
import CreateGroup from "./pages/CreatePage";
import ChatPage from "./pages/ChatPage";
import YashDevelopersPage from "./pages/Developers";

function App() {
  
  return (
    <> 
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/group/:groupId" element={<GroupDetails />} />
          <Route path="/create-new-group" element= {<CreateGroup/>} />
          <Route path="/chat/:groupId" element={<ChatPage />} />
          <Route path="/YashDevelopersPage" element={<YashDevelopersPage/>} />
        </Routes>
 
      </BrowserRouter>
 
    </>
  )
}

export default App
