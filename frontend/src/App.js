import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import UserListing from './components/UserListing';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/users" element={<UserListing />} />
                <Route path="/" element={<Navigate to="/register" />} />
            </Routes>
        </Router>
    );
}

export default App;
