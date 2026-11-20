import { useEffect, useState } from "react";
import Analytics from "../components/Analytics";

function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
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

  return <Analytics transactions={transactions} />;
}

export default ReportsPage;