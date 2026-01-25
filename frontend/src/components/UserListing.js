import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditUserModal from './EditUserModal';
import './UserListing.css';

export default function UserListing() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await api.getUsers(token);
            if (response.users) {
                setUsers(response.users);
            } else {
                setError(response.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Error fetching users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchUsers();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleEdit = async (user) => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.getUserById(user.id, token);
            if (response.user) {
                setEditingUser(response.user);
            } else {
                alert('Failed to load user details');
            }
        } catch (err) {
            alert('Error loading user details: ' + err.message);
        }
    };

    const handleSaveEdit = async (formData) => {
        try {
            setIsModalLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.updateUser(editingUser.id, formData, token);

            if (response.message && response.user) {
                // Update the users list
                setUsers(users.map(u => u.id === response.user.id ? response.user : u));
                setEditingUser(null);
                alert('User updated successfully');
            } else {
                alert(response.message || 'Failed to update user');
            }
        } catch (err) {
            alert('Error updating user: ' + err.message);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleDelete = (user) => {
        setDeletingUser(user);
    };

    const handleConfirmDelete = async () => {
        try {
            setIsModalLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.deleteUser(deletingUser.id, token);

            if (response.message) {
                // Remove user from list
                setUsers(users.filter(u => u.id !== deletingUser.id));
                setDeletingUser(null);
                alert('User deleted successfully');
            } else {
                alert(response.message || 'Failed to delete user');
            }
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        } finally {
            setIsModalLoading(false);
        }
    };

    if (loading) return (
        <div className="container">
            <p className="loading-text">Loading users...</p>
        </div>
    );

    return (
        <div className="container">
            <div className="header">
                <h2>User List</h2>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Gender</th>
                            <th>Date of Birth</th>
                            <th>Hobbies</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No users found</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td className="photo-cell">
                                        <img
                                            src={user.photo}
                                            alt={user.firstName}
                                            className="user-photo"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/50'; }}
                                        />
                                    </td>
                                    <td>{user.firstName}</td>
                                    <td>{user.lastName}</td>
                                    <td>{user.email}</td>
                                    <td className="capitalize">{user.gender}</td>
                                    <td>{new Date(user.dob).toLocaleDateString()}</td>
                                    <td>{user.hobbies && user.hobbies.length > 0 ? user.hobbies.join(', ') : '-'}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() => handleEdit(user)}
                                            title="Edit user"
                                        >
                                            ✎
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDelete(user)}
                                            title="Delete user"
                                        >
                                            🗑
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EditUserModal
                isOpen={!!editingUser}
                user={editingUser}
                onSave={handleSaveEdit}
                onCancel={() => setEditingUser(null)}
                isLoading={isModalLoading}
            />

            <DeleteConfirmationModal
                isOpen={!!deletingUser}
                userName={deletingUser ? `${deletingUser.firstName} ${deletingUser.lastName}` : ''}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingUser(null)}
                isLoading={isModalLoading}
            />
        </div>
    );
}
