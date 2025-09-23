import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Users, 
  AlertTriangle,
  Activity,
  User,
  Home,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthState } from '@/hooks/useAuthState';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthState();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Brain, label: 'AI Support', path: '/ai-support' },
    { icon: Calendar, label: 'Appointments', path: '/book-appointment' },
    { icon: Activity, label: 'Assessment', path: '/assessment' },
    { icon: AlertTriangle, label: 'Crisis Support', path: '/crisis-support' },
    { icon: BookOpen, label: 'Resources', path: '/resources' },
    { icon: Users, label: 'Forum', path: '/forum' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  // Desktop Navigation
  const DesktopNav = () => (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-primary">Mental Health Platform</h2>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2 px-3"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      <DesktopNav />
      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 h-auto py-2 px-2 text-xs"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-[10px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navigation;