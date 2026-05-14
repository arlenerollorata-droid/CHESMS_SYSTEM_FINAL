import React, { useState } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

function Layout({ title, subtitle, actions, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="admin">
      <div 
        className={`sidebar__overlay ${isSidebarOpen ? "open" : ""}`} 
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <Sidebar isOpen={isSidebarOpen} />
      <main className="admin__content">
        <TopNavbar onMenuClick={toggleSidebar} />
        <div className="admin__body">
          <div className="admin__body-inner">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                {typeof title === 'string' ? (
                  <h1 className="page-header__title">{title}</h1>
                ) : (
                  <div className="page-header__title-container">{title}</div>
                )}
                {subtitle && <div className="page-header__subtitle">{subtitle}</div>}
              </div>
              {actions && <div className="page-header__actions">{actions}</div>}
            </header>
            <section>{children}</section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
