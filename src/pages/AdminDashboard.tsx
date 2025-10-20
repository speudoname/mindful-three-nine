import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Users, BookOpen, Shield, DollarSign, Search, CheckCircle, XCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // State for different sections
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [meditations, setMeditations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalMeditations: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast.error("Access denied: Super Admin role required");
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadDashboardData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/");
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      setUsers(usersData || []);

      // Load teachers
      const { data: teachersData } = await supabase
        .from("teachers")
        .select("*, profiles(email, full_name)")
        .order("created_at", { ascending: false });

      setTeachers(teachersData || []);

      // Load courses
      const { data: coursesData } = await supabase
        .from("courses")
        .select("*, teachers(profiles(full_name)), categories(name)")
        .order("created_at", { ascending: false });

      setCourses(coursesData || []);

      // Load meditations
      const { data: meditationsData } = await supabase
        .from("standalone_meditations")
        .select("*, teachers(profiles(full_name)), categories(name)")
        .order("created_at", { ascending: false });

      setMeditations(meditationsData || []);

      // Update stats
      setStats({
        totalUsers: usersData?.length || 0,
        totalTeachers: teachersData?.filter(t => t.is_approved).length || 0,
        totalCourses: coursesData?.filter(c => c.is_published).length || 0,
        totalMeditations: meditationsData?.filter(m => m.is_published).length || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      const { error } = await supabase
        .from("teachers")
        .update({ is_approved: true })
        .eq("id", teacherId);

      if (error) throw error;
      toast.success("Teacher approved!");
      loadDashboardData();
    } catch (error) {
      console.error("Error approving teacher:", error);
      toast.error("Failed to approve teacher");
    }
  };

  const handleUpdateTokenCost = async (
    entityType: "course" | "meditation",
    entityId: string,
    newCost: number
  ) => {
    try {
      const table = entityType === "course" ? "courses" : "standalone_meditations";
      const { error } = await supabase
        .from(table)
        .update({ token_cost: newCost })
        .eq("id", entityId);

      if (error) throw error;
      toast.success("Token cost updated!");
      loadDashboardData();
    } catch (error) {
      console.error("Error updating token cost:", error);
      toast.error("Failed to update token cost");
    }
  };

  const handleTogglePublish = async (
    entityType: "course" | "meditation",
    entityId: string,
    currentStatus: boolean
  ) => {
    try {
      const table = entityType === "course" ? "courses" : "standalone_meditations";
      const { error } = await supabase
        .from(table)
        .update({ is_published: !currentStatus })
        .eq("id", entityId);

      if (error) throw error;
      toast.success(currentStatus ? "Unpublished" : "Published");
      loadDashboardData();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error("Failed to update publish status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Super Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, content, and platform settings
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Teachers</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Meditations</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeditations}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="teachers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="meditations">Meditations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Teachers Tab */}
          <TabsContent value="teachers">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Management</CardTitle>
                <CardDescription>Approve or manage teacher accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>{teacher.profiles?.full_name || "N/A"}</TableCell>
                        <TableCell>{teacher.profiles?.email}</TableCell>
                        <TableCell>
                          {teacher.is_approved ? (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {!teacher.is_approved && (
                            <Button
                              size="sm"
                              onClick={() => handleApproveTeacher(teacher.id)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Manage courses and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Token Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.teachers?.profiles?.full_name}</TableCell>
                        <TableCell>
                          {course.is_published ? (
                            <Badge variant="secondary">Published</Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            defaultValue={course.token_cost}
                            className="w-20"
                            onBlur={(e) =>
                              handleUpdateTokenCost("course", course.id, parseInt(e.target.value) || 0)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={course.is_published ? "outline" : "default"}
                            onClick={() => handleTogglePublish("course", course.id, course.is_published)}
                          >
                            {course.is_published ? "Unpublish" : "Publish"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meditations Tab */}
          <TabsContent value="meditations">
            <Card>
              <CardHeader>
                <CardTitle>Meditation Management</CardTitle>
                <CardDescription>Manage standalone meditations and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Token Cost</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meditations.map((meditation) => (
                      <TableRow key={meditation.id}>
                        <TableCell className="font-medium">{meditation.title}</TableCell>
                        <TableCell>{meditation.teachers?.profiles?.full_name}</TableCell>
                        <TableCell>{meditation.duration_minutes} min</TableCell>
                        <TableCell>
                          {meditation.is_published ? (
                            <Badge variant="secondary">Published</Badge>
                          ) : (
                            <Badge variant="outline">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            defaultValue={meditation.token_cost}
                            className="w-20"
                            onBlur={(e) =>
                              handleUpdateTokenCost(
                                "meditation",
                                meditation.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={meditation.is_published ? "outline" : "default"}
                            onClick={() =>
                              handleTogglePublish("meditation", meditation.id, meditation.is_published)
                            }
                          >
                            {meditation.is_published ? "Unpublish" : "Publish"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name || "N/A"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.user_roles?.map((ur: any) => (
                            <Badge key={ur.role} variant="outline" className="mr-1">
                              {ur.role}
                            </Badge>
                          ))}
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
