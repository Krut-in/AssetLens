import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ValuationResponse } from "@shared/schema";

interface ValuationResultsProps {
  data: ValuationResponse | null;
  isLoading: boolean;
}

export default function ValuationResults({
  data,
  isLoading,
}: ValuationResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-lg border border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-subtle rounded-full mb-4">
                <i className="fas fa-spinner fa-spin icon-success text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analyzing Your Vehicle
              </h3>
              <p className="text-muted-foreground mb-4">
                Getting real-time market data from MarketCheck...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full animate-pulse"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                <i className="fas fa-shield-alt icon-security"></i>
                <span>Secure processing...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-lg border border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-subtle rounded-full mb-4">
                <i className="fas fa-chart-line icon-secondary-blue text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready for Valuation
              </h3>
              <p className="text-muted-foreground">
                Fill out the form to get your vehicle's True Market Value and
                loan analysis.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt icon-security"></i>
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-database icon-data"></i>
                  <span>Real-time Data</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  const formatPercentage = (value: string | null | undefined) => {
    if (!value) return "0%";
    return `${parseFloat(value).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Summary Card */}
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-secondary">
              Vehicle Summary
            </h3>
            <div className="bg-accent/10 px-3 py-1 rounded-full">
              <span className="text-accent font-medium text-sm">
                <i className="fas fa-check-circle mr-1"></i>Verified
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-secondary text-sm mb-1">Vehicle</p>
              <p
                className="font-semibold text-secondary"
                data-testid="text-vehicle-summary"
              >
                {data.vehicleInfo.summary}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Mileage</p>
              <p
                className="font-semibold text-secondary"
                data-testid="text-vehicle-mileage"
              >
                {data.vehicleInfo.mileage}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Location</p>
              <p
                className="font-semibold text-secondary"
                data-testid="text-vehicle-location"
              >
                {data.vehicleInfo.location}
              </p>
            </div>
            <div>
              <p className="text-text-secondary text-sm mb-1">Report Date</p>
              <p
                className="font-semibold text-secondary"
                data-testid="text-report-date"
              >
                {data.reportInfo.date}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* True Market Value Display */}
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              True Market Value™
            </h3>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <i className="fas fa-database text-primary"></i>
              <span>Powered by MarketCheck</span>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Trade-in Value */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary mb-1">
                    Trade-in Value
                  </p>
                  <p className="text-sm text-text-secondary">
                    What dealers typically pay
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-primary"
                    data-testid="text-tradein-value"
                  >
                    {formatCurrency(data.result.tradeInValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Private Party Value */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary mb-1">
                    Private Party Value
                  </p>
                  <p className="text-sm text-text-secondary">
                    Selling to another individual
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-accent"
                    data-testid="text-privateparty-value"
                  >
                    {formatCurrency(data.result.privatePartyValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Retail Value */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-secondary mb-1">
                    Retail Value
                  </p>
                  <p className="text-sm text-text-secondary">
                    Dealer selling price
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-warning"
                    data-testid="text-retail-value"
                  >
                    {formatCurrency(data.result.retailValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Analysis */}
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-secondary">
              Loan Analysis
            </h3>
            <div className="bg-primary/10 px-3 py-1 rounded-full">
              <span className="text-primary font-medium text-sm">
                <i className="fas fa-calculator mr-1"></i>LTV Calculated
              </span>
            </div>
          </div>

          {/* Loan Amount Display */}
          <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-xl mb-6">
            <div className="text-center">
              <p className="text-blue-100 mb-2">Estimated Loan Amount</p>
              <p
                className="text-4xl font-bold mb-2"
                data-testid="text-loan-amount"
              >
                {formatCurrency(data.result.loanAmount)}
              </p>
              <p className="text-blue-100 text-sm">
                Based on {formatPercentage(data.result.ltvRatio)} LTV ratio
                using trade-in value
              </p>
            </div>
          </div>

          {/* LTV Details */}
          <div className="grid gap-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-text-secondary">Loan-to-Value Ratio</span>
              <span
                className="font-semibold text-secondary"
                data-testid="text-ltv-ratio"
              >
                {formatPercentage(data.result.ltvRatio)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-text-secondary">Base Value Used</span>
              <span
                className="font-semibold text-secondary"
                data-testid="text-base-value"
              >
                {formatCurrency(data.result.tradeInValue)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-text-secondary">
                Interest Rate Estimate
              </span>
              <span
                className="font-semibold text-secondary"
                data-testid="text-interest-rate"
              >
                {formatPercentage(data.result.estimatedRate)} APR
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">
                Monthly Payment (60mo)
              </span>
              <span
                className="font-semibold text-secondary"
                data-testid="text-monthly-payment"
              >
                {formatCurrency(data.result.monthlyPayment)}/month
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <i className="fas fa-exclamation-triangle text-warning mt-0.5"></i>
              <div className="text-sm">
                <p className="font-medium text-text-primary mb-1">
                  Loan Estimate Disclaimer
                </p>
                <p className="text-text-secondary">
                  Final loan terms depend on credit score, income verification,
                  and lender requirements. This is an estimate for planning
                  purposes only.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <Card className="rounded-2xl shadow-lg border border-gray-100">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-secondary mb-4">
            Market Insights
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <i className="fas fa-chart-line text-accent text-lg"></i>
              <div>
                <p className="font-medium text-secondary">
                  Market Data Retrieved
                </p>
                <p className="text-sm text-text-secondary">
                  Real-time valuation based on current market conditions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <i className="fas fa-users text-primary text-lg"></i>
              <div>
                <p className="font-medium text-secondary">
                  Professional Grade Analysis
                </p>
                <p className="text-sm text-text-secondary">
                  Using real-time MarketCheck automotive data from 84,000+
                  listings
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <i className="fas fa-clock text-warning text-lg"></i>
              <div>
                <p className="font-medium text-secondary">
                  Up-to-Date Information
                </p>
                <p className="text-sm text-text-secondary">
                  Valuation reflects current regional pricing trends
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          className="flex-1 bg-gradient-to-r from-accent to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-[1.02]"
          onClick={() => window.print()}
          data-testid="button-download-report"
        >
          <i className="fas fa-download mr-2"></i>
          Download Report
        </Button>
        <Button
          variant="outline"
          className="flex-1 bg-gray-100 text-text-primary py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors border-gray-300"
          onClick={() =>
            navigator.share &&
            navigator.share({
              title: "Vehicle Valuation Report",
              text: `${data.vehicleInfo.summary} valued at ${formatCurrency(
                data.result.privatePartyValue
              )}`,
            })
          }
          data-testid="button-share-results"
        >
          <i className="fas fa-share-alt mr-2"></i>
          Share Results
        </Button>
      </div>
    </div>
  );
}
