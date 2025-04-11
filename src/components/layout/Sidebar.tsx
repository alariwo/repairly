
import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { Home, Users, Clipboard, Package, FileText, Mail, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  return (
    <div className={cn("h-screen w-64 bg-repairam flex flex-col text-white", className)}>
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/90d62439-fa16-4426-8320-82e6ebcbaab1.png" alt="RepairAM Logo" className="h-8" />
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
          end
        >
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        
        <NavLink 
          to="/customers" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <Users className="w-5 h-5 mr-3" />
          Customers
        </NavLink>
        
        <NavLink 
          to="/jobs" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <Clipboard className="w-5 h-5 mr-3" />
          Jobs
        </NavLink>
        
        <NavLink 
          to="/inventory" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <Package className="w-5 h-5 mr-3" />
          Inventory
        </NavLink>
        
        <NavLink 
          to="/invoices" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <FileText className="w-5 h-5 mr-3" />
          Invoices
        </NavLink>
        
        <NavLink 
          to="/messages" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <Mail className="w-5 h-5 mr-3" />
          Messages
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-repairam-dark">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            cn("flex items-center px-4 py-3 rounded-md transition-colors", 
              isActive 
                ? "bg-white text-repairam font-medium" 
                : "hover:bg-repairam-dark text-white"
            )
          }
        >
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </NavLink>
        
        <button className="flex items-center px-4 py-3 rounded-md hover:bg-repairam-dark text-white w-full mt-2">
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
