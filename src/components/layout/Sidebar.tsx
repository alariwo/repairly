import React from 'react';
import { cn } from '@/lib/utils';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Clipboard,
  Package,
  FileText,
  Mail,
  Settings,
  LogOut,
  Wrench,
  DollarSign,
  Shield,
  UserCog,
  Menu,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  className?: string;
  userRole?: 'super-admin' | 'admin' | 'technician';
}

const Sidebar = ({ className, userRole = 'admin' }: SidebarProps) => {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/auth'); // Redirect to the login page
  };

  return (
    <>
      {/* Hamburger Icon for Smaller Screens */}
      {isMobile && (
        <div className="sm:hidden p-4 fixed top-0 left-0 z-50">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="text-black focus:outline-none"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Content */}
      {!isMobile || isNavOpen ? (
        <div className={cn('h-screen w-64 bg-repairam flex flex-col text-white', className)}>
          {/* Header Section */}
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <img
                src="/lovable-uploads/90d62439-fa16-4426-8320-82e6ebcbaab1.png"
                alt="RepairAM Logo"
                className="h-8"
              />
            </div>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 px-4 space-y-1">
            {userRole === 'super-admin' && (
              <>
                {/* Super Admin Navigation */}
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Users className="w-5 h-5 mr-3" />
                  Customers
                </NavLink>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Clipboard className="w-5 h-5 mr-3" />
                  Jobs
                </NavLink>
                <NavLink
                  to="/inventory"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Package className="w-5 h-5 mr-3" />
                  Inventory
                </NavLink>
                <NavLink
                  to="/invoices"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Invoices
                </NavLink>
                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Messages
                </NavLink>
                <NavLink
                  to="/accounting"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <DollarSign className="w-5 h-5 mr-3" />
                  Accounting
                </NavLink>
                <NavLink
                  to="/user-management"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <UserCog className="w-5 h-5 mr-3" />
                  User Management
                </NavLink>
              </>
            )}

            {userRole === 'admin' && (
              <>
                {/* Admin Navigation */}
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Home className="w-5 h-5 mr-3" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/customers"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Users className="w-5 h-5 mr-3" />
                  Customers
                </NavLink>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Clipboard className="w-5 h-5 mr-3" />
                  Jobs
                </NavLink>
                <NavLink
                  to="/inventory"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Package className="w-5 h-5 mr-3" />
                  Inventory
                </NavLink>
                <NavLink
                  to="/invoices"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Invoices
                </NavLink>
                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Mail className="w-5 h-5 mr-3" />
                  Messages
                </NavLink>
                <NavLink
                  to="/user-management"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <UserCog className="w-5 h-5 mr-3" />
                  User Management
                </NavLink>
              </>
            )}

            {userRole === 'technician' && (
              <>
                {/* Technician Navigation */}
                <NavLink
                  to="/technician"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Wrench className="w-5 h-5 mr-3" />
                  My Repairs
                </NavLink>
                <NavLink
                  to="/technician-analytics"
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-4 py-3 rounded-md transition-colors',
                      isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                    )
                  }
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Analytics
                </NavLink>
              </>
            )}
          </nav>

          {/* Footer Section */}
          <div className="p-4 border-t border-repairam-dark">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-3 rounded-md transition-colors',
                  isActive ? 'bg-white text-repairam font-medium' : 'hover:bg-repairam-dark text-white'
                )
              }
            >
              <Settings className="w-5 h-5 mr-3" />
              Settings
            </NavLink>
            <button
              className="flex items-center px-4 py-3 rounded-md hover:bg-repairam-dark text-white w-full mt-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default Sidebar;