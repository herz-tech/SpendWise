
import { useEffect, useState } from "react";
import "./Transactions.css";

async function readResponse(response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Invalid server response. Check that your backend is running and the API route exists."
    );
  }
}

const categories = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Salary",
  "Freelance",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

const categoryIcons = {
  Food: "🍽️",
  Shopping: "🛍️",
  Travel: "✈️",
  Bills: "🧾",
  Salary: "💼",
  Freelance: "💻",
  Education: "📚",
  Health: "💊",
  Entertainment: "🎬",
  Other: "📌",
};

function Transactions({ onTransactionsChanged }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [popup, setPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const token = localStorage.getItem("token");

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not load transactions");
      }

      setTransactions(data);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });
  };

  // Add or update transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing
          ? `http://localhost:5000/api/transactions/${editingId}`
          : "http://localhost:5000/api/transactions",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            amount: Number(formData.amount),
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Transaction could not be saved");
      }

      resetForm();
      setIsError(false);
setMessage("");
setPopup(true);

      await fetchTransactions();
      onTransactionsChanged?.();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  // Edit transaction
  const handleEdit = (transaction) => {
    setEditingId(transaction._id);

    setFormData({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date).toISOString().split("T")[0],
      note: transaction.note || "",
    });

    setMessage("");
    setIsError(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    resetForm();
    setMessage("");
  };

  // Delete transaction
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/transactions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data.message || "Could not delete transaction");
      }

      setIsError(false);
      setMessage("Transaction deleted successfully!");

      await fetchTransactions();
      onTransactionsChanged?.();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  // Search, filter and sort
  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch = transaction.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        transaction.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

  const incomeCount = transactions.filter(
    (item) => item.type === "income"
  ).length;

  const expenseCount = transactions.filter(
    (item) => item.type === "expense"
  ).length;

  return (
    <section className="transactions-section">

      {/* Page heading */}
      <div className="transactions-topline">
        <div className="section-heading">
          <span className="transactions-eyebrow">
            MONEY MANAGEMENT / ACTIVITY
          </span>
          <h2>Transactions<span>.</span></h2>
          <p>Every rupee has a story. Keep yours organized.</p>
        </div>

        <div className="transaction-count">
          <span className="count-icon">📋</span>
          <div>
            <strong>{transactions.length}</strong>
            <span>Total records</span>
          </div>
        </div>
      </div>

      {/* Quick transaction overview */}
      <div className="transaction-overview">
        <div className="overview-item">
          <span className="overview-icon income-icon">↘</span>
          <div>
            <span>Income entries</span>
            <strong>{incomeCount}</strong>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-icon expense-icon">↗</span>
          <div>
            <span>Expense entries</span>
            <strong>{expenseCount}</strong>
          </div>
        </div>

        <div className="overview-item">
          <span className="overview-icon total-icon">▤</span>
          <div>
            <span>Showing</span>
            <strong>{filteredTransactions.length} records</strong>
          </div>
        </div>
      </div>

      {/* Add transaction form */}
      <div className="transaction-form-card" id="transaction-form">

        <div className="transaction-card-heading">
          <div>
            <span className="form-eyebrow">
              {editingId ? "UPDATE RECORD" : "NEW ENTRY"}
            </span>
            <h3>
              {editingId ? "Edit transaction" : "Add a transaction"}
            </h3>
            <p>
              {editingId
                ? "Make changes to your existing record."
                : "Record your income or expenses in one place."}
            </p>
          </div>

          <span className="form-heading-icon">＋</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="transaction-form-grid">

            <div className="transaction-field">
              <label htmlFor="transaction-title">Transaction title</label>
              <input
                id="transaction-title"
                type="text"
                name="title"
                placeholder="e.g. Grocery shopping"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-field">
              <label htmlFor="transaction-amount">Amount (₹)</label>
              <input
                id="transaction-amount"
                type="number"
                name="amount"
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-field">
              <label htmlFor="transaction-type">Transaction type</label>
              <select
                id="transaction-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div className="transaction-field">
              <label htmlFor="transaction-category">Category</label>
              <select
                id="transaction-category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryIcons[category]} {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="transaction-field">
              <label htmlFor="transaction-date">Date</label>
              <input
                id="transaction-date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="transaction-field">
              <label htmlFor="transaction-note">Note (optional)</label>
              <input
                id="transaction-note"
                type="text"
                name="note"
                placeholder="Add a little detail..."
                value={formData.note}
                onChange={handleChange}
              />
            </div>
    
          </div>

          <div className="transaction-form-actions">
            <button
              type="submit"
              className="add-transaction-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Save changes  →"
                : "＋  Add transaction"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-edit-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          
          </div>
        </form>
        <center>
         {popup && (
  <div className="transaction-popup-overlay">
    <div className="transaction-popup">
      <div className="transaction-popup-icon">✓</div>
      <h2>Transaction Added!</h2>
      <p>Your transaction has been added successfully.</p>
      <button
        type="button"
        className="transaction-popup-btn"
        onClick={() => setPopup(false)}
      >
        Done
      </button>
    </div>
  </div>
)}</center>
      </div>

      {/* Transaction list */}
      <div className="transaction-list-card">

        <div className="transaction-list-heading">
          <div>
            <span className="form-eyebrow">YOUR MONEY TRAIL</span>
            <h3>All transactions</h3>
            <p>Search, sort and manage your records.</p>
          </div>

          <span className="list-count">
            {filteredTransactions.length} found
          </span>
        </div>

        {/* Filters */}
        <div className="transaction-filters">

          <div className="search-field">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search by transaction name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search transactions"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by transaction type"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort transactions"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

        </div>

        {loading ? (
          <div className="transaction-loading">
            <span className="loading-spinner"></span>
            <p>Loading your transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="empty-transactions">
            <span className="empty-icon">▤</span>
            <h4>No transactions found</h4>
            <p>
              {transactions.length === 0
                ? "Add your first transaction to get started."
                : "Try changing your search or filter settings."}
            </p>
          </div>
        ) : (
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>AMOUNT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction._id}>

                    <td>
                      <div className="transaction-title-cell">
                        <span className="category-icon">
                          {categoryIcons[transaction.category] || "📌"}
                        </span>
                        <div>
                          <strong>{transaction.title}</strong>
                          {transaction.note && (
                            <span className="transaction-note">
                              {transaction.note}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="category-name">
                        {transaction.category}
                      </span>
                    </td>

                    <td className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </td>

                    <td>
                      <span
                        className={`type-label ${transaction.type}`}
                      >
                        <span className="type-dot"></span>
                        {transaction.type}
                      </span>
                    </td>

                    <td>
                      <strong className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === "income" ? "+" : "−"}
                        {formatCurrency(transaction.amount)}
                      </strong>
                    </td>

                    <td>
                      <div className="transaction-actions">
                        <button
                          className="edit-transaction-button"
                          onClick={() => handleEdit(transaction)}
                          aria-label={`Edit ${transaction.title}`}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-transaction-button"
                          onClick={() => handleDelete(transaction._id)}
                          aria-label={`Delete ${transaction.title}`}
                        >
                          Delete
                        </button>
                        
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
     
    </section>
  );
}

export default Transactions;
