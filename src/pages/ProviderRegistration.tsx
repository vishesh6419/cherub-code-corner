import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuthState } from "@/hooks/useAuthState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Stethoscope, Loader2, ShieldCheck } from "lucide-react";

const professions = [
  { value: "psychologist", label: "Psychologist" },
  { value: "counselor", label: "Counselor" },
  { value: "therapist", label: "Therapist" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "clinical_doctor", label: "Clinical Doctor" },
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{10,15}$/, "Enter a valid phone number"),
  profession: z.enum(["psychologist", "counselor", "therapist", "psychiatrist", "clinical_doctor"]),
  qualification: z.string().trim().max(200).optional(),
  clinic_name: z.string().trim().max(160).optional(),
  experience_years: z.coerce.number().min(0).max(60),
  specialization: z.string().trim().max(300).optional(),
  languages: z.string().trim().max(200).optional(),
  bio: z.string().trim().min(20, "Tell students a little more about you (20+ characters)").max(1000),
  certification_url: z.string().trim().url("Enter a valid link").optional().or(z.literal("")),
});

export default function ProviderRegistration() {
  const { user, loading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "counselor",
    qualification: "",
    clinic_name: "",
    experience_years: "1",
    specialization: "",
    languages: "English, Hindi",
    bio: "",
    certification_url: "",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/auth");
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email ?? "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("providers").insert({
      user_id: user!.id,
      name: d.name,
      email: d.email,
      phone: d.phone,
      profession: d.profession,
      qualification: d.qualification || null,
      clinic_name: d.clinic_name || null,
      experience_years: d.experience_years,
      specialization: d.specialization
        ? d.specialization.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      languages: d.languages
        ? d.languages.split(",").map((s) => s.trim()).filter(Boolean)
        : ["English"],
      bio: d.bio,
      certification_url: d.certification_url || null,
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Could not create your clinic",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    await supabase.from("profiles").update({ role: "provider" }).eq("user_id", user!.id);

    toast({
      title: "Virtual clinic created",
      description: "Your profile is pending verification. You'll get the blue badge once approved.",
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pt-24">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Stethoscope className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Create Your Own Virtual Clinic</h1>
          <p className="mt-2 text-muted-foreground">
            Join the Campus Care directory and support students across partner institutions.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Provider details</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verified providers get a blue badge next to their name.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Provider name *</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address *</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" required />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession / specialty *</Label>
                  <Select value={form.profession} onValueChange={(v) => set("profession", v)}>
                    <SelectTrigger id="profession">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {professions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input id="qualification" value={form.qualification} onChange={(e) => set("qualification", e.target.value)} placeholder="M.Phil Clinical Psychology" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience_years">Years of experience *</Label>
                  <Input id="experience_years" type="number" min={0} max={60} value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} required />
                  {errors.experience_years && <p className="text-xs text-destructive">{errors.experience_years}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic / practice name</Label>
                  <Input id="clinic_name" value={form.clinic_name} onChange={(e) => set("clinic_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages (comma separated)</Label>
                  <Input id="languages" value={form.languages} onChange={(e) => set("languages", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Areas of focus (comma separated)</Label>
                <Input id="specialization" value={form.specialization} onChange={(e) => set("specialization", e.target.value)} placeholder="Anxiety, Exam stress, Sleep" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional bio *</Label>
                <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} required />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certification_url">Certification link (optional)</Label>
                <Input id="certification_url" value={form.certification_url} onChange={(e) => set("certification_url", e.target.value)} placeholder="https://drive.google.com/..." />
                {errors.certification_url && <p className="text-xs text-destructive">{errors.certification_url}</p>}
                <p className="text-xs text-muted-foreground">
                  Share a public link to your degree, licence or registration certificate for faster verification.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create my virtual clinic
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
