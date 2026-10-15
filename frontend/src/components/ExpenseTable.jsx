import React from 'react';
import { Pencil, Trash2, Calendar, FileText } from 'lucide-react';
import { formatINR, formatDate, getCategoryMeta } from '../utils/formatters';
import EmptyState from './EmptyState';

export const ExpenseTable = ({
  expenses = [],
  isLoading,
  isFiltered,
  onEdit,
  onDelete,
  onOpenAddModal,
  onClearFilters
}) => {
  if (isLoading) {
    return (
      <div className="table-card">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading expenses from IBM Cloudant...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="table-card">
        <EmptyState
          isFiltered={isFiltered}
          onOpenAddModal={onOpenAddModal}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-header-bar">
        <div className="table-title">
          <span>Expense Records</span>
          <span className="table-count-badge">{expenses.length}</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="expense-table" aria-label="Student Expenses Table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '130px' }}>Date</th>
              <th scope="col">Title & Description</th>
              <th scope="col" style={{ width: '170px' }}>Category</th>
              <th scope="col" style={{ textAlign: 'right', width: '150px' }}>Amount (INR)</th>
              <th scope="col" style={{ textAlign: 'center', width: '110px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item) => {
              const meta = getCategoryMeta(item.category);
              return (
                <tr key={item._id} id={`expense-row-${item._id}`}>
                  {/* Date Column */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </td>

                  {/* Title & Description Column */}
                  <td>
                    <span className="tx-title">{item.title}</span>
                    {item.description ? (
                      <span className="tx-desc" title={item.description}>
                        {item.description}
                      </span>
                    ) : (
                      <span className="tx-desc" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        No notes
                      </span>
                    )}
                  </td>

                  {/* Category Badge Column */}
                  <td>
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: meta.bg,
                        color: meta.text,
                        border: `1px solid ${meta.border}`
                      }}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Amount Column in INR */}
                  <td style={{ textAlign: 'right' }}>
                    <span className="tx-amount">{formatINR(item.amount)}</span>
                  </td>

                  {/* Actions: Edit & Delete */}
                  <td>
                    <div className="tx-actions" style={{ justifyContent: 'center' }}>
                      <button
                        id={`edit-btn-${item._id}`}
                        type="button"
                        className="btn-icon-only edit"
                        onClick={() => onEdit(item)}
                        title="Edit expense"
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        id={`delete-btn-${item._id}`}
                        type="button"
                        className="btn-icon-only delete"
                        onClick={() => onDelete(item)}
                        title="Delete expense"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTable;
