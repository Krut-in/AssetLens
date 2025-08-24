import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./theme-toggle";
import GoogleSignInButton from "./google-signin-button";

export default function NavbarControls() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <ThemeToggle />
      </div>
    );
  }

  // Debug logging
  console.log("NavbarControls - User data:", {
    isAuthenticated,
    user: user
      ? {
          name: user.name,
          email: user.email,
          image: user.image,
          hasImage: !!user.image,
        }
      : null,
    imageError,
  });

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated && user ? (
        <>
          <div className="hidden md:flex items-center space-x-3">
            {user.image && !imageError ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-8 h-8 rounded-full object-cover border border-border"
                onError={() => {
                  console.log("Image failed to load:", user.image);
                  setImageError(true);
                }}
                onLoad={() => {
                  console.log("Image loaded successfully:", user.image);
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border border-border">
                <span className="text-primary-foreground text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="text-foreground hover:text-primary"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Sign Out
          </Button>
        </>
      ) : (
        <GoogleSignInButton className="text-sm px-4 py-2" />
      )}
      <ThemeToggle />
    </div>
  );
}
