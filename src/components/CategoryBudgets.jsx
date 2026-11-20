
import { useEffect, useState } from "react";
import "./CategoryBudgets.css";
import API_BASE_URL from "../api";
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

function CategoryBudgets({ transactions = [] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [selectedCategory, setSelectedCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem("token");

  const formatCurrency = (value) =>
    Number(value).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const fetchBudgets = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/category-budgets/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load category budgets.");
      }

      setBudgets(data.budgets || []);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [month]);

  const getSpent = (category) => {
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        const transactionMonth =
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        return (
          transactionMonth === month &&
          transaction.type === "expense" &&
          transaction.category === category
        );
      })
      .reduce((total, transaction) => total + Number(transaction.amount), 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/category-budgets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month,
            category: selectedCategory,
            amount: Number(amount),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save category budget.");
      }

      setIsError(false);
      setMessage(`${selectedCategory} budget saved successfully!`);
      setAmount("");
      await fetchBudgets();
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="category-budget-section">
      <div className="category-budget-heading">
        <div>
          <h2>Category Budgets</h2>
          <p>Control how much you spend in each category.</p>
        </div>

         <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Select budget month"
        />
      </div>

      <div className="category-budget-card">
        <h3>Set a Category Limit</h3>

        <form onSubmit={handleSave} className="category-budget-form">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter limit in ₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Limit"}
          </button>
        </form>

        {message && (
          <p className={isError ? "category-budget-error" : "category-budget-success"}>
            {message}
          </p>
        )}
      </div>

      <div className="category-budget-card">
        <h3>Your Category Spending</h3>

        {loading ? (
          <p>Loading category budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="category-budget-empty">
            No category budgets set for this month yet.
          </p>
        ) : (
          <div className="category-budget-list">
            {budgets.map((budget) => {
              const spent = getSpent(budget.category);
              const remaining = budget.amount - spent;
              const percentage = Math.min(
                (spent / budget.amount) * 100,
                100
              );

              return (
                <div className="category-budget-item" key={budget._id}>
                  <div className="category-budget-info">
                    <strong>{budget.category}</strong>
                    <span>
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>

                  <div className="category-budget-track">
                    <div
                      className={`category-budget-fill ${
                        spent > budget.amount ? "category-over-budget" : ""
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="category-budget-footer">
                    <span>{percentage.toFixed(1)}% used</span>
                    <strong className={remaining >= 0 ? "category-remaining" : "category-exceeded"}>
                      {remaining >= 0
                        ? `${formatCurrency(remaining)} left`
                        : `${formatCurrency(Math.abs(remaining))} over budget`}
                    </strong>
                  </div>

                  {spent >= budget.amount * 0.8 && (
                    <p className="category-budget-warning">
                      {remaining < 0
                        ? "You have exceeded this category's limit!"
                        : "You're approaching this category's limit!"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryBudgets;
