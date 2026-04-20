/**
 * Finance Page — Income/Expense Tracker
 * 
 * Features:
 * - Real-time sync with Firestore using Zustand store
 * - Strict structural typing and schema checking using Zod (TransactionModal)
 * - Auto-calculation of Income, Expense, and Balance
 */
import React, { useEffect, useState, useMemo } from 'react';
import { Wallet, Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import useFinanceStore from './hooks/useFinance';
import TransactionModal from './components/TransactionModal';
import './Finance.css';

export default function Finance() {
  const { transactions, loading, initListener, addTransaction, deleteTransaction, cleanup } = useFinanceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    initListener();
    return () => cleanup();
  }, [initListener, cleanup]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      if (t.type === 'expense') exp += t.amount;
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp
    };
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleAddTransaction = async (data) => {
    await addTransaction(data);
  };

  return (
    <div className="feature-page finance-page">
      <header className="feature-page__header finance-page__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="feature-page__icon" style={{ background: 'var(--glass-border)', color: 'var(--accent)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="feature-page__title">Finance Tracker</h1>
            <p className="feature-page__desc">Manage your income, expenses, and budgets securely.</p>
          </div>
        </div>
        <button
          className="finance-page__add-btn"
          onClick={() => setIsModalOpen(true)}
          id="btn-open-txn-modal"
        >
          <Plus size={18} />
          <span>New Transaction</span>
        </button>
      </header>

      {/* Summary Cards */}
      <div className="finance-page__summary">
        <div className="finance-page__stat glass-panel">
          <span className="finance-page__stat-label">Total Balance</span>
          <span className="finance-page__stat-value" style={{ color: balance < 0 ? 'var(--error)' : 'var(--text-main)' }}>
            {formatCurrency(balance)}
          </span>
        </div>
        <div className="finance-page__stat glass-panel">
          <span className="finance-page__stat-label">Income</span>
          <span className="finance-page__stat-value" style={{ color: 'var(--success)' }}>
            +{formatCurrency(totalIncome)}
          </span>
        </div>
        <div className="finance-page__stat glass-panel">
          <span className="finance-page__stat-label">Expenses</span>
          <span className="finance-page__stat-value" style={{ color: 'var(--error)' }}>
            -{formatCurrency(totalExpense)}
          </span>
        </div>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="loading-screen" style={{ minHeight: '300px' }}>
          <div className="loading-spinner" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="feature-page__empty glass-panel">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', padding: '60px 20px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <TrendingUp size={32} style={{ color: 'var(--success)' }} />
              <TrendingDown size={32} style={{ color: 'var(--error)' }} />
            </div>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>No transactions yet</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Start tracking your financial life with standardized categories.
            </p>
            <button className="feature-page__cta" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              <span>Add First Transaction</span>
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="finance-page__list glass-panel">
          <div className="finance-page__list-header">
            <h3>Recent Transactions</h3>
          </div>
          <div className="finance-page__items">
            {transactions.map(txn => (
              <div key={txn.id} className="finance-page__item">
                <div className="finance-page__item-icon" style={{
                  background: txn.type === 'expense' ? 'var(--glass-border)' : 'var(--glass-border)',
                  color: txn.type === 'expense' ? 'var(--error)' : 'var(--success)',
                }}>
                  {txn.type === 'expense' ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                </div>
                <div className="finance-page__item-info">
                  <span className="finance-page__item-cat">{txn.category.replace('_', ' ')}</span>
                  <span className="finance-page__item-date">{txn.date} {txn.description && `· ${txn.description}`}</span>
                </div>
                <div className="finance-page__item-amount" style={{ color: txn.type === 'expense' ? 'var(--error)' : 'var(--success)' }}>
                  {txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount)}
                </div>
                <button
                  className="finance-page__item-del"
                  onClick={() => deleteTransaction(txn.id)}
                  title="Delete Transaction"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTransaction}
      />
    </div>
  );
}
