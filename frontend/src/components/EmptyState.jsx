import React from 'react';
import { ReceiptText, PlusCircle, SearchX } from 'lucide-react';

export const EmptyState = ({ isFiltered, onOpenAddModal, onClearFilters }) => {
  if (isFiltered) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <SearchX size={32} />
        </div>
        <h3 className="empty-state-title">No matching expenses</h3>
        <p className="empty-state-text">
          No transactions matched your current search and category filters. Try clearing filters or searching for something else.
        </p>
        <button
          id="empty-state-reset-btn"
          type="button"
          className="btn btn-secondary"
          onClick={onClearFilters}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <ReceiptText size={32} />
      </div>
      <h3 className="empty-state-title">No expenses recorded yet</h3>
      <p className="empty-state-text">
        Keep your college budget on track by logging textbooks, cafeteria meals, tuition, and living costs in IBM Cloudant.
      </p>
      <button
        id="empty-state-add-btn"
        type="button"
        className="btn btn-primary"
        onClick={onOpenAddModal}
      >
        <PlusCircle size={18} />
        <span>Add Your First Expense</span>
      </button>
    </div>
  );
};

export default EmptyState;
