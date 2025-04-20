import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth.tsx";
import GroupList from "./components/GroupList.tsx";
import Schedule from "./components/Schedule.tsx";
import ForgotPassword from './components/ForgotPassword.tsx'
import ResetPassword from './components/ResetPassword.tsx'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard/>} />
                <Route path="/Auth" element={<Auth />} />
                <Route path="/dashboard/grouplist" element={<GroupList />} />
                <Route path="/dashboard/schedule" element={<Schedule />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;