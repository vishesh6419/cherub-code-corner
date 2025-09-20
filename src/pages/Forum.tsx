import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, Heart, Clock, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthState } from '@/hooks/useAuthState';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string | null;
  is_anonymous: boolean;
  replies_count: number;
  likes_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

const Forum: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // New post form
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'General Support',
    'Anxiety & Stress',
    'Depression & Mood', 
    'Academic Pressure',
    'Relationships',
    'Sleep Issues',
    'Self-Care Tips',
    'Success Stories',
    'Crisis Support'
  ];

  useEffect(() => {
    if (!loading && user) {
      fetchPosts();
    }
  }, [user, loading]);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no posts exist, create some sample ones
      if (!data || data.length === 0) {
        await createSamplePosts();
        return;
      }

      setPosts((data || []) as unknown as ForumPost[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSamplePosts = async () => {
    const samplePosts = [
      {
        title: "Tips for managing exam anxiety",
        content: "I wanted to share some techniques that have really helped me during exam season. Deep breathing exercises, creating a study schedule, and taking regular breaks have made a huge difference...",
        category: "Anxiety & Stress",
        is_anonymous: true,
        user_id: user?.id
      },
      {
        title: "How I improved my sleep schedule",
        content: "After struggling with insomnia for months, I finally found a routine that works. Setting a consistent bedtime, avoiding screens an hour before sleep, and creating a calming environment has changed everything...",
        category: "Sleep Issues",
        is_anonymous: false,
        user_id: user?.id
      },
      {
        title: "Feeling overwhelmed with coursework",
        content: "This semester has been incredibly challenging and I'm finding it hard to keep up with everything. Does anyone have advice on time management or dealing with academic pressure?",
        category: "Academic Pressure",
        is_anonymous: true,
        user_id: user?.id
      }
    ];

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert(samplePosts)
        .select(`
          *,
          profiles(full_name)
        `);

      if (error) throw error;
      setPosts((data || []) as unknown as ForumPost[]);
    } catch (error) {
      console.error('Error creating sample posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = async () => {
    if (!user || isSubmitting) return;

    if (!newPostTitle.trim() || !newPostContent.trim() || !newPostCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          category: newPostCategory,
          is_anonymous: isAnonymous,
          user_id: user.id
        })
        .select(`
          *,
          profiles(full_name)
        `)
        .single();

      if (error) throw error;

      setPosts(prev => [data as unknown as ForumPost, ...prev]);
      
      // Reset form
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('');
      setIsAnonymous(true);
      setShowNewPost(false);

      toast({
        title: "Post Created",
        description: "Your post has been shared with the community",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Anonymous Forum</h1>
            <p className="text-muted-foreground">
              A safe space to share experiences and support each other
            </p>
          </div>
          
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    placeholder="What would you like to discuss?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <Textarea
                    placeholder="Share your thoughts, experiences, or questions..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <label htmlFor="anonymous" className="text-sm">
                    Post anonymously (recommended for privacy)
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Posting...' : 'Create Post'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading posts...</div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No posts found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to start a conversation!
              </p>
              <Button onClick={() => setShowNewPost(true)}>
                Create First Post
              </Button>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {post.is_anonymous ? 'Anonymous' : post.profiles?.full_name || 'User'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(post.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {post.category && (
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-lg mb-3 hover:text-primary transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.replies_count || 0} replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes_count || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>Click to view</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;