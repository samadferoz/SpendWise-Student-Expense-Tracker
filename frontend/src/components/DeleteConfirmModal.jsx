import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, expense, isDeleting }) => {
  if (!isOpen || !expense) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 id="delete-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb7185' }}>
            <AlertTriangle size={20} />
            <span>Confirm Deletion</span>
          </h3>
          <button
            type="button"
            className="btn-icon-only"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Are you sure you want to permanently delete this expense from your IBM Cloudant database?
          </p>

          <div
            style={{
              background: 'rgba(11, 17, 32, 0.7)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{expense.title}</span>
              <span style={{ fontWeight: 700, color: '#fb7185' }}>{formatINR(expense.amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>{expense.category}</span>
              <span>{formatDate(expense.date)}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem', wordBreak: 'break-all' }}>
              Cloudant ID: <code>{expense._id}</code>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            id="cancel-delete-btn"
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(expense)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Expense</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
