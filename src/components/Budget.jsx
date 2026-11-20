
import { useEffect, useState } from "react";
import "./Budget.css";
import API_BASE_URL from "../api";
function Budget({ transactions = [] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const token = localStorage.getItem("token");

  // Get budget for selected month
  const fetchBudget = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/budgets/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load budget.");
      }

      const amount = data.budget?.amount || 0;
      setSavedBudget(amount);
      setBudget(amount ? String(amount) : "");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [month]);

  // Calculate expenses for selected month
  const monthlyExpenses = transactions
    .filter((transaction) => {
      const date = new Date(transaction.date);
      const transactionMonth =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      return (
        transactionMonth === month &&
        transaction.type === "expense"
      );
    })
    .reduce((total, transaction) => {
      return total + Number(transaction.amount);
    }, 0);

  const remaining = savedBudget - monthlyExpenses;

  const percentage = savedBudget > 0
    ? Math.min((monthlyExpenses / savedBudget) * 100, 100)
    : 0;

  const formatCurrency = (amount) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  // Save budget
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/budgets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            month,
            amount: Number(budget),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save budget.");
      }

      setSavedBudget(Number(data.budget.amount));
      setIsError(false);
      setMessage("Monthly budget saved successfully!");
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="budget-section">
      <div className="budget-heading">
        <div>
          <h2>Monthly Budget</h2>
          <p>Set a spending limit and stay on track.</p>
        </div>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Select budget month"
        />
      </div>

      <div className="budget-card">
        <form onSubmit={handleSave} className="budget-form">
          <label htmlFor="monthly-budget">Your spending limit (₹)</label>

          <div className="budget-input-row">
            <input
              id="monthly-budget"
              type="number"
              min="1"
              step="0.01"
              placeholder="Enter monthly budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
            />

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </form>

        {message && (
          <p className={isError ? "budget-error" : "budget-success"}>
            {message}
          </p>
        )}

        {loading ? (
          <p>Loading budget...</p>
        ) : savedBudget <= 0 ? (
          <p className="budget-empty">
            Set a monthly budget to start tracking your spending.
          </p>
        ) : (
          <div className="budget-progress">
            <div className="budget-stats">
              <div>
                <span>Spent</span>
                <strong>{formatCurrency(monthlyExpenses)}</strong>
              </div>

              <div>
                <span>Budget</span>
                <strong>{formatCurrency(savedBudget)}</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong className={remaining >= 0 ? "remaining-positive" : "remaining-negative"}>
                  {formatCurrency(remaining)}
                </strong>
              </div>
            </div>

            <div className="budget-track">
              <div
                className={`budget-fill ${percentage >= 100 ? "over-budget" : ""}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p className="budget-percentage">
              {percentage.toFixed(1)}% of your budget used
            </p>

            {remaining < 0 && (
              <p className="budget-warning">
                You've exceeded your monthly budget by {formatCurrency(Math.abs(remaining))}.
              </p>
            )}

            {remaining >= 0 && percentage >= 80 && (
              <p className="budget-warning">
                You're approaching your monthly spending limit!
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Budget;
