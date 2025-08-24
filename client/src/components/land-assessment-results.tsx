import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LandAssessmentResponse } from "@shared/schema";

interface LandAssessmentResultsProps {
  data: LandAssessmentResponse | null;
  isLoading: boolean;
}

export default function LandAssessmentResults({
  data,
  isLoading,
}: LandAssessmentResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-2xl shadow-lg border border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <i className="fas fa-spinner fa-spin text-primary text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Analyzing Property
              </h3>
              <p className="text-muted-foreground mb-4">
                Getting real-time property data from Regrid...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full animate-pulse"
                  style={{ width: "75%" }}
                ></div>
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
            <div className="text-center text-muted-foreground">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <i className="fas fa-map-marked-alt text-muted-foreground text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Ready for Assessment
              </h3>
              <p>
                Fill out the form to get comprehensive property valuation and
                assessment data.
              </p>
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

  const formatNumber = (value: string | null | undefined) => {
    if (!value) return "N/A";
    return parseFloat(value).toLocaleString();
  };

  const formatAcres = (value: string | null | undefined) => {
    if (!value) return "N/A";
    const acres = parseFloat(value);
    if (acres < 1) {
      return `${(acres * 43560).toLocaleString()} sq ft`;
    }
    return `${acres.toFixed(2)} acres`;
  };

  return (
    <div className="space-y-6">
      {/* Property Summary Card */}
      <Card className="rounded-2xl shadow-lg border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground">
              Property Summary
            </h3>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-accent font-medium text-sm">
                <i className="fas fa-check-circle mr-1"></i>Verified
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Property</p>
              <p
                className="font-semibold text-foreground"
                data-testid="text-property-summary"
              >
                {data.propertyInfo.summary}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Full Address</p>
              <p
                className="font-semibold text-foreground"
                data-testid="text-property-address"
              >
                {data.propertyInfo.address}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Location</p>
              <p
                className="font-semibold text-foreground"
                data-testid="text-property-location"
              >
                {data.propertyInfo.location}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm mb-1">Report Date</p>
              <p
                className="font-semibold text-foreground"
                data-testid="text-assessment-date"
              >
                {data.reportInfo.date}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Valuation Display */}
      <Card className="rounded-2xl shadow-lg border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Property Valuation
            </h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <i className="fas fa-database text-primary"></i>
              <span>Powered by Regrid</span>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Market Value */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Estimated Market Value
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Current market estimate
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-primary"
                    data-testid="text-market-value"
                  >
                    {formatCurrency(data.result.marketValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Assessed Value */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Assessed Value
                  </p>
                  <p className="text-sm text-muted-foreground">
                    County tax assessment
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-accent"
                    data-testid="text-assessed-value"
                  >
                    {formatCurrency(data.result.assessedValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Land Value */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground mb-1">Land Value</p>
                  <p className="text-sm text-muted-foreground">
                    Value of land only
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-bold text-warning"
                    data-testid="text-land-value"
                  >
                    {formatCurrency(data.result.landValue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Improvement Value */}
            {data.result.improvementValue &&
              parseFloat(data.result.improvementValue) > 0 && (
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Improvement Value
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Value of structures/buildings
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-2xl font-bold text-success"
                        data-testid="text-improvement-value"
                      >
                        {formatCurrency(data.result.improvementValue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="rounded-2xl shadow-lg border border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Property Details
          </h3>

          <div className="grid gap-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Property Type</span>
              <span
                className="font-semibold text-foreground"
                data-testid="text-property-type"
              >
                {data.result.propertyType || "Unknown"}
              </span>
            </div>

            {data.result.lotSize && (
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Lot Size</span>
                <span
                  className="font-semibold text-foreground"
                  data-testid="text-lot-size"
                >
                  {formatAcres(data.result.lotSize)}
                </span>
              </div>
            )}

            {data.result.yearBuilt && (
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Year Built</span>
                <span
                  className="font-semibold text-foreground"
                  data-testid="text-year-built"
                >
                  {data.result.yearBuilt}
                </span>
              </div>
            )}

            {data.result.ownerName && (
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">Owner</span>
                <span
                  className="font-semibold text-foreground"
                  data-testid="text-owner-name"
                >
                  {data.result.ownerName}
                </span>
              </div>
            )}

            {data.result.apn && (
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">
                  Assessor Parcel Number
                </span>
                <span
                  className="font-semibold text-foreground font-mono"
                  data-testid="text-apn"
                >
                  {data.result.apn}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Insights */}
      <Card className="rounded-2xl shadow-lg border border-border bg-card">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Property Insights
          </h3>
          <div className="grid gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <i className="fas fa-chart-line text-accent text-lg"></i>
              <div>
                <p className="font-medium text-foreground">
                  Real-time Data Retrieved
                </p>
                <p className="text-sm text-muted-foreground">
                  Current property records from public tax assessments
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <i className="fas fa-database text-primary text-lg"></i>
              <div>
                <p className="font-medium text-foreground">
                  Comprehensive Coverage
                </p>
                <p className="text-sm text-muted-foreground">
                  Powered by Regrid's 156M+ parcel database nationwide
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <i className="fas fa-clock text-warning text-lg"></i>
              <div>
                <p className="font-medium text-foreground">
                  Updated Information
                </p>
                <p className="text-sm text-muted-foreground">
                  Data reflects most recent available public records
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          className="flex-1 btn-primary"
          onClick={() => window.print()}
          data-testid="button-download-assessment"
        >
          <i className="fas fa-download mr-2"></i>
          Download Report
        </Button>
        <Button
          variant="outline"
          className="flex-1 py-3 px-6 rounded-xl font-semibold hover:bg-accent transition-colors"
          onClick={() => {
            const shareData = {
              title: "Property Assessment Report",
              text: `${data.propertyInfo.address} valued at ${formatCurrency(
                data.result.marketValue
              )}`,
            };

            if (navigator.share) {
              navigator.share(shareData);
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard
                .writeText(`${shareData.title}: ${shareData.text}`)
                .then(() => {
                  alert("Assessment details copied to clipboard!");
                })
                .catch(() => {
                  alert(
                    "Unable to share or copy. Please manually copy the assessment details."
                  );
                });
            }
          }}
          data-testid="button-share-assessment"
        >
          <i className="fas fa-share-alt mr-2"></i>
          Share Results
        </Button>
      </div>
    </div>
  );
}
