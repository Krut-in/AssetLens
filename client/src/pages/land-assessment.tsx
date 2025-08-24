import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LandAssessmentForm from "../components/land-assessment-form";
import LandAssessmentResults from "../components/land-assessment-results";
import ThemeToggle from "../components/theme-toggle";
import type { LandAssessmentResponse } from "@shared/schema";

export default function LandAssessment() {
  const [assessmentData, setAssessmentData] =
    useState<LandAssessmentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssessmentComplete = (data: LandAssessmentResponse) => {
    setAssessmentData(data);
    setIsLoading(false);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

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
                <i className="fas fa-map-marked-alt text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AssetLens</h1>
                <p className="text-xs text-muted-foreground">
                  Comprehensive Asset Valuation Platform
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
                  <i className="fas fa-shield-alt text-accent"></i>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <i className="fas fa-database text-primary"></i>
                  <span>156M+ Properties</span>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Application */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-card rounded-xl p-2 border border-border shadow-sm">
            <Link href="/">
              <Button variant="ghost" className="btn-nav-inactive">
                <i className="fas fa-car mr-2 icon-primary"></i>Vehicle
                Valuation
              </Button>
            </Link>
            <Link href="/land-assessment">
              <Button className="btn-nav-active">
                <i className="fas fa-map-marked-alt mr-2"></i>Land Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Get Your Property's Value in Seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your property address below to receive a comprehensive land
            assessment report with market valuations and detailed property
            information.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <i className="fas fa-database text-primary"></i>
              <span>Regrid API Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-chart-line text-accent"></i>
              <span>Public Tax Records</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marked-alt text-warning"></i>
              <span>Parcel Analysis</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <LandAssessmentForm
            onAssessmentComplete={handleAssessmentComplete}
            onLoadingChange={handleLoadingChange}
          />
          <LandAssessmentResults data={assessmentData} isLoading={isLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-bar text-primary-foreground"></i>
                </div>
                <h3 className="text-lg font-bold">AssetLens</h3>
              </div>
              <p className="text-secondary-foreground/80 mb-4">
                Comprehensive AI-powered valuation platform providing accurate,
                real-time market data for vehicles and properties.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-secondary-foreground/80">
                  <i className="fas fa-shield-alt text-accent"></i>
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-secondary-foreground/80">
                  <i className="fas fa-database text-primary"></i>
                  <span>Real-time Data</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-secondary-foreground/80 text-sm">
                <li>Vehicle Valuation</li>
                <li>Land Assessment</li>
                <li>Market Analysis</li>
                <li>Report Downloads</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-secondary-foreground/80 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-secondary-foreground/60 text-sm">
            <p>
              &copy; 2024 AssetLens. All rights reserved. Powered by MarketCheck
              & Regrid APIs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
