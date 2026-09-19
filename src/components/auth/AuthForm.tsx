import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Heart, Shield, Users, BadgeCheck } from "lucide-react";

interface Institution {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  subscription_tier: string;
}

const baseSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [role, setRole] = useState<"student" | "provider">("student");
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    institutionId: "",
    department: "",
    yearOfStudy: "",
    profession: "counselor",
    qualification: "",
    experienceYears: "",
    specialization: "",
    clinicName: "",
    bio: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    supabase
      .from("institutions")
      .select("id, name, city, state, subscription_tier")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setInstitutions((data ?? []) as Institution[]));
  }, []);

  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email.trim(),
        password: signInData.password,
      });
      if (error) {
        toast({
          title: "Login failed",
          description: error.message.includes("Invalid login credentials")
            ? "Invalid email or password. Please try again."
            : error.message,
          variant: "destructive",
        });
        return;
      }
      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = baseSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Check your details",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    if (role === "student" && !form.institutionId) {
      toast({
        title: "Select your institution",
        description: "Students must pick their partner college to continue.",
        variant: "destructive",
      });
      return;
    }

    if (role === "provider" && (!form.qualification.trim() || !form.experienceYears)) {
      toast({
        title: "Professional details needed",
        description: "Add your qualification and years of experience.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const institution = institutions.find((i) => i.id === form.institutionId);

      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            role,
            institution_id: role === "student" ? form.institutionId : null,
            college_name: role === "student" ? institution?.name ?? null : null,
            department: role === "student" ? form.department.trim() : null,
            year_of_study: role === "student" ? form.yearOfStudy : null,
          },
        },
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message.includes("already registered")
            ? "An account with this email already exists. Please sign in instead."
            : error.message,
          variant: "destructive",
        });
        return;
      }

      if (role === "provider" && data.user) {
        const { error: providerError } = await supabase.from("providers").insert({
          user_id: data.user.id,
          name: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          profession: form.profession as
            | "psychologist"
            | "counselor"
            | "therapist"
            | "psychiatrist"
            | "clinical_doctor",
          qualification: form.qualification.trim(),
          experience_years: parseInt(form.experienceYears, 10) || 0,
          specialization: form.specialization
            ? form.specialization.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          clinic_name: form.clinicName.trim() || null,
          bio: form.bio.trim() || null,
        });
        if (providerError) console.error("Provider profile error:", providerError);
      }

      toast({
        title: "Account created",
        description:
          role === "provider"
            ? "Your profile is pending verification. You'll appear in the directory once approved."
            : "Check your email to verify your account, then sign in.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Campus Care</h1>
            <p className="text-xl text-muted-foreground">
              Stigma-free mental health support for your college community
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Heart className="h-5 w-5 text-destructive" />
              <span>AI-guided first-aid support, any time</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span>Verified psychologists and counsellors</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Shield className="h-5 w-5 text-primary" />
              <span>Confidential bookings and records</span>
            </div>
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <Users className="h-5 w-5 text-secondary-foreground" />
              <span>Moderated peer support community</span>
            </div>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Access your account</CardTitle>
            <CardDescription>Sign in or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-role">I am a</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as "student" | "provider")}>
                      <SelectTrigger id="signup-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="provider">Mental Health Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        placeholder="10-digit number"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      minLength={8}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                    />
                  </div>

                  {role === "student" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="signup-institution">Institution</Label>
                        <Select
                          value={form.institutionId}
                          onValueChange={(v) => set("institutionId", v)}
                        >
                          <SelectTrigger id="signup-institution">
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                          <SelectContent>
                            {institutions.map((i) => (
                              <SelectItem key={i.id} value={i.id}>
                                {i.name}
                                {i.city ? ` — ${i.city}` : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Your college subscription unlocks campus providers and resources.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-department">Department</Label>
                          <Input
                            id="signup-department"
                            value={form.department}
                            onChange={(e) => set("department", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-year">Year of Study</Label>
                          <Select
                            value={form.yearOfStudy}
                            onValueChange={(v) => set("yearOfStudy", v)}
                          >
                            <SelectTrigger id="signup-year">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map((y) => (
                                <SelectItem key={y} value={String(y)}>
                                  Year {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-profession">Profession</Label>
                          <Select
                            value={form.profession}
                            onValueChange={(v) => set("profession", v)}
                          >
                            <SelectTrigger id="signup-profession">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="psychologist">Psychologist</SelectItem>
                              <SelectItem value="counselor">Counsellor</SelectItem>
                              <SelectItem value="therapist">Therapist</SelectItem>
                              <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                              <SelectItem value="clinical_doctor">Clinical Doctor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-experience">Experience (years)</Label>
                          <Input
                            id="signup-experience"
                            type="number"
                            min={0}
                            max={60}
                            value={form.experienceYears}
                            onChange={(e) => set("experienceYears", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-qualification">Qualification</Label>
                        <Input
                          id="signup-qualification"
                          placeholder="e.g. M.Phil Clinical Psychology, RCI licensed"
                          value={form.qualification}
                          onChange={(e) => set("qualification", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-specialization">Specialisations</Label>
                        <Input
                          id="signup-specialization"
                          placeholder="Anxiety, Academic stress, Sleep"
                          value={form.specialization}
                          onChange={(e) => set("specialization", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-clinic">Clinic / Hospital (optional)</Label>
                        <Input
                          id="signup-clinic"
                          value={form.clinicName}
                          onChange={(e) => set("clinicName", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-bio">Short bio</Label>
                        <Textarea
                          id="signup-bio"
                          rows={3}
                          value={form.bio}
                          onChange={(e) => set("bio", e.target.value)}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Provider accounts are reviewed before appearing in the student directory.
                      </p>
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
