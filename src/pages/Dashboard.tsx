import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
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
  Phone
} from "lucide-react";

export default function Dashboard() {
  const { user, profile, loading, isAuthenticated } = useAuthState();
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
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm text-muted-foreground">Your mental health matters</span>
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
                  <p className="text-2xl font-bold">12</p>
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
                  <p className="text-2xl font-bold">3</p>
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
                  <p className="text-2xl font-bold">8</p>
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
                  <p className="text-2xl font-bold">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent interactions with the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Brain className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Started AI conversation about stress management</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <BookOpen className="h-4 w-4 text-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Viewed "Managing Exam Anxiety" resource</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Scheduled appointment with Dr. Smith</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}