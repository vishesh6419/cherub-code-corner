import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthState } from "@/hooks/useAuthState";
import { 
  Brain, 
  Heart, 
  Shield, 
  Users, 
  BookOpen, 
  Calendar,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

const Index = () => {
  const { isAuthenticated, loading } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, loading, navigate]);

  const features = [
    {
      icon: Brain,
      title: "AI-Guided First-Aid Support",
      description: "Interactive chatbot offering personalized coping strategies and professional referrals when needed",
      color: "text-blue-500"
    },
    {
      icon: Shield,
      title: "Confidential Booking System",
      description: "Secure appointment scheduling with on-campus counselors and mental health helplines",
      color: "text-green-500"
    },
    {
      icon: BookOpen,
      title: "Psychoeducational Resources",
      description: "Videos, relaxation audio, and mental wellness guides in multiple regional languages",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Peer Support Platform",
      description: "Moderated peer-to-peer support forum with trained student volunteers",
      color: "text-purple-500"
    }
  ];

  const benefits = [
    "Culturally sensitive and regionally appropriate content",
    "Complete anonymity and privacy protection", 
    "24/7 availability for crisis support",
    "Integration with campus counseling services",
    "Evidence-based mental health assessments",
    "Multi-language support for diverse student populations"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-background via-background to-muted/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              Digital Psychological Intervention System
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Your Safe Space for
              <span className="text-primary"> Mental Wellness</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A comprehensive platform designed specifically for college students, providing AI-guided support, 
              professional counseling, peer connections, and educational resources for mental health.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="bg-destructive/10 border-y border-destructive/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-center">
            <Phone className="h-5 w-5 text-destructive" />
            <p className="text-sm">
              <span className="font-semibold text-destructive">Crisis Support:</span> 
              National Suicide Prevention Lifeline: <span className="font-mono">988</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comprehensive Mental Health Support</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform addresses the unique challenges faced by college students with culturally sensitive, 
              evidence-based mental health interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className={`h-12 w-12 mx-auto mb-4 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
              <p className="text-xl text-muted-foreground">
                Built specifically for the unique needs of college students in diverse cultural contexts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Making a Real Impact</h2>
            <p className="text-xl text-muted-foreground">
              Supporting college student mental health across institutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Available Support</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Confidential</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <p className="text-muted-foreground">Languages Supported</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">∞</div>
              <p className="text-muted-foreground">Students Helped</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Take Care of Your Mental Health?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of students who have found support, resources, and community through our platform.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6"
          >
            Start Your Journey <Heart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Mental Health Platform</h3>
              <p className="text-muted-foreground text-sm">
                Supporting college student mental wellness through technology, 
                community, and professional care.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground cursor-pointer hover:text-foreground">Crisis Support</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground">Resources</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground">Contact Counselors</p>
                <p className="text-muted-foreground cursor-pointer hover:text-foreground">Privacy Policy</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Emergency Contacts</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-muted-foreground">Crisis Hotline: 988</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-muted-foreground">support@mentalhealth.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-muted-foreground">Campus Counseling Center</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Mental Health Platform. Built for student welfare and mental wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
