import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, X, SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void;
  compact?: boolean;
  initialFilters?: any;
}

const SearchFilters = ({ onFiltersChange, compact = false, initialFilters = {} }: SearchFiltersProps) => {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const propertyTypes = [
    "All Types",
    "Apartment",
    "House",
    "Condo",
    "Townhouse",
    "Studio",
    "Loft"
  ];

  const bedroomOptions = ["Any", "1", "2", "3", "4", "5"];
  const bathroomOptions = ["Any", "1", "2", "3", "4"];

  // Initialize filters from props
  useEffect(() => {
    if (initialFilters.city) setLocation(initialFilters.city);
    if (initialFilters.type) setPropertyType(initialFilters.type);
    if (initialFilters.minPrice || initialFilters.maxPrice) {
      setPriceRange([
        initialFilters.minPrice || 0,
        initialFilters.maxPrice || 500000
      ]);
    }
    if (initialFilters.bedrooms) setBedrooms(initialFilters.bedrooms.toString());
    if (initialFilters.bathrooms) setBathrooms(initialFilters.bathrooms.toString());
  }, [initialFilters]);

  const handleSearch = () => {
    const filters: any = {};
    
    if (location) filters.city = location;
    if (propertyType && propertyType !== "All Types") filters.type = propertyType;
    if (priceRange[0] > 0) filters.minPrice = priceRange[0];
    if (priceRange[1] < 500000) filters.maxPrice = priceRange[1];
    if (bedrooms && bedrooms !== "Any") filters.bedrooms = parseInt(bedrooms);
    if (bathrooms && bathrooms !== "Any") filters.bathrooms = parseInt(bathrooms);
    
    onFiltersChange?.(filters);
  };

  const clearFilters = () => {
    setLocation("");
    setPropertyType("");
    setPriceRange([0, 500000]);
    setBedrooms("");
    setBathrooms("");
    onFiltersChange?.({});
  };

  const formatPrice = (value: number) => {
    if (value === 0) return "KES 0";
    if (value >= 500000) return "KES 500,000+";
    return `KES ${value.toLocaleString('en-KE')}`;
  };

  const hasActiveFilters = location || propertyType || bedrooms || bathrooms || priceRange[0] > 0 || priceRange[1] < 500000;

  if (compact) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Enter city, neighborhood, or address..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-base border-0 bg-white/80"
              />
            </div>
            
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full lg:w-48 h-12 border-0 bg-white/80">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
              
              <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="h-12 px-4">
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>
          </div>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent className="space-y-4 mt-6 animate-accordion-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price Range (Monthly Rent)</Label>
                  <div className="px-3 py-2 bg-muted/30 rounded-lg">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={500000}
                      step={10000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm font-medium text-foreground mt-3">
                      <span>{formatPrice(priceRange[0])}</span>
                      <span>{formatPrice(priceRange[1])}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedroomOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Select value={bathrooms} onValueChange={setBathrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      {bathroomOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-2">
                    {location && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {location}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setLocation("")} />
                      </Badge>
                    )}
                    {propertyType && propertyType !== "All Types" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {propertyType}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPropertyType("")} />
                      </Badge>
                    )}
                    {bedrooms && bedrooms !== "Any" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {bedrooms} beds
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setBedrooms("")} />
                      </Badge>
                    )}
                    {bathrooms && bathrooms !== "Any" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {bathrooms} baths
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setBathrooms("")} />
                      </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 500000])} />
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" onClick={clearFilters} className="text-sm">
                    Clear All
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    );
  }

  // Full sidebar version for search results page
  return (
    <Card className="bg-card border shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} size="sm">
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="City, neighborhood..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Price Range (Monthly Rent)</Label>
          <div className="px-3 py-4 bg-muted/30 rounded-lg">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={500000}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-sm font-medium text-foreground mt-4">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Drag the slider to set your budget range
          </p>
        </div>

        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {bedroomOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Bathrooms</Label>
          <Select value={bathrooms} onValueChange={setBathrooms}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {bathroomOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSearch} className="w-full">
          <Search className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-xs text-muted-foreground">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {location}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setLocation("");
                    handleSearch();
                  }} />
                </Badge>
              )}
              {propertyType && propertyType !== "All Types" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {propertyType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setPropertyType("");
                    handleSearch();
                  }} />
                </Badge>
              )}
              {bedrooms && bedrooms !== "Any" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {bedrooms} beds
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setBedrooms("");
                    handleSearch();
                  }} />
                </Badge>
              )}
              {bathrooms && bathrooms !== "Any" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {bathrooms} baths
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setBathrooms("");
                    handleSearch();
                  }} />
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => {
                    setPriceRange([0, 500000]);
                    handleSearch();
                  }} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;