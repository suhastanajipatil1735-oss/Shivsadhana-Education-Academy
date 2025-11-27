import React from 'react';
import { Screen } from '../types';
import { LogOut, Home, UserPlus, Users, Bell, Trash2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen, onLogout }) => {
  const navItems = [
    { id: Screen.DASHBOARD, label: 'Dashboard', icon: Home },
    { id: Screen.ADD_STUDENT, label: 'Add Student', icon: UserPlus },
    { id: Screen.VIEW_STUDENTS, label: 'View All', icon: Users },
    { id: Screen.FEES_REMINDER, label: 'Reminders', icon: Bell },
    { id: Screen.REMOVE_STUDENTS, label: 'Remove', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* Top Header */}
      <header className="bg-brand-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(Screen.DASHBOARD)}>
            <div className="bg-white/10 p-2 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-wide hidden sm:block">Shivsadhana Academy</h1>
            <h1 className="text-lg font-bold tracking-wide sm:hidden">Shivsadhana</h1>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm"
          >
            <span>Logout</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      {/* Bottom Navigation for Mobile / Sidebar for Desktop approach could go here, 
          but for simplicity we'll use a top sub-nav or just dashboard buttons.
          Let's use a Sticky Bottom Nav for mobile and generic tabs for desktop. */}
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-brand-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Padding for bottom nav on mobile */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default Layout;