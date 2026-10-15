import React from 'react';
import { IndianRupee, Calendar, BarChart3, Receipt } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const DashboardStats = ({ summary = {} }) => {
  const {
    totalExpenses = 0,
    todayExpenses = 0,
    monthlyExpenses = 0,
    transactionCount = 0
  } = summary;

  return (
    <section className="metrics-grid" aria-label="Dashboard Metrics">
      {/* 1. Total Expenses */}
      <div id="stat-card-total" className="metric-card total">
        <div className="metric-header">
          <span className="metric-title">Total Expenses</span>
          <div className="metric-icon-box">
            <IndianRupee size={22} />
          </div>
        </div>
        <div className="metric-value">{formatINR(totalExpenses)}</div>
        <div className="metric-subtext">All-time recorded spend</div>
      </div>

      {/* 2. Today's Expenses */}
      <div id="stat-card-today" className="metric-card today">
        <div className="metric-header">
          <span className="metric-title">Today's Expenses</span>
          <div className="metric-icon-box">
            <Calendar size={22} />
          </div>
        </div>
        <div className="metric-value">{formatINR(todayExpenses)}</div>
        <div className="metric-subtext">Spent so far today</div>
      </div>

      {/* 3. Monthly Expenses */}
      <div id="stat-card-monthly" className="metric-card monthly">
        <div className="metric-header">
          <span className="metric-title">This Month</span>
          <div className="metric-icon-box">
            <BarChart3 size={22} />
          </div>
        </div>
        <div className="metric-value">{formatINR(monthlyExpenses)}</div>
        <div className="metric-subtext">Current calendar month</div>
      </div>

      {/* 4. Total Transactions */}
      <div id="stat-card-count" className="metric-card count">
        <div className="metric-header">
          <span className="metric-title">Total Transactions</span>
          <div className="metric-icon-box">
            <Receipt size={22} />
          </div>
        </div>
        <div className="metric-value">{transactionCount}</div>
        <div className="metric-subtext">Cloudant document entries</div>
      </div>
    </section>
  );
};

export default DashboardStats;
