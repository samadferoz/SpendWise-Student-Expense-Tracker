import React, { useState, useEffect } from 'react';
import { X, Save, Plus, AlertCircle, IndianRupee } from 'lucide-react';
import { CATEGORIES, getTodayString } from '../utils/formatters';

export const ExpenseFormModal = ({ isOpen, onClose, onSubmit, expenseToEdit, isSubmitting }) => {
  const isEditMode = Boolean(expenseToEdit);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: CATEGORIES[0],
    date: getTodayString(),
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Reset or pre-populate form when modal opens or expenseToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setFormData({
          title: expenseToEdit.title || '',
          amount: expenseToEdit.amount !== undefined ? String(expenseToEdit.amount) : '',
          category: expenseToEdit.category || CATEGORIES[0],
          date: expenseToEdit.date || getTodayString(),
          description: expenseToEdit.description || ''
        });
      } else {
        setFormData({
          title: '',
          amount: '',
          category: CATEGORIES[0],
          date: getTodayString(),
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, expenseToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters';
    }

    const numAmount = Number(formData.amount);
    if (!formData.amount || isNaN(numAmount)) {
      newErrors.amount = 'Amount is required and must be a number';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0';
    } else if (numAmount > 10000000) {
      newErrors.amount = 'Amount cannot exceed ₹10,000,000';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: formData.title.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      description: formData.description.trim()
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <h3 id="modal-title">
            {isEditMode ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button
            type="button"
            className="btn-icon-only"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="expense-title-input" className="form-label">
                Expense Title <span className="required">*</span>
              </label>
              <input
                id="expense-title-input"
                type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g., Computer Science Textbook, Lunch at Canteen"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                autoFocus
              />
              {errors.title && <p className="form-error-text">{errors.title}</p>}
            </div>

            {/* Amount and Date Grid */}
            <div className="form-grid-2">
              {/* Amount (INR) */}
              <div className="form-group">
                <label htmlFor="expense-amount-input" className="form-label">
                  Amount in INR (₹) <span className="required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      fontWeight: 700
                    }}
                  >
                    ₹
                  </span>
                  <input
                    id="expense-amount-input"
                    type="number"
                    step="0.01"
                    min="1"
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    placeholder="250.00"
                    style={{ paddingLeft: '2.2rem' }}
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', e.target.value)}
                  />
                </div>
                {errors.amount && <p className="form-error-text">{errors.amount}</p>}
              </div>

              {/* Date */}
              <div className="form-group">
                <label htmlFor="expense-date-input" className="form-label">
                  Date <span className="required">*</span>
                </label>
                <input
                  id="expense-date-input"
                  type="date"
                  className={`form-input ${errors.date ? 'error' : ''}`}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                />
                {errors.date && <p className="form-error-text">{errors.date}</p>}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="expense-category-input" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="expense-category-input"
                className={`form-select ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="form-error-text">{errors.category}</p>}
            </div>

            {/* Description / Notes */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="expense-desc-input" className="form-label">
                Description / Notes <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>
              </label>
              <textarea
                id="expense-desc-input"
                className="form-textarea"
                rows={3}
                placeholder="Additional details (e.g., paid via UPI, bought with roommates, semester 5)"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              id="cancel-expense-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              id="submit-expense-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Saving to Cloudant...</span>
                </>
              ) : isEditMode ? (
                <>
                  <Save size={16} />
                  <span>Update Expense</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseFormModal;
