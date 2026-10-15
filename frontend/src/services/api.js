/**
 * Centralized API service for communicating with the SpendWise backend.
 * Uses native fetch API with standard JSON handling and error extraction.
 */

const API_BASE = '/api';

/**
 * Helper to process fetch responses and extract meaningful error messages.
 */
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { message: await response.text() };
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
      `Request failed with status ${response.status}`;

    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /**
   * Health check to inspect backend and Cloudant connectivity.
   */
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  /**
   * Fetch all expense transactions, with optional search and category filters.
   */
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/transactions${queryString}`);
    return handleResponse(res);
  },

  /**
   * Fetch a single transaction document by Cloudant ID.
   */
  async getTransactionById(id) {
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`);
    return handleResponse(res);
  },

  /**
   * Record a new expense transaction.
   */
  async createTransaction(transactionData) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return handleResponse(res);
  },

  /**
   * Update an existing expense transaction (including _rev).
   */
  async updateTransaction(id, transactionData) {
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return handleResponse(res);
  },

  /**
   * Delete an expense transaction by ID and revision.
   */
  async deleteTransaction(id, rev) {
    const query = rev ? `?rev=${encodeURIComponent(rev)}` : '';
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(id)}${query}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  }
};

export default api;
