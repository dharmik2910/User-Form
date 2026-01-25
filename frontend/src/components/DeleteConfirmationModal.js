import './DeleteConfirmationModal.css';

export default function DeleteConfirmationModal({ isOpen, userName, onConfirm, onCancel, isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content delete-modal">
                <div className="modal-header">
                    <h3>Confirm Deletion</h3>
                    <button className="close-btn" onClick={onCancel} disabled={isLoading}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>Are you sure you want to delete <strong>{userName}</strong>?</p>
                    <p className="warning-text">This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                    <button 
                        className="btn btn-cancel" 
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        No, Cancel
                    </button>
                    <button 
                        className="btn btn-delete" 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
