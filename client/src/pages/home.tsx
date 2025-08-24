import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CarValuationForm from "../components/car-valuation-form";
import ValuationResults from "../components/valuation-results";
import ThemeToggle from "../components/theme-toggle";
import type { ValuationResponse } from "@shared/schema";

export default function Home() {
  const [valuationData, setValuationData] = useState<ValuationResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleValuationComplete = (data: ValuationResponse) => {
    setValuationData(data);
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
                <i className="fas fa-car text-primary-foreground text-lg"></i>
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
                  <i className="fas fa-shield-alt text-secondary"></i>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <i className="fas fa-clock text-primary"></i>
                  <span>Real-time Data</span>
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
              <Button className="btn-nav-active">
                <i className="fas fa-car mr-2"></i>Vehicle Valuation
              </Button>
            </Link>
            <Link href="/land-assessment">
              <Button variant="ghost" className="btn-nav-inactive">
                <i className="fas fa-map-marked-alt mr-2 icon-primary"></i>Land
                Assessment
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Get Your Vehicle's Value in Seconds
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Enter your car details below to receive an instant AI-powered
            valuation report with loan-to-value calculations for smart financing
            decisions.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <i className="fas fa-database text-primary"></i>
              <span>MarketCheck API Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-chart-line text-accent"></i>
              <span>True Market Value™</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-calculator text-warning"></i>
              <span>LTV Analysis</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <CarValuationForm
            onValuationComplete={handleValuationComplete}
            onLoadingChange={handleLoadingChange}
          />
          <ValuationResults data={valuationData} isLoading={isLoading} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-bar text-white"></i>
                </div>
                <h3 className="text-lg font-bold text-white">AssetLens</h3>
              </div>
              <p className="text-slate-300 mb-4">
                Comprehensive AI-powered valuation platform providing accurate,
                real-time market data for vehicles and properties.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <i className="fas fa-shield-alt text-secondary"></i>
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <i className="fas fa-clock text-primary"></i>
                  <span>Real-time Data</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Vehicle Valuation
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Land Assessment
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Market Analysis
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Report Downloads
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Help Center
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Terms of Service
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
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
