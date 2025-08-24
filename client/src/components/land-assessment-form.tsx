import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertLandAssessmentRequestSchema, type InsertLandAssessmentRequest, type LandAssessmentResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LandAssessmentFormProps {
  onAssessmentComplete: (data: LandAssessmentResponse) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const states = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function LandAssessmentForm({ onAssessmentComplete, onLoadingChange }: LandAssessmentFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertLandAssessmentRequest>({
    resolver: zodResolver(insertLandAssessmentRequestSchema),
    defaultValues: {
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const assessmentMutation = useMutation({
    mutationFn: async (data: InsertLandAssessmentRequest) => {
      const res = await apiRequest("POST", "/api/land-assessment", data);
      return res.json() as Promise<LandAssessmentResponse>;
    },
    onMutate: () => {
      onLoadingChange(true);
    },
    onSuccess: (data) => {
      onAssessmentComplete(data);
      toast({
        title: "Assessment Complete",
        description: "Your land assessment has been successfully calculated.",
      });
    },
    onError: (error: Error) => {
      onLoadingChange(false);
      toast({
        title: "Assessment Failed",
        description: error.message || "Unable to complete land assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertLandAssessmentRequest) => {
    assessmentMutation.mutate(data);
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-border bg-card">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-foreground mb-2 flex items-center">
            <i className="fas fa-map-marked-alt mr-3 text-primary"></i>
            Property Information
          </h3>
          <p className="text-muted-foreground">Enter property address for comprehensive land assessment</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-land-assessment">
            
            {/* Street Address Input */}
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-home mr-2 text-primary"></i>Street Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 123 Main Street"
                      {...field}
                      className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground"
                      data-testid="input-street-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City Input */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-city mr-2 text-primary"></i>City
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., San Francisco"
                      {...field}
                      className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground"
                      data-testid="input-city"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* State Input */}
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-flag mr-2 text-primary"></i>State
                  </FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      data-testid="select-state"
                    >
                      <SelectTrigger className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ZIP Code Input */}
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-map-pin mr-2 text-primary"></i>ZIP Code
                    <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 90210"
                      {...field}
                      value={field.value || ""}
                      maxLength={5}
                      className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground"
                      data-testid="input-zipcode"
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-muted-foreground">Used for more precise property location</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={assessmentMutation.isPending}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-accent hover:to-primary transition-all duration-200 transform hover:scale-[1.02] focus:ring-4 focus:ring-primary/20"
              data-testid="button-submit-assessment"
            >
              <i className="fas fa-search mr-2"></i>
              {assessmentMutation.isPending ? "Analyzing Property..." : "Get Land Assessment"}
            </Button>

            {/* Trial Limitation Notice */}
            <div className="bg-warning/20 rounded-xl p-4 border border-warning/40">
              <div className="flex items-start space-x-3">
                <i className="fas fa-exclamation-triangle text-warning mt-0.5"></i>
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-2">Trial Limitation - Use Sample Addresses</p>
                  <p className="text-muted-foreground mb-3">Our trial API token only works for these 7 counties. Try these real addresses:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="bg-background rounded-lg p-2">
                      <p className="font-medium text-foreground">Dallas County, Texas</p>
                      <p className="text-muted-foreground">1500 Marilla Street, Dallas, TX 75201</p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="font-medium text-foreground">Marion County, Indiana</p>
                      <p className="text-muted-foreground">200 E Washington Street, Indianapolis, IN 46204</p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="font-medium text-foreground">Durham County, North Carolina</p>
                      <p className="text-muted-foreground">101 City Hall Plaza, Durham, NC 27701</p>
                    </div>
                    <div className="bg-background rounded-lg p-2">
                      <p className="font-medium text-foreground">Wilson County, Tennessee</p>
                      <p className="text-muted-foreground">228 E Main Street, Lebanon, TN 37087</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <strong>Try This:</strong> 1500 Marilla Street, Dallas, TX 75201
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}