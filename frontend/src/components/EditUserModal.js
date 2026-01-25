import { useEffect, useState } from 'react';
import './EditUserModal.css';

export default function EditUserModal({ isOpen, user, onSave, onCancel, isLoading }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'male',
        hobbies: [],
        photo: null
    });

    const [photoPreview, setPhotoPreview] = useState(null);

    const hobbyOptions = ['Reading', 'Sports', 'Music', 'Cooking', 'Gaming', 'Photography', 'Travel', 'Art'];

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                dob: user.dob ? formatDateForInput(user.dob) : '',
                gender: user.gender || 'male',
                hobbies: user.hobbies || [],
                photo: null
            });
            setPhotoPreview(user.photo || null);
        }
    }, [user, isOpen]);

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

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
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate
        if (!formData.firstName.trim()) {
            alert('First name is required');
            return;
        }
        if (!formData.lastName.trim()) {
            alert('Last name is required');
            return;
        }
        if (!formData.dob) {
            alert('Date of birth is required');
            return;
        }

        // Create FormData for multipart upload
        const form = new FormData();
        form.append('firstName', formData.firstName);
        form.append('lastName', formData.lastName);
        form.append('dob', formData.dob);
        form.append('gender', formData.gender);
        formData.hobbies.forEach(hobby => {
            form.append('hobbies', hobby);
        });
        if (formData.photo) {
            form.append('photo', formData.photo);
        }

        onSave(form);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content edit-modal">
                <div className="modal-header">
                    <h3>Edit User Profile</h3>
                    <button className="close-btn" onClick={onCancel} disabled={isLoading}>&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date of Birth *</label>
                            <input
                                type="datetime-local"
                                name="dob"
                                value={formData.dob}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Gender *</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                disabled={isLoading}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
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
                                        disabled={isLoading}
                                    />
                                    {hobby}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Photo (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            disabled={isLoading}
                        />
                        {photoPreview && (
                            <div className="photo-preview">
                                <img
                                    src={photoPreview}
                                    alt="preview"
                                    style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button 
                            type="button"
                            className="btn btn-cancel" 
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="btn btn-save" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
