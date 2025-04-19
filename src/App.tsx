import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth.tsx";
import GroupList from "./components/GroupList.tsx";
import Schedule from "./components/Schedule.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard/>} />
                <Route path="/Auth" element={<Auth />} />
                <Route path="/dashboard/grouplist" element={<GroupList />} />
                <Route path="/dashboard/schedule" element={<Schedule />} />
            </Routes>
        </Router>
    );
}

export default App;