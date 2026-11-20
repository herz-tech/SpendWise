
import { useState } from "react";
import "./Analytics.css";

function Analytics({ transactions = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);

    // Use local date parts to match the selected calendar month
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}` === selectedMonth;
  });

  const income = monthlyTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const savings = income - expenses;
  const highestAmount = Math.max(income, expenses, 1);

  const categoryTotals = monthlyTransactions
    .filter((item) => item.type === "expense")
    .reduce((result, item) => {
      const category = item.category || "Other";
      result[category] = (result[category] || 0) + Number(item.amount);
      return result;
    }, {});

  const categories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  return (
    <section className="analytics-section">
      <div className="analytics-heading">
        <div>
          <h2>Monthly Analytics</h2>
          <p>Understand your income and spending habits.</p>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          aria-label="Select analytics month"
        />
      </div>

      <div className="analytics-summary">
        <div className="analytics-card">
          <p>Monthly Income</p>
          <h3 className="income-text">{formatCurrency(income)}</h3>
        </div>

        <div className="analytics-card">
          <p>Monthly Expenses</p>
          <h3 className="expense-text">{formatCurrency(expenses)}</h3>
        </div>

        <div className="analytics-card">
          <p>Monthly Savings</p>
          <h3 className={savings >= 0 ? "income-text" : "expense-text"}>
            {formatCurrency(savings)}
          </h3>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-panel">
          <h3>Income vs Expenses</h3>

          <div className="comparison-chart">
            <div className="chart-row">
              <span>Income</span>
              <div className="chart-track">
                <div
                  className="chart-bar income-bar"
                  style={{
                    width: `${(income / highestAmount) * 100}%`,
                  }}
                />
              </div>
              <strong>{formatCurrency(income)}</strong>
            </div>

            <div className="chart-row">
              <span>Expenses</span>
              <div className="chart-track">
                <div
                  className="chart-bar expense-bar"
                  style={{
                    width: `${(expenses / highestAmount) * 100}%`,
                  }}
                />
              </div>
              <strong>{formatCurrency(expenses)}</strong>
            </div>
          </div>
        </div>

        <div className="analytics-panel">
          <h3>Expenses by Category</h3>

          {categories.length === 0 ? (
            <p className="analytics-empty">
              No expense data for this month.
            </p>
          ) : (
            <div className="category-breakdown">
              {categories.map((category) => (
                <div className="category-item" key={category.name}>
                  <div className="category-info">
                    <span>{category.name}</span>
                    <strong>{formatCurrency(category.amount)}</strong>
                  </div>

                  <div className="chart-track">
                    <div
                      className="chart-bar category-bar"
                      style={{
                        width: `${(category.amount / expenses) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Analytics;
