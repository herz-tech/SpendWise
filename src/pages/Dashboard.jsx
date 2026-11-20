
import { useEffect, useState } from "react";
import Analytics from "../components/Analytics";
import "./Dashboard.css";
import incomeGirl from "../assets/spendwise-income-girl.png";
import expenseGirl from "../assets/spendwise-expense-girl.png";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");
  const [isBalanceFlipped, setIsBalanceFlipped] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load dashboard data");
      }

      setTransactions(data);
    } catch (error) {
      console.error("Dashboard error:", error.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalIncome = transactions
    .filter((item) => item.type === "income")
    .reduce((total, item) => total + Number(item.amount), 0);

  const totalExpenses = transactions
    .filter((item) => item.type === "expense")
    .reduce((total, item) => total + Number(item.amount), 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount) =>
    amount.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
      ? "Good afternoon"
      : "Good evening";

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div className="dashboard-welcome">
            <span className="dashboard-eyebrow">
              YOUR PERSONAL FINANCE SPACE
            </span>

            <h1>
              {greeting}, {user?.name || "there"} <span>✦</span>
            </h1>

            <p>
              A little clarity today can make a big difference tomorrow.
            </p>
          </div>

          <div className="dashboard-date">
            <span className="date-icon">◷</span>
            <div>
              <small>TODAY</small>
              <strong>
                {today.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
          </div>
        </header>

        <section className="dashboard-overview">
          <div className="overview-heading">
            <div>
              <span className="dashboard-eyebrow">AT A GLANCE</span>
              <h2>Your money overview</h2>
            </div>
            <span className="overview-note">All transactions</span>
          </div>

          <div className="dashboard-cards">

            <div
  className={`dashboard-card balance-card balance-flip-card ${
    isBalanceFlipped ? "is-flipped" : ""
  }`}
  onClick={() => setIsBalanceFlipped((prev) => !prev)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsBalanceFlipped((prev) => !prev);
    }
  }}
  role="button"
  tabIndex={0}
  aria-label={
    isBalanceFlipped
      ? "Hide total balance"
      : "Reveal total balance"
  }
  aria-pressed={isBalanceFlipped}
>
  <div className="balance-flip-inner">

    {/* FRONT - HIDDEN BALANCE */}
    <div className="balance-flip-face balance-front">
      <div className="card-top">
        <div className="card-icon balance-icon">₹</div>
        <span className="card-label">TOTAL BALANCE</span>
        <span className="card-decoration">↻</span>
      </div>

      <p className="card-description">Your available balance</p>
      <h2>₹ ******</h2>

      <div className="card-bottom">
        <span className="card-dot"></span>
        Click to reveal balance
      </div>
    </div>

    {/* BACK - VISIBLE BALANCE */}
    <div className="balance-flip-face balance-back">
      <div className="card-top">
        <div className="card-icon balance-icon">₹</div>
        <span className="card-label">TOTAL BALANCE</span>
        <span className="card-decoration">↻</span>
      </div>

      <p className="card-description">Your available balance</p>
      <h2>{formatCurrency(balance)}</h2>

      <div className="card-bottom">
        <span className="card-dot"></span>
        Click to hide balance
      </div>
    </div>

  </div>
</div>
           {/* INCOME CARD */}
<div className="hover-card-wrap income-wrap">
  <img
    src={incomeGirl}
    alt=""
    className="card-girl income-girl"
  />

  <div className="dashboard-card income-card">
    <div className="card-top">
      <div className="card-icon income-icon">📈</div>
      <span className="card-label">TOTAL INCOME</span>
    </div>

    <p className="card-description">Money coming in</p>
    <h2>{formatCurrency(totalIncome)}</h2>

    <div className="card-bottom">
      <span className="card-dot"></span>
      Keep growing
    </div>
  </div>
</div>

{/* EXPENSE CARD */}
<div className="hover-card-wrap expense-wrap">
  <img
    src={expenseGirl}
    alt=""
    className="card-girl expense-girl"
  />

  <div className="dashboard-card expense-card">
    <div className="card-top">
      <div className="card-icon expense-icon">📉</div>
      <span className="card-label">TOTAL EXPENSES</span>
    </div>

    <p className="card-description">Money going out</p>
    <h2>{formatCurrency(totalExpenses)}</h2>

    <div className="card-bottom">
      <span className="card-dot"></span>
      Spend mindfully
    </div>
  </div>
</div>
          </div>
        </section>

        <section id="analytics" className="dashboard-section">
          <div className="analytics-intro">
            <span className="dashboard-eyebrow">UNDERSTAND YOUR HABITS</span>
            <h2>Your financial activity</h2>
            <p>See where your money goes and how your finances are moving.</p>
          </div>

          <Analytics transactions={transactions} />
        </section>

      </main>
    </div>
  );
}

export default Dashboard;
