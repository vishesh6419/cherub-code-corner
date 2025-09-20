import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface Question {
  id: number;
  question: string;
  options: { value: number; label: string }[];
}

const Assessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<'select' | 'questions' | 'results'>('select');
  const [selectedAssessment, setSelectedAssessment] = useState<string>('');
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Sample assessment types and questions
  const assessmentTypes = [
    {
      id: 'anxiety',
      title: 'Anxiety Assessment (GAD-7)',
      description: 'Measures anxiety levels over the past two weeks',
      duration: '5-10 minutes'
    },
    {
      id: 'depression',
      title: 'Depression Screening (PHQ-9)',
      description: 'Screens for depression symptoms',
      duration: '5-10 minutes'
    },
    {
      id: 'stress',
      title: 'Stress Level Assessment',
      description: 'Evaluates current stress levels and coping',
      duration: '10-15 minutes'
    }
  ];

  const questions: { [key: string]: Question[] } = {
    anxiety: [
      {
        id: 1,
        question: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 2,
        question: "Over the last 2 weeks, how often have you been bothered by not being able to stop or control worrying?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 3,
        question: "Over the last 2 weeks, how often have you been bothered by worrying too much about different things?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 4,
        question: "Over the last 2 weeks, how often have you been bothered by trouble relaxing?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 5,
        question: "Over the last 2 weeks, how often have you been bothered by being so restless that it's hard to sit still?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      }
    ],
    depression: [
      {
        id: 1,
        question: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 2,
        question: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 3,
        question: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      },
      {
        id: 4,
        question: "Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?",
        options: [
          { value: 0, label: "Not at all" },
          { value: 1, label: "Several days" },
          { value: 2, label: "More than half the days" },
          { value: 3, label: "Nearly every day" }
        ]
      }
    ],
    stress: [
      {
        id: 1,
        question: "How often have you felt that you were unable to control the important things in your life?",
        options: [
          { value: 0, label: "Never" },
          { value: 1, label: "Almost never" },
          { value: 2, label: "Sometimes" },
          { value: 3, label: "Fairly often" },
          { value: 4, label: "Very often" }
        ]
      },
      {
        id: 2,
        question: "How often have you felt confident about your ability to handle your personal problems?",
        options: [
          { value: 4, label: "Never" },
          { value: 3, label: "Almost never" },
          { value: 2, label: "Sometimes" },
          { value: 1, label: "Fairly often" },
          { value: 0, label: "Very often" }
        ]
      },
      {
        id: 3,
        question: "How often have you felt that things were going your way?",
        options: [
          { value: 4, label: "Never" },
          { value: 3, label: "Almost never" },
          { value: 2, label: "Sometimes" },
          { value: 1, label: "Fairly often" },
          { value: 0, label: "Very often" }
        ]
      }
    ]
  };

  const currentQuestions = questions[selectedAssessment] || [];

  const calculateResults = (totalScore: number, assessmentType: string) => {
    let severity = 'low';
    let message = '';
    let recommendations = [];

    if (assessmentType === 'anxiety') {
      if (totalScore <= 4) {
        severity = 'low';
        message = 'Minimal anxiety levels detected.';
        recommendations = [
          'Continue with healthy lifestyle practices',
          'Regular exercise and mindfulness can help maintain low anxiety',
          'Consider joining wellness activities'
        ];
      } else if (totalScore <= 9) {
        severity = 'medium';
        message = 'Mild anxiety levels detected.';
        recommendations = [
          'Consider stress reduction techniques',
          'Try mindfulness or meditation',
          'Speak with a counselor if symptoms persist'
        ];
      } else {
        severity = 'high';
        message = 'Moderate to severe anxiety levels detected.';
        recommendations = [
          'Consider speaking with a mental health professional',
          'Book an appointment with our counselors',
          'Practice relaxation techniques daily'
        ];
      }
    } else if (assessmentType === 'depression') {
      if (totalScore <= 4) {
        severity = 'low';
        message = 'Minimal depression symptoms detected.';
        recommendations = [
          'Maintain social connections',
          'Keep up with regular activities you enjoy',
          'Continue healthy sleep and exercise habits'
        ];
      } else if (totalScore <= 9) {
        severity = 'medium';
        message = 'Mild depression symptoms detected.';
        recommendations = [
          'Consider talking to someone you trust',
          'Engage in activities you previously enjoyed',
          'Consider professional support if symptoms continue'
        ];
      } else {
        severity = 'high';
        message = 'Moderate to severe depression symptoms detected.';
        recommendations = [
          'Please consider speaking with a mental health professional',
          'Book an appointment with our counselors',
          'Reach out to friends, family, or support groups'
        ];
      }
    } else {
      // Stress assessment
      if (totalScore <= 6) {
        severity = 'low';
        message = 'Low stress levels detected.';
        recommendations = [
          'Continue with current coping strategies',
          'Maintain work-life balance',
          'Keep up with regular self-care'
        ];
      } else if (totalScore <= 12) {
        severity = 'medium';
        message = 'Moderate stress levels detected.';
        recommendations = [
          'Consider stress management techniques',
          'Try time management strategies',
          'Make time for relaxation activities'
        ];
      } else {
        severity = 'high';
        message = 'High stress levels detected.';
        recommendations = [
          'Consider professional stress management support',
          'Book an appointment with our counselors',
          'Practice daily stress reduction techniques'
        ];
      }
    }

    return { severity, message, recommendations };
  };

  const handleSubmit = async () => {
    if (!user || isSubmitting) return;

    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const assessmentResults = calculateResults(totalScore, selectedAssessment);

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mental_health_assessments')
        .insert({
          user_id: user.id,
          assessment_type: selectedAssessment,
          responses: answers,
          total_score: totalScore,
          severity_level: assessmentResults.severity,
          risk_level: assessmentResults.severity === 'high' ? 'high' : assessmentResults.severity === 'medium' ? 'medium' : 'low',
          notes: notes || null
        });

      if (error) throw error;

      setResults({
        score: totalScore,
        maxScore: currentQuestions.length * Math.max(...currentQuestions[0].options.map(o => o.value)),
        ...assessmentResults
      });

      setCurrentStep('results');

      toast({
        title: "Assessment Completed",
        description: "Your assessment has been saved and results are ready.",
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
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
            <h1 className="text-2xl font-bold text-foreground">Mental Health Assessment</h1>
            <p className="text-muted-foreground">
              Self-assessment tools to help understand your mental wellness
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold mb-2">Choose an Assessment</h2>
                <p className="text-muted-foreground">
                  Select the assessment that best matches what you'd like to evaluate
                </p>
              </div>
              
              {assessmentTypes.map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className={`p-6 cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedAssessment === assessment.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedAssessment(assessment.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{assessment.title}</h3>
                      <p className="text-muted-foreground mb-2">{assessment.description}</p>
                      <p className="text-sm text-muted-foreground">Duration: {assessment.duration}</p>
                    </div>
                    {selectedAssessment === assessment.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </Card>
              ))}

              <Button
                onClick={() => setCurrentStep('questions')}
                disabled={!selectedAssessment}
                className="w-full mt-6"
              >
                Start Assessment
              </Button>
            </div>
          )}

          {currentStep === 'questions' && (
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">
                    {assessmentTypes.find(a => a.id === selectedAssessment)?.title}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {Object.keys(answers).length} / {currentQuestions.length}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / currentQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-8">
                {currentQuestions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <h3 className="font-medium text-lg">
                      {index + 1}. {question.question}
                    </h3>
                    
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => setAnswers(prev => ({
                        ...prev,
                        [question.id]: parseInt(value)
                      }))}
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value.toString()} id={`q${question.id}-${option.value}`} />
                          <Label htmlFor={`q${question.id}-${option.value}`} className="flex-1">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="space-y-4">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional context or information you'd like to share..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep('select');
                      setAnswers({});
                      setNotes('');
                    }}
                  >
                    Back
                  </Button>
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== currentQuestions.length || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Assessment'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 'results' && results && (
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  results.severity === 'high' ? 'bg-red-100 text-red-600' :
                  results.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {results.severity === 'high' ? 
                    <AlertTriangle className="w-8 h-8" /> :
                    <CheckCircle2 className="w-8 h-8" />
                  }
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Assessment Complete</h2>
                <p className="text-lg text-muted-foreground">{results.message}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Your Score</h3>
                <div className="text-3xl font-bold text-primary">
                  {results.score} / {results.maxScore}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Severity Level: <span className="font-medium capitalize">{results.severity}</span>
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Recommendations</h3>
                <ul className="space-y-2">
                  {results.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Based on your results, consider taking these actions to support your mental wellness:
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/book-appointment')}
                  >
                    Book Counselor
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/resources')}
                  >
                    View Resources
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('select');
                    setSelectedAssessment('');
                    setAnswers({});
                    setNotes('');
                    setResults(null);
                  }}
                >
                  Take Another Assessment
                </Button>
                
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Return to Dashboard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assessment;