import { useState } from "react";
import { Card } from "@/components/ui/card";
import CarValuationForm from "@/components/car-valuation-form";
import ValuationResults from "@/components/valuation-results";
import type { ValuationResponse } from "@shared/schema";

export default function Home() {
  const [valuationData, setValuationData] = useState<ValuationResponse | null>(null);
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
      <header className="bg-card shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-car text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary">CarValue Pro</h1>
                <p className="text-xs text-text-secondary">AI-Powered Vehicle Valuation</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <i className="fas fa-shield-alt text-accent"></i>
                <span>Secure & Trusted</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-secondary">
                <i className="fas fa-clock text-primary"></i>
                <span>Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Application */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-secondary mb-4">Get Your Vehicle's Value in Seconds</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Enter your car details below to receive an instant AI-powered valuation report with loan-to-value calculations for smart financing decisions.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-8 text-sm text-text-secondary">
            <div className="flex items-center space-x-2">
              <i className="fas fa-database text-primary"></i>
              <span>Edmunds API Integration</span>
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
          <ValuationResults 
            data={valuationData} 
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-car text-white"></i>
                </div>
                <h3 className="text-lg font-bold">CarValue Pro</h3>
              </div>
              <p className="text-gray-300 mb-4">
                AI-powered vehicle valuation platform providing accurate, real-time market data for smart financing decisions.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <i className="fas fa-shield-alt text-accent"></i>
                  <span>Bank-Grade Security</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <i className="fas fa-clock text-primary"></i>
                  <span>Real-time Data</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Vehicle Valuation</li>
                <li>Loan Analysis</li>
                <li>Market Insights</li>
                <li>Report Downloads</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 CarValue Pro. All rights reserved. Powered by Edmunds API.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
