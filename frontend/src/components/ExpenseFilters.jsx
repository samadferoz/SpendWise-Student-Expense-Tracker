import React from 'react';
import { Search, X, Filter, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';

export const ExpenseFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  onClearFilters
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All';

  return (
    <div className="toolbar-card">
      {/* Search Input */}
      <div className="search-box-wrapper">
        <Search size={18} className="search-input-icon" />
        <input
          id="search-expense-input"
          type="text"
          className="search-input"
          placeholder="Search expenses by title or note..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="btn-icon-only"
            onClick={() => onSearchChange('')}
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category & Sorting Controls */}
      <div className="filter-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            id="category-filter-select"
            className="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by Category"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowUpDown size={16} color="var(--text-muted)" />
          <select
            id="sort-select"
            className="category-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Transactions"
          >
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="amount-desc">Highest Amount (₹)</option>
            <option value="amount-asc">Lowest Amount (₹)</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            id="clear-filters-btn"
            type="button"
            className="btn btn-secondary"
            onClick={onClearFilters}
            style={{ fontSize: '0.85rem', padding: '0.65rem 0.9rem' }}
          >
            <X size={15} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseFilters;
