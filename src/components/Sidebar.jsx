
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <h2 className="sidebar-logo">
        SpendWise<span>.</span>
      </h2>

      <nav>
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? "active" : ""}>
          Dashboard
        </NavLink>

        <NavLink to="/transactions" className={({ isActive }) => isActive ? "active" : ""}>
          Transactions
        </NavLink>

        <NavLink to="/budgets" className={({ isActive }) => isActive ? "active" : ""}>
          Budgets
        </NavLink>

        <NavLink to="/reports" className={({ isActive }) => isActive ? "active" : ""}>
          Reports
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
          Profile
        </NavLink>
      

      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
