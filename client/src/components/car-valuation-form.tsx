import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  insertValuationRequestSchema,
  type InsertValuationRequest,
  type ValuationResponse,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CarValuationFormProps {
  onValuationComplete: (data: ValuationResponse) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

const carMakes = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "ford", label: "Ford" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "nissan", label: "Nissan" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes-benz", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "hyundai", label: "Hyundai" },
];

const carModels: Record<string, { value: string; label: string }[]> = {
  toyota: [
    { value: "camry", label: "Camry" },
    { value: "corolla", label: "Corolla" },
    { value: "prius", label: "Prius" },
    { value: "rav4", label: "RAV4" },
    { value: "highlander", label: "Highlander" },
  ],
  honda: [
    { value: "accord", label: "Accord" },
    { value: "civic", label: "Civic" },
    { value: "cr-v", label: "CR-V" },
    { value: "pilot", label: "Pilot" },
    { value: "odyssey", label: "Odyssey" },
  ],
  ford: [
    { value: "f-150", label: "F-150" },
    { value: "mustang", label: "Mustang" },
    { value: "explorer", label: "Explorer" },
    { value: "escape", label: "Escape" },
    { value: "focus", label: "Focus" },
  ],
  chevrolet: [
    { value: "silverado", label: "Silverado" },
    { value: "equinox", label: "Equinox" },
    { value: "malibu", label: "Malibu" },
    { value: "tahoe", label: "Tahoe" },
    { value: "camaro", label: "Camaro" },
  ],
};

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

export default function CarValuationForm({
  onValuationComplete,
  onLoadingChange,
}: CarValuationFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertValuationRequest>({
    resolver: zodResolver(insertValuationRequestSchema),
    defaultValues: {
      make: "",
      model: "",
      year: 0,
      mileage: 0,
      zipCode: "",
    },
  });

  const selectedMake = form.watch("make");
  const availableModels = carModels[selectedMake] || [];

  const valuationMutation = useMutation({
    mutationFn: async (data: InsertValuationRequest) => {
      const res = await apiRequest("POST", "/api/valuation", data);
      return res.json() as Promise<ValuationResponse>;
    },
    onMutate: () => {
      onLoadingChange(true);
    },
    onSuccess: data => {
      onValuationComplete(data);
      toast({
        title: "Valuation Complete",
        description: "Your vehicle valuation has been successfully calculated.",
      });
    },
    onError: (error: Error) => {
      onLoadingChange(false);
      toast({
        title: "Valuation Failed",
        description:
          error.message ||
          "Unable to complete vehicle valuation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertValuationRequest) => {
    valuationMutation.mutate(data);
  };

  return (
    <Card className="rounded-2xl shadow-lg border border-border bg-card">
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-foreground mb-2 flex items-center">
            <i className="fas fa-car mr-3 icon-secondary-blue"></i>
            Vehicle Information
          </h3>
          <p className="text-muted-foreground">
            Enter your car details for instant AI-powered valuation
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
            data-testid="form-valuation"
          >
            {/* Make Input */}
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-industry mr-2 icon-secondary-blue"></i>
                    Make
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      data-testid="select-make"
                    >
                      <SelectTrigger className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground">
                        <SelectValue placeholder="Select Make" />
                      </SelectTrigger>
                      <SelectContent>
                        {carMakes.map(make => (
                          <SelectItem key={make.value} value={make.value}>
                            {make.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Input */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-car mr-2 icon-secondary-blue"></i>Model
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedMake}
                      data-testid="select-model"
                    >
                      <SelectTrigger className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map(model => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Year Input */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-calendar-alt mr-2 icon-secondary-blue"></i>
                    Year
                  </FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={value => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      data-testid="select-year"
                    >
                      <SelectTrigger className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mileage Input */}
            <FormField
              control={form.control}
              name="mileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground flex items-center">
                    <i className="fas fa-tachometer-alt mr-2 icon-secondary-blue"></i>
                    Mileage
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 45000"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors pr-16 bg-background text-foreground"
                        min="0"
                        max="999999"
                        data-testid="input-mileage"
                      />
                    </FormControl>
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
                      miles
                    </span>
                  </div>
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
                    <i className="fas fa-map-marker-alt mr-2 icon-secondary-blue"></i>
                    ZIP Code
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., 90210"
                      {...field}
                      maxLength={5}
                      className="w-full px-4 py-3 border-2 border-input rounded-xl focus:border-primary transition-colors bg-background text-foreground"
                      data-testid="input-zipcode"
                    />
                  </FormControl>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used for regional market pricing
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={valuationMutation.isPending}
              className="btn-success-green w-full disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-submit-valuation"
            >
              <i className="fas fa-car mr-3 icon-success"></i>
              {valuationMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Getting Valuation...
                </>
              ) : (
                "Get Vehicle Valuation"
              )}
            </Button>

            {/* Disclaimer */}
            <div className="bg-blue-subtle rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle icon-secondary-blue mt-0.5"></i>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    Clean Vehicle Assumption
                  </p>
                  <p>
                    Our valuation assumes your vehicle is in good condition
                    without external damage. Actual values may vary based on
                    vehicle condition and local market factors.
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-shield-alt icon-security"></i>
                      <span>Secure & Trusted</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-database icon-data"></i>
                      <span>Real-time Data</span>
                    </div>
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
