import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, BadgeCheck, Languages, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface Provider {
  id: string;
  name: string;
  profession: string;
  qualification: string | null;
  bio: string | null;
  experience_years: number | null;
  specialization: string[] | null;
  languages: string[] | null;
  session_modes: string[] | null;
  clinic_name: string | null;
  is_verified: boolean;
}

const PROFESSIONS = [
  { value: 'all', label: 'All' },
  { value: 'psychologist', label: 'Psychologists' },
  { value: 'counselor', label: 'Counsellors' },
  { value: 'therapist', label: 'Therapists' },
  { value: 'psychiatrist', label: 'Psychiatrists' },
  { value: 'clinical_doctor', label: 'Clinical Doctors' },
];

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuthState();
  const { toast } = useToast();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [tab, setTab] = useState('all');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [mode, setMode] = useState<string>('video-call');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_available', true)
        .eq('is_verified', true)
        .order('experience_years', { ascending: false });

      if (error) {
        console.error('Error fetching providers:', error);
        toast({
          title: 'Could not load providers',
          description: 'Please refresh the page and try again.',
          variant: 'destructive',
        });
      } else {
        setProviders((data ?? []) as Provider[]);
      }
      setLoadingProviders(false);
    };

    fetchProviders();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!selectedProvider || !appointmentDate || !appointmentTime) {
      toast({
        title: 'Missing information',
        description: 'Pick a provider, a date and a time.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        student_id: user.id,
        provider_id: selectedProvider.id,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        mode,
        student_notes: studentNotes || null,
        status: 'pending',
        institution_subscription_id: profile?.institution_subscription_id ?? null,
      });

      if (error) throw error;

      toast({
        title: 'Session requested',
        description: `${selectedProvider.name} will confirm your booking shortly.`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const visible = tab === 'all' ? providers : providers.filter((p) => p.profession === tab);

  return (
    <div className="min-h-screen bg-gradient-subtle pb-24">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campus Care</h1>
            <p className="text-muted-foreground text-sm">
              Verified psychologists, counsellors and clinicians you can book confidentially.
            </p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="mb-6">
          <TabsList className="flex w-full overflow-x-auto justify-start">
            {PROFESSIONS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="whitespace-nowrap">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {loadingProviders && (
              <Card className="p-6 text-center text-muted-foreground">Loading providers...</Card>
            )}
            {!loadingProviders && visible.length === 0 && (
              <Card className="p-6 text-center text-muted-foreground">
                No verified providers in this category yet.
              </Card>
            )}
            {visible.map((p) => (
              <Card
                key={p.id}
                className={`p-5 cursor-pointer transition-colors ${
                  selectedProvider?.id === p.id ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => setSelectedProvider(p)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p.name}</h3>
                      {p.is_verified && <BadgeCheck className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {p.profession.replace('_', ' ')}
                      {p.qualification ? ` • ${p.qualification}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {p.experience_years ?? 0} yrs
                  </Badge>
                </div>

                {p.bio && <p className="text-sm mt-3 text-muted-foreground">{p.bio}</p>}

                {p.specialization && p.specialization.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.specialization.map((s) => (
                      <Badge key={s} variant="outline">
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}

                {p.languages && p.languages.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Languages className="w-3 h-3" /> {p.languages.join(', ')}
                  </p>
                )}
              </Card>
            ))}
          </div>

          <Card className="p-5 h-fit lg:sticky lg:top-6">
            <h2 className="font-semibold mb-1">Request a session</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedProvider ? `With ${selectedProvider.name}` : 'Select a provider from the list'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" /> Date *
                </label>
                <Input
                  type="date"
                  value={appointmentDate}
                  min={today}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-1" /> Time *
                </label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session mode</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(selectedProvider?.session_modes ?? ['video-call', 'in-person', 'phone-call']).map(
                      (m) => (
                        <SelectItem key={m} value={m}>
                          {m.replace('-', ' ')}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                <Textarea
                  placeholder="Anything you'd like your provider to know beforehand..."
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !selectedProvider || loadingProviders}
              >
                {isSubmitting ? 'Requesting...' : 'Request session'}
              </Button>

              <p className="text-xs text-muted-foreground">
                Your booking stays confidential. You'll get a confirmation once the provider accepts.
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
