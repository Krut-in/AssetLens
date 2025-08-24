import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CombinedReport from "@/components/combined-report";
import ThemeToggle from "@/components/theme-toggle";
import type { UserDashboard } from "@shared/schema";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<UserDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const dashboardData = await response.json();

        // Convert date strings back to Date objects
        dashboardData.assets = dashboardData.assets.map((asset: any) => ({
          ...asset,
          createdAt: new Date(asset.createdAt),
        }));

        setDashboard(dashboardData);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        // Fall back to empty dashboard
        setDashboard({
          user: {
            id: "demo",
            email: "demo@example.com",
            name: "Demo User",
            image: null,
            googleId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          assets: [],
          totalValue: "$0",
          vehicleCount: 0,
          propertyCount: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Loading Dashboard
          </h3>
          <p className="text-muted-foreground">
            Getting your asset portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return <div>Error loading dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-bar text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  AssetLens Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Welcome back, {dashboard.user.name}
                </p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    <i className="fas fa-car mr-2"></i>Vehicle Valuation
                  </Button>
                </Link>
                <Link href="/land-assessment">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    <i className="fas fa-map-marked-alt mr-2"></i>Land
                    Assessment
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="text-foreground hover:text-primary"
                  >
                    <i className="fas fa-chart-bar mr-2"></i>Dashboard
                  </Button>
                </Link>
              </nav>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <i className="fas fa-shield-alt text-secondary"></i>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <i className="fas fa-chart-line text-primary"></i>
                  <span>Real-time Data</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Portfolio Value
              </CardTitle>
              <i className="fas fa-dollar-sign text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {dashboard.totalValue}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboard.assets.length} total assets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
              <i className="fas fa-car text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.vehicleCount}</div>
              <p className="text-xs text-muted-foreground">
                Vehicle assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Properties</CardTitle>
              <i className="fas fa-home text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.propertyCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Property assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Combined Report
              </CardTitle>
              <i className="fas fa-file-pdf text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <Button className="w-full" size="sm">
                <i className="fas fa-download mr-2"></i>
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Assets</CardTitle>
              <div className="flex space-x-2">
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-plus mr-2"></i>Add Vehicle
                  </Button>
                </Link>
                <Link href="/land-assessment">
                  <Button variant="outline" size="sm">
                    <i className="fas fa-plus mr-2"></i>Add Property
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.assets.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <i className="fas fa-plus text-muted-foreground text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Assets Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first vehicle or property assessment.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link href="/">
                    <Button>
                      <i className="fas fa-car mr-2"></i>Add Vehicle
                    </Button>
                  </Link>
                  <Link href="/land-assessment">
                    <Button variant="outline">
                      <i className="fas fa-home mr-2"></i>Add Property
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboard.assets.map(asset => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          asset.type === "vehicle"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        <i
                          className={`fas ${
                            asset.type === "vehicle" ? "fa-car" : "fa-home"
                          } text-lg`}
                        ></i>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {asset.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {asset.summary}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={
                              asset.type === "vehicle" ? "default" : "secondary"
                            }
                          >
                            {asset.type === "vehicle" ? "Vehicle" : "Property"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Added {asset.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        {asset.value}
                      </div>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-eye mr-1"></i>View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Combined Report Section */}
        {dashboard.assets.length > 0 && (
          <div className="mt-8">
            <CombinedReport
              assets={dashboard.assets}
              totalValue={dashboard.totalValue}
            />
          </div>
        )}
      </main>
    </div>
  );
}
