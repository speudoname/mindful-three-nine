import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTokens } from "@/hooks/useTokens";
import { TokenPurchaseDialog } from "./TokenPurchaseDialog";
import { ChevronLeft, Home, Sparkles, BookOpen, TrendingUp, Coins, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation({ showBack = false }: { showBack?: boolean }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { balance, loading: tokensLoading } = useTokens();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-card/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-sacred flex items-center justify-center shadow-glow">
                <span className="text-xl font-bold">9</span>
              </div>
              <h1 className="text-xl font-semibold hidden sm:block">Sacred Practice</h1>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/">
              <Button variant={isActive("/") ? "default" : "ghost"} size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/breathing">
              <Button variant={isActive("/breathing") ? "default" : "ghost"} size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Breathing
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant={isActive("/courses") ? "default" : "ghost"} size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Courses
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant={isActive("/progress") ? "default" : "ghost"} size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Progress
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <TokenPurchaseDialog>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Coins className="h-4 w-4 mr-2 text-primary" />
                {tokensLoading ? '...' : balance}
              </Button>
            </TokenPurchaseDialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{user?.email?.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile & Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/progress")}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progress
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-red-500">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
