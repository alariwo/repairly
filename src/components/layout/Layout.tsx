
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'super-admin' | 'admin' | 'technician';
}

const Layout = ({ children, userRole = 'admin' }: LayoutProps) => {
  // For demo purposes, we're using a simple state to toggle between roles
  // In a real app, this would come from an authentication system
  const [role, setRole] = useState(userRole);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* 
            Demo role switcher - in a real app, this would not exist
            and the role would be determined by authentication
          */}
          <div className="mb-2 flex justify-end">
            <select 
              className="text-xs border p-1 rounded bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as 'super-admin' | 'admin' | 'technician')}
            >
              <option value="super-admin">Super Admin View</option>
              <option value="admin">Admin View</option>
              <option value="technician">Technician View</option>
            </select>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
