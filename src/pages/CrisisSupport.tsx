import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Phone, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

const CrisisSupport: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [contactPreference, setContactPreference] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Lifeline",
      number: "988",
      description: "24/7 crisis support for suicidal thoughts"
    },
    {
      name: "Crisis Text Line",
      number: "Text HOME to 741741",
      description: "24/7 text-based crisis support"
    },
    {
      name: "Emergency Services",
      number: "911",
      description: "For immediate life-threatening emergencies"
    },
    {
      name: "Campus Counseling Center",
      number: "(555) 123-4567",
      description: "24/7 campus crisis hotline"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!description.trim() || !priority || !contactPreference) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('crisis_support_requests')
        .insert({
          user_id: user.id,
          description: description.trim(),
          priority: priority as 'low' | 'medium' | 'high' | 'urgent',
          contact_preference: contactPreference,
          location: location || null,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Support Request Submitted",
        description: "Your crisis support request has been submitted. Our team will respond immediately.",
      });

      // Reset form
      setDescription('');
      setPriority('');
      setContactPreference('');
      setLocation('');

    } catch (error) {
      console.error('Error submitting crisis request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again or call emergency services.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Crisis Support
            </h1>
            <p className="text-muted-foreground">
              Immediate help and emergency resources when you need them most
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Emergency Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>If you're in immediate danger or having thoughts of self-harm, please call 911 or go to your nearest emergency room immediately.</strong>
              <br />
              For non-emergency crisis support, you can also call 988 (Suicide & Crisis Lifeline) available 24/7.
            </AlertDescription>
          </Alert>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Emergency Contacts */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Emergency Contacts
              </h2>
              
              <div className="space-y-4">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{contact.name}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => window.open(`tel:${contact.number.replace(/[^\d]/g, '')}`)}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    </div>
                    <p className="text-lg font-bold text-primary mb-1">{contact.number}</p>
                    <p className="text-xs text-muted-foreground">{contact.description}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Crisis Support Request Form */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Request Support
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Priority Level *
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - General support needed</SelectItem>
                      <SelectItem value="medium">Medium - Moderate distress</SelectItem>
                      <SelectItem value="high">High - Significant distress</SelectItem>
                      <SelectItem value="urgent">Urgent - Immediate intervention needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe Your Situation *
                  </label>
                  <Textarea
                    placeholder="Please describe what you're experiencing and how we can help..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred Contact Method *
                  </label>
                  <Select value={contactPreference} onValueChange={setContactPreference}>
                    <SelectTrigger>
                      <SelectValue placeholder="How should we contact you?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="in-person">In-Person Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Current Location (Optional)
                  </label>
                  <Input
                    placeholder="e.g., Dormitory, Campus Library, Home..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This helps us provide location-appropriate support
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Request Support'}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Response Times:</span>
                </div>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• Urgent: Immediate response (within 5 minutes)</li>
                  <li>• High: Within 15 minutes</li>
                  <li>• Medium: Within 1 hour</li>
                  <li>• Low: Within 4 hours</li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Self-Help Resources */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Immediate Self-Help Techniques</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3 text-primary">Breathing Exercises</h3>
                <div className="space-y-2 text-sm">
                  <p>1. <strong>Box Breathing:</strong> Inhale for 4, hold for 4, exhale for 4, hold for 4</p>
                  <p>2. <strong>4-7-8 Breathing:</strong> Inhale for 4, hold for 7, exhale for 8</p>
                  <p>3. <strong>Deep Belly Breathing:</strong> Place hand on chest, one on belly. Breathe so only the belly hand moves</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3 text-primary">Grounding Techniques</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>5-4-3-2-1 Technique:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>5 things you can see</li>
                    <li>4 things you can touch</li>
                    <li>3 things you can hear</li>
                    <li>2 things you can smell</li>
                    <li>1 thing you can taste</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CrisisSupport;