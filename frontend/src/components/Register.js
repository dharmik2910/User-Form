import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './Auth.css';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dob: '',
        gender: 'male',
        hobbies: [],
        photo: null
    });

    const hobbyOptions = ['Reading', 'Sports', 'Music', 'Cooking', 'Gaming', 'Photography', 'Travel', 'Art'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                photo: file
            }));
        }
    };

    const handleHobbyChange = (hobby) => {
        setFormData(prev => ({
            ...prev,
            hobbies: prev.hobbies.includes(hobby)
                ? prev.hobbies.filter(h => h !== hobby)
                : [...prev.hobbies, hobby]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validation
            if (!formData.firstName.trim()) {
                setError('First name is required');
                setLoading(false);
                return;
            }
            if (!formData.lastName.trim()) {
                setError('Last name is required');
                setLoading(false);
                return;
            }
            if (!formData.email.trim()) {
                setError('Email is required');
                setLoading(false);
                return;
            }
            if (!formData.password || formData.password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }
            if (!formData.dob) {
                setError('Date of birth is required');
                setLoading(false);
                return;
            }
            if (!formData.photo) {
                setError('Photo is required');
                setLoading(false);
                return;
            }

            // Create FormData for multipart upload
            const form = new FormData();
            form.append('firstName', formData.firstName);
            form.append('lastName', formData.lastName);
            form.append('email', formData.email);
            form.append('password', formData.password);
            form.append('dob', formData.dob);
            form.append('gender', formData.gender);
            formData.hobbies.forEach(hobby => {
                form.append('hobbies', hobby);
            });
            form.append('photo', formData.photo);

            const response = await api.register(form);

            if (response.message) {
                // Store token
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                alert('Registration successful! Welcome email sent.');
                navigate('/login');
            } else if (response.errors) {
                setError(response.errors[0].msg || 'Registration failed');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            setError('Error during registration: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Date of Birth *</label>
                        <input
                            type="datetime-local"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender *</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleInputChange}
                                />
                                Male
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleInputChange}
                                />
                                Female
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="other"
                                    checked={formData.gender === 'other'}
                                    onChange={handleInputChange}
                                />
                                Other
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Hobbies</label>
                        <div className="checkbox-group">
                            {hobbyOptions.map(hobby => (
                                <label key={hobby} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.hobbies.includes(hobby)}
                                        onChange={() => handleHobbyChange(hobby)}
                                    />
                                    {hobby}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Photo * (Required)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            required
                            id="photo-input"
                        />
                        {formData.photo && (
                            <div className="photo-preview">
                                <img
                                    src={URL.createObjectURL(formData.photo)}
                                    alt="Selected file preview"
                                    className="preview-image"
                                />
                                <p className="photo-name">{formData.photo.name}</p>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
}
