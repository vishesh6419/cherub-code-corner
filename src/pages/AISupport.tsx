import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AIChat from '@/components/chat/AIChat';
import { useAuthState } from '@/hooks/useAuthState';

const AISupport: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Mental Health Support</h1>
            <p className="text-muted-foreground">
              Get compassionate guidance and support anytime you need it
            </p>
          </div>
        </div>

        <AIChat />
      </div>
    </div>
  );
};

export default AISupport;