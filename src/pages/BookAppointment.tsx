import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface Counselor {
  id: string;
  user_id: string;
  qualification: string;
  specialization: string[];
  experience_years: number;
  is_available: boolean;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [mode, setMode] = useState<string>('in-person');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCounselors, setLoadingCounselors] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      fetchCounselors();
    }
  }, [user, loading]);

  const fetchCounselors = async () => {
    try {
      const { data, error } = await supabase
        .from('counselors')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .eq('is_available', true);

      if (error) throw error;
      setCounselors((data || []) as unknown as Counselor[]);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      toast({
        title: "Error",
        description: "Failed to load counselors",
        variant: "destructive",
      });
    } finally {
      setLoadingCounselors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!selectedCounselor || !appointmentDate || !appointmentTime) {
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
        .from('appointments')
        .insert({
          student_id: user.id,
          counselor_id: selectedCounselor,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          mode,
          student_notes: studentNotes || null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Appointment Requested",
        description: "Your appointment request has been submitted. You'll receive confirmation soon.",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
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

  const today = new Date().toISOString().split('T')[0];

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
            <h1 className="text-2xl font-bold text-foreground">Book Counselor Appointment</h1>
            <p className="text-muted-foreground">
              Schedule a session with our qualified mental health counselors
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Counselor *
                </label>
                {loadingCounselors ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading counselors...
                  </div>
                ) : (
                  <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a counselor" />
                    </SelectTrigger>
                    <SelectContent>
                      {counselors.map((counselor) => (
                        <SelectItem key={counselor.id} value={counselor.id}>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{counselor.profiles?.full_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {counselor.qualification} • {counselor.experience_years} years experience
                              </div>
                              {counselor.specialization && counselor.specialization.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  Specializes in: {counselor.specialization.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={today}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time *
                  </label>
                  <Input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Mode
                </label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-Person</SelectItem>
                    <SelectItem value="video-call">Video Call</SelectItem>
                    <SelectItem value="phone-call">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  placeholder="Share any specific concerns or topics you'd like to discuss..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Important Notes:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Appointments are subject to counselor availability</li>
                  <li>• You'll receive confirmation within 24 hours</li>
                  <li>• Please arrive 10 minutes early for in-person sessions</li>
                  <li>• Cancellations must be made at least 24 hours in advance</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || loadingCounselors}
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;