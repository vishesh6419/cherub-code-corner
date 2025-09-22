import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookOpen, Video, FileText, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface Resource {
  id: string;
  title: string;
  description: string;
  content_type: 'article' | 'video' | 'guide' | 'audio' | 'exercise';
  content_url: string | null;
  content_text: string | null;
  category: string | null;
  tags: string[] | null;
  views_count: number;
  is_featured: boolean;
  language: string;
  created_at: string;
}

const Resources: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'Anxiety Management',
    'Depression Support', 
    'Stress Relief',
    'Sleep Health',
    'Mindfulness',
    'Academic Stress',
    'Relationship Issues',
    'Self-Care',
    'Crisis Resources'
  ];

  const contentTypes = [
    { value: 'article', label: 'Articles', icon: FileText },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'guide', label: 'Guides', icon: BookOpen },
    { value: 'audio', label: 'Audio', icon: BookOpen },
    { value: 'exercise', label: 'Exercises', icon: BookOpen }
  ];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no resources exist, create some sample ones
      if (!data || data.length === 0) {
        await createSampleResources();
        return;
      }

      setResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSampleResources = async () => {
    const sampleResources = [
      {
        title: "Understanding Anxiety: A Comprehensive Guide",
        description: "Learn about anxiety symptoms, causes, and effective coping strategies to manage daily anxiety.",
        content_type: 'article' as const,
        content_text: "Anxiety is a normal human emotion that everyone experiences from time to time...",
        category: "Anxiety Management",
        tags: ["anxiety", "coping", "mental-health"],
        is_featured: true,
        language: "english"
      },
      {
        title: "Mindfulness Meditation for Beginners",
        description: "A guided introduction to mindfulness meditation techniques for stress reduction and mental clarity.",
        content_type: 'video' as const,
        content_url: "https://www.youtube.com/watch?v=example",
        category: "Mindfulness",
        tags: ["mindfulness", "meditation", "stress-relief"],
        is_featured: true,
        language: "english"
      },
      {
        title: "Sleep Hygiene: Creating Healthy Sleep Habits",
        description: "Essential tips and strategies for improving your sleep quality and establishing a healthy sleep routine.",
        content_type: 'article' as const,
        content_text: "Good sleep hygiene is crucial for mental health and academic performance...",
        category: "Sleep Health",
        tags: ["sleep", "health", "routine"],
        is_featured: false,
        language: "english"
      },
      {
        title: "Managing Academic Stress",
        description: "Practical strategies for dealing with academic pressure, deadlines, and exam anxiety.",
        content_type: 'guide',
        content_url: "#",
        category: "Academic Stress",
        tags: ["academic", "stress", "study-tips"],
        is_featured: false,
        language: "english"
      }
    ];

    try {
      const { data, error } = await supabase
        .from('resources')
        .insert(sampleResources as any)
        .select();

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error creating sample resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(term) ||
        resource.description.toLowerCase().includes(term) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // Filter by content type
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.content_type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handleResourceClick = async (resource: Resource) => {
    // Increment view count
    try {
      await supabase
        .from('resources')
        .update({ views_count: (resource.views_count || 0) + 1 })
        .eq('id', resource.id);

      // Update local state
      setResources(prev => 
        prev.map(r => 
          r.id === resource.id 
            ? { ...r, views_count: (r.views_count || 0) + 1 }
            : r
        )
      );
    } catch (error) {
      console.error('Error updating view count:', error);
    }

    // Show content in modal or navigate
    if (resource.content_text) {
      // Create a modal dialog to show the content
      toast({
        title: resource.title,
        description: "Content loaded. Check the resource details.",
      });
    } else if (resource.content_url) {
      window.open(resource.content_url, '_blank');
    } else {
      toast({
        title: "Content Available",
        description: "This resource content would be displayed in a detailed view.",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = contentTypes.find(t => t.value === type);
    const IconComponent = typeConfig?.icon || FileText;
    return <IconComponent className="w-4 h-4" />;
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
            <h1 className="text-2xl font-bold text-foreground">Resource Library</h1>
            <p className="text-muted-foreground">
              Educational content and self-help materials for mental wellness
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Featured Resources */}
        {filteredResources.some(r => r.is_featured) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Featured Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter(resource => resource.is_featured)
                .map((resource) => (
                  <Card 
                    key={resource.id} 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.content_type)}
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{resource.category}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{resource.views_count || 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedCategory === 'all' ? 'All Resources' : selectedCategory}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading resources...</div>
            </div>
          ) : filteredResources.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No resources found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources
                .filter(resource => !resource.is_featured || selectedCategory !== 'all' || selectedType !== 'all' || searchTerm)
                .map((resource) => (
                  <Card 
                    key={resource.id} 
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(resource.content_type)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {resource.content_type}
                        </Badge>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4">
                      {resource.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{resource.category}</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{resource.views_count || 0}</span>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resources;