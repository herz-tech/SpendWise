import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./MainLayout.css";

function MainLayout({ theme, toggleTheme }) {
  return (
    <div className="main-layout" data-theme={theme}>
      <Sidebar />

      <main className="main-content">
        <div className="content-topbar">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;