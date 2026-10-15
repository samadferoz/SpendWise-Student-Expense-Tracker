import React from 'react';
import { Wallet, Plus, RefreshCw, Database } from 'lucide-react';

export const Navbar = ({ dbStatus, onOpenAddModal, onRefresh, isRefreshing }) => {
  const isConnected = dbStatus?.connected;
  const isConfigured = dbStatus?.configured;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            <Wallet size={24} />
          </div>
          <div className="brand-text">
            <h1>SpendWise</h1>
            <span className="brand-tagline">Student Expense Tracker</span>
          </div>
        </div>

        <div className="nav-actions">
          {/* Cloudant Database Status Pill */}
          <div
            id="cloudant-status-badge"
            className="status-pill"
            title={
              isConnected
                ? `Connected to IBM Cloudant (${dbStatus.dbName || 'spendwise_db'})`
                : isConfigured
                ? 'Cloudant configured, testing connectivity...'
                : 'IBM Cloudant credentials required in backend/.env'
            }
          >
            <span
              className={`status-dot ${isConnected ? 'online' : isConfigured ? 'warning' : 'offline'}`}
            />
            <span>
              {isConnected
                ? 'Cloudant NoSQL'
                : isConfigured
                ? 'Connecting...'
                : 'Cloudant Offline'}
            </span>
          </div>

          {/* Refresh Data Button */}
          <button
            id="refresh-transactions-btn"
            className="btn btn-secondary btn-icon-only"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh transactions from Cloudant"
            aria-label="Refresh transactions"
          >
            <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
          </button>

          {/* Add Expense Action Button */}
          <button
            id="open-add-expense-modal-btn"
            className="btn btn-primary"
            onClick={onOpenAddModal}
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
