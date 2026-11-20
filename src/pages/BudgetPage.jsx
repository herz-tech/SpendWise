import { useEffect, useState } from "react";
import Budget from "../components/Budget";
import CategoryBudgets from "../components/CategoryBudgets";

function BudgetPage() {
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/transactions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load transactions");
        }

        setTransactions(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="budgets-page">
      <Budget transactions={transactions} />
      <CategoryBudgets transactions={transactions} />
    </div>
  );
}

export default BudgetPage;