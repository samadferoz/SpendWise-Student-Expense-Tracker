import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import CloudantBanner from './components/CloudantBanner';
import ExpenseFilters from './components/ExpenseFilters';
import ExpenseTable from './components/ExpenseTable';
import ExpenseFormModal from './components/ExpenseFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import NotificationToast from './components/NotificationToast';
import api from './services/api';

export function App() {
  // Database & server state
  const [dbStatus, setDbStatus] = useState({
    configured: false,
    connected: false,
    dbName: 'spendwise_db'
  });

  // Expenses & dashboard metrics state
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    todayExpenses: 0,
    monthlyExpenses: 0,
    transactionCount: 0
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date-desc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Auto-dismiss notification after 4.5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [notification, dismissNotification]);

  // Check backend health & Cloudant status
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      if (res && res.database) {
        setDbStatus(res.database);
      }
    } catch (err) {
      console.warn('Backend health check error:', err.message);
      setDbStatus((prev) => ({
        ...prev,
        connected: false,
        message: 'Could not connect to backend server'
      }));
    }
  }, []);

  // Fetch all transactions from Cloudant
  const loadTransactions = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.getTransactions();
      if (res.success) {
        setExpenses(res.data || []);
        if (res.summary) {
          setSummary(res.summary);
        }
      }
    } catch (err) {
      console.error('Failed to load transactions:', err.message);
      if (err.status === 503) {
        // Cloudant is not yet configured with credentials
        showNotification(
          'error',
          'IBM Cloudant credentials not configured in backend/.env. See setup banner.'
        );
      } else {
        showNotification('error', err.message || 'Error fetching transactions from Cloudant');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [showNotification]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await checkHealth();
      await loadTransactions();
    };
    init();
  }, [checkHealth, loadTransactions]);

  // Recalculate summary metrics dynamically from full database records
  const updateSummaryFromList = (items) => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const monthPrefix = now.toISOString().slice(0, 7);

    let total = 0;
    let today = 0;
    let monthly = 0;

    for (const item of items) {
      const amt = Number(item.amount) || 0;
      total += amt;
      if (item.date === todayStr) today += amt;
      if (item.date && item.date.startsWith(monthPrefix)) monthly += amt;
    }

    setSummary({
      totalExpenses: Math.round(total * 100) / 100,
      todayExpenses: Math.round(today * 100) / 100,
      monthlyExpenses: Math.round(monthly * 100) / 100,
      transactionCount: items.length
    });
  };

  // Open modal for Adding an Expense
  const handleOpenAddModal = () => {
    setExpenseToEdit(null);
    setIsFormModalOpen(true);
  };

  // Open modal for Editing an Expense
  const handleOpenEditModal = (expense) => {
    setExpenseToEdit(expense);
    setIsFormModalOpen(true);
  };

  // Close form modal
  const handleCloseFormModal = () => {
    if (!isSubmitting) {
      setIsFormModalOpen(false);
      setExpenseToEdit(null);
    }
  };

  // Create or Update Expense submission handler
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (expenseToEdit) {
        // Update existing expense in Cloudant (pass current _rev)
        const res = await api.updateTransaction(expenseToEdit._id, {
          ...formData,
          _rev: expenseToEdit._rev
        });

        if (res.success && res.data) {
          const updatedList = expenses.map((item) =>
            item._id === res.data._id ? res.data : item
          );
          setExpenses(updatedList);
          updateSummaryFromList(updatedList);
          showNotification('success', `Updated "${formData.title}" in IBM Cloudant`);
          handleCloseFormModal();
        }
      } else {
        // Create new expense in Cloudant
        const res = await api.createTransaction(formData);
        if (res.success && res.data) {
          const updatedList = [res.data, ...expenses];
          setExpenses(updatedList);
          updateSummaryFromList(updatedList);
          showNotification('success', `Saved "${formData.title}" to IBM Cloudant`);
          handleCloseFormModal();
        }
      }
      // Re-sync health status
      checkHealth();
    } catch (err) {
      console.error('Save error:', err);
      showNotification('error', err.message || 'Failed to save expense to IBM Cloudant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prompt confirmation for deletion
  const handlePromptDelete = (expense) => {
    setExpenseToDelete(expense);
  };

  // Confirm delete handler
  const handleConfirmDelete = async (expense) => {
    setIsDeleting(true);
    try {
      const res = await api.deleteTransaction(expense._id, expense._rev);
      if (res.success) {
        const updatedList = expenses.filter((item) => item._id !== expense._id);
        setExpenses(updatedList);
        updateSummaryFromList(updatedList);
        showNotification('success', `Deleted "${expense.title}" from IBM Cloudant`);
        setExpenseToDelete(null);
        checkHealth();
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('error', err.message || 'Failed to delete expense from Cloudant');
    } finally {
      setIsDeleting(false);
    }
  };

  // Refresh data trigger
  const handleRefresh = async () => {
    await checkHealth();
    await loadTransactions(true);
    showNotification('info', 'Synchronized with IBM Cloudant');
  };

  // Filtered and sorted expenses list
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Search query filter (title or description)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          (exp.description && exp.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(
        (exp) => exp.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'amount-asc') {
        return Number(a.amount) - Number(b.amount);
      }
      return 0;
    });

    return result;
  }, [expenses, searchQuery, selectedCategory, sortBy]);

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All';

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        dbStatus={dbStatus}
        onOpenAddModal={handleOpenAddModal}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* IBM Cloudant Status / Guidance Banner */}
        <CloudantBanner dbStatus={dbStatus} onRetry={handleRefresh} />

        {/* Dashboard 4 Metric Cards */}
        <DashboardStats summary={summary} />

        {/* Search, Filter & Sort Toolbar */}
        <ExpenseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />

        {/* Expenses Data Table */}
        <ExpenseTable
          expenses={filteredExpenses}
          isLoading={isLoading}
          isFiltered={isFiltered}
          onEdit={handleOpenEditModal}
          onDelete={handlePromptDelete}
          onOpenAddModal={handleOpenAddModal}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div>
            <strong>SpendWise</strong> — Student Expense Tracker &bull; College Mini Project
          </div>
          <div className="footer-tags">
            <span className="tech-tag">React 18</span>
            <span className="tech-tag">Vite</span>
            <span className="tech-tag">Node.js Express</span>
            <span className="tech-tag">IBM Cloudant NoSQL</span>
            <span className="tech-tag">Docker Compose</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        expenseToEdit={expenseToEdit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={handleConfirmDelete}
        expense={expenseToDelete}
        isDeleting={isDeleting}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={notification}
        onDismiss={dismissNotification}
      />
    </div>
  );
}

export default App;
