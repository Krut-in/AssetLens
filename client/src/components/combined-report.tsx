import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetSummary } from "@shared/schema";

interface CombinedReportProps {
  assets: AssetSummary[];
  totalValue: string;
}

export default function CombinedReport({
  assets,
  totalValue,
}: CombinedReportProps) {
  const handleShareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: "My AssetLens Portfolio Report",
        text: `My total asset portfolio is valued at ${totalValue} across ${assets.length} assets.`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(
          `My AssetLens Portfolio: ${totalValue} across ${assets.length} assets`
        )
        .then(() => {
          alert("Portfolio summary copied to clipboard!");
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <i className="fas fa-file-alt text-primary"></i>
          <span>Portfolio Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">{totalValue}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </div>
          <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <div className="text-2xl font-bold text-secondary">
              {assets.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Asset{assets.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Recent Assets</h4>
          {assets.slice(0, 3).map((asset, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg border border-border"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i
                    className={`fas ${
                      asset.assetType === "vehicle" ? "fa-car" : "fa-home"
                    } text-primary-foreground text-sm`}
                  ></i>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {asset.customName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {asset.assetType === "vehicle" ? "Vehicle" : "Property"}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-foreground">
                {asset.estimatedValue}
              </span>
            </div>
          ))}
          {assets.length > 3 && (
            <p className="text-sm text-muted-foreground text-center">
              and {assets.length - 3} more asset
              {assets.length - 3 !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleShareReport}
            className="px-6"
          >
            <i className="fas fa-share-alt mr-2"></i>
            Share Summary
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          <p>
            <i className="fas fa-info-circle mr-1"></i>
            Report includes current market valuations and asset details as of{" "}
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
