import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth.tsx";
import GroupList from "./components/GroupList.tsx";
import Schedule from "./components/Schedule.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Auth/>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/grouplist" element={<GroupList />} />
                <Route path="/dashboard/schedule" element={<Schedule />} />
                {/* <Route path="/dashboard/grouplist/schedule/:id" element={<Schedule />} /> */}
            </Routes>
        </Router>
    );
}

export default App;