import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Play } from "lucide-react";
import Navigation from "@/components/Navigation";
import { PremiumBadge } from "@/components/PremiumBadge";

export default function Courses() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [meditations, setMeditations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      setCategories(categoriesData || []);

      // Load published courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select(`
          *,
          categories(name, icon),
          teachers(id, user_id, profiles(full_name))
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setCourses(coursesData || []);

      // Load published meditations
      const { data: meditationsData } = await supabase
        .from("standalone_meditations")
        .select(`
          *,
          categories(name, icon),
          teachers(id, user_id, profiles(full_name))
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      setMeditations(meditationsData || []);
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredMeditations = meditations.filter((meditation) => {
    const matchesSearch = meditation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meditation.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || meditation.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Guided Meditation</h1>
          <p className="text-muted-foreground">
            Explore courses and standalone meditations
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses and meditations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="meditations">Standalone Meditations</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No courses found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        {course.categories?.icon && (
                          <span className="text-2xl">{course.categories.icon}</span>
                        )}
                      </div>
                      <CardDescription className="line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                          <span className="text-muted-foreground">
                            By {course.teachers?.profiles?.full_name || "Unknown"}
                          </span>
                          <div className="flex items-center gap-2">
                            <PremiumBadge tokenCost={course.token_cost} compact />
                            {course.categories && (
                              <Badge variant="secondary">{course.categories.name}</Badge>
                            )}
                          </div>
                        </div>
                        <Button className="w-full" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Start Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="meditations">
            {filteredMeditations.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No meditations found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredMeditations.map((meditation) => (
                  <Card
                    key={meditation.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/meditations/${meditation.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="line-clamp-2">{meditation.title}</CardTitle>
                        {meditation.categories?.icon && (
                          <span className="text-2xl">{meditation.categories.icon}</span>
                        )}
                      </div>
                      <CardDescription className="line-clamp-3">
                        {meditation.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                          <span className="text-muted-foreground">
                            {meditation.duration_minutes} minutes
                          </span>
                          <div className="flex items-center gap-2">
                            <PremiumBadge tokenCost={meditation.token_cost} compact />
                            {meditation.categories && (
                              <Badge variant="secondary">{meditation.categories.name}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          By {meditation.teachers?.profiles?.full_name || "Unknown"}
                        </div>
                        <Button className="w-full" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Play
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
