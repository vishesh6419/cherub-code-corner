import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Users, 
  AlertTriangle,
  Heart,
  Activity,
  Phone,
  Settings,
  TrendingUp,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading, isAuthenticated } = useAuthState();
  const stats = useDashboardStats();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const quickActions = [
    {
      title: "AI Mental Health Support",
      description: "Get immediate support and coping strategies",
      icon: Brain,
      color: "text-blue-500",
      action: () => navigate("/ai-support"),
      urgent: false
    },
    {
      title: "Book Counselor Appointment",
      description: "Schedule a session with a professional counselor",
      icon: Calendar,
      color: "text-green-500",
      action: () => navigate("/appointments"),
      urgent: false
    },
    {
      title: "Crisis Support",
      description: "Immediate help for urgent situations",
      icon: AlertTriangle,
      color: "text-red-500",
      action: () => navigate("/crisis-support"),
      urgent: true
    },
    {
      title: "Peer Support Forum",
      description: "Connect with other students anonymously",
      icon: Users,
      color: "text-purple-500",
      action: () => navigate("/forum"),
      urgent: false
    },
    {
      title: "Mental Health Resources",
      description: "Videos, articles, and wellness guides",
      icon: BookOpen,
      color: "text-orange-500",
      action: () => navigate("/resources"),
      urgent: false
    },
    {
      title: "Take Assessment",
      description: "Check your mental health status",
      icon: Activity,
      color: "text-teal-500",
      action: () => navigate("/assessment"),
      urgent: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || user?.email}</h1>
              <p className="text-muted-foreground mt-1">
                {profile?.college_name && `${profile.college_name} • `}
                {profile?.department && `${profile.department} • `}
                <Badge variant="secondary" className="ml-1">
                  {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) || 'Student'}
                </Badge>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Profile
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Your mental health matters</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-destructive/10 border-l-4 border-destructive p-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">In case of emergency</p>
              <p className="text-sm text-muted-foreground">
                Call National Suicide Prevention Lifeline: <span className="font-mono">988</span> or 
                Campus Emergency: <span className="font-mono">911</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                action.urgent ? 'ring-2 ring-destructive/20 bg-destructive/5' : ''
              }`}
              onClick={action.action}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    {action.urgent && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        Urgent
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">AI Conversations</p>
                  <p className="text-2xl font-bold">
                    {stats.loading ? '...' : stats.aiConversations}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Appointments</p>
                  <p className="text-2xl font-bold">
                    {stats.loading ? '...' : stats.appointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Resources Viewed</p>
                  <p className="text-2xl font-bold">
                    {stats.loading ? '...' : stats.resourcesViewed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Forum Posts</p>
                  <p className="text-2xl font-bold">
                    {stats.loading ? '...' : stats.forumPosts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent interactions with the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.aiConversations > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI conversation started</p>
                    <p className="text-xs text-muted-foreground">Available for support anytime</p>
                  </div>
                </div>
              )}
              
              {stats.resourcesViewed > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mental health resources accessed</p>
                    <p className="text-xs text-muted-foreground">Keep exploring helpful content</p>
                  </div>
                </div>
              )}
              
              {stats.appointments > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Appointment scheduled</p>
                    <p className="text-xs text-muted-foreground">Professional support arranged</p>
                  </div>
                </div>
              )}
              
              {stats.assessmentsTaken > 0 && (
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Activity className="h-4 w-4 text-teal-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Mental health assessment completed</p>
                    <p className="text-xs text-muted-foreground">Track your wellness journey</p>
                  </div>
                </div>
              )}

              {!stats.loading && stats.aiConversations === 0 && stats.appointments === 0 && stats.forumPosts === 0 && stats.assessmentsTaken === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Start Your Wellness Journey</h3>
                  <p className="text-muted-foreground mb-4">
                    Take your first step towards better mental health
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button size="sm" onClick={() => navigate('/ai-support')}>
                      <Brain className="w-4 h-4 mr-2" />
                      Try AI Support
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/assessment')}>
                      <Activity className="w-4 h-4 mr-2" />
                      Take Assessment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}