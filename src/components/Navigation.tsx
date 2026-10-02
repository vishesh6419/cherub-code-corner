import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  Calendar,
  BookOpen,
  Users,
  AlertTriangle,
  Activity,
  User,
  Home,
  Gamepad2,
  Menu,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useAuthState } from '@/hooks/useAuthState';
import ThemeToggle from '@/components/ThemeToggle';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthState();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Brain, label: 'AI Support', path: '/ai-support' },
    { icon: Calendar, label: 'Appointments', path: '/book-appointment' },
    { icon: Activity, label: 'Assessment', path: '/assessment' },
    { icon: AlertTriangle, label: 'Crisis Support', path: '/crisis-support' },
    { icon: BookOpen, label: 'Resources', path: '/resources' },
    { icon: Users, label: 'Forum', path: '/forum' },
    { icon: Gamepad2, label: 'Relax Zone', path: '/relax' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Stethoscope, label: 'Virtual Clinic', path: '/provider-registration' },
  ];

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Desktop Navigation
  const DesktopNav = () => (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-primary">Mental Health Platform</h2>
            <div className="flex items-center gap-1">
              {navItems.slice(0, 9).map((item) => (
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

      {/* Top-right menu button + slide-out panel (all screen sizes) */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-primary">Mental Health Platform</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={active ? 'secondary' : 'ghost'}
                    onClick={() => go(item.path)}
                    className="justify-start gap-3"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ThemeToggle showLabel />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden">
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
