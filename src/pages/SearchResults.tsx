import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyCard from "@/components/property/PropertyCard";
import { Grid, List, SlidersHorizontal, X } from "lucide-react";
import { getProperties } from "@/lib/firebaseService";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "bedrooms", label: "Most Bedrooms" },
    { value: "area", label: "Largest Area" },
  ];

  // Initialize filters from URL parameters on component mount
  useEffect(() => {
    const initialFilters: any = {};
    
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    
    if (type) initialFilters.type = type;
    if (city) initialFilters.city = city;
    if (minPrice) initialFilters.minPrice = Number(minPrice);
    if (maxPrice) initialFilters.maxPrice = Number(maxPrice);
    if (bedrooms) initialFilters.bedrooms = Number(bedrooms);
    
    setFilters(initialFilters);
  }, [searchParams]);

  const handleFiltersChange = (newFilters: any) => {
    console.debug("Filters set:", newFilters);
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        // Clean filters: remove empty or undefined values
        const activeFilters = Object.fromEntries(
          Object.entries(filters || {}).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined
          )
        );

        console.debug("Active filters used:", activeFilters);

        const result = await getProperties(activeFilters);
        console.debug(
          "Fetched properties count:",
          result.success ? (result.properties || []).length : "error",
          result
        );

        if (result.success) {
          let fetchedProperties = result.properties || [];
          
          // Apply client-side sorting
          if (sortBy === "price-low") {
            fetchedProperties.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (sortBy === "price-high") {
            fetchedProperties.sort((a, b) => (b.price || 0) - (a.price || 0));
          } else if (sortBy === "bedrooms") {
            fetchedProperties.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
          } else if (sortBy === "area") {
            fetchedProperties.sort((a, b) => (b.area || 0) - (a.area || 0));
          }
          // "newest" is already sorted by default in getProperties
          
          setProperties(fetchedProperties);
        } else {
          console.error("Error loading properties:", result.error);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [filters, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 animate-fade-in">
          {/* Results Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Search Results</h1>
              <p className="text-muted-foreground">
                {properties.length > 0 ? (
                  <>
                    Found {properties.length}{" "}
                    {filters.type
                      ? `${filters.type.toLowerCase()}${properties.length === 1 ? "" : "s"}`
                      : properties.length === 1
                      ? "property"
                      : "properties"}
                    {filters.city ? ` in ${filters.city}` : ""}
                  </>
                ) : (
                  <>
                    No{" "}
                    {filters.type
                      ? `${filters.type.toLowerCase()}${properties.length === 1 ? "" : "s"}`
                      : "properties"}{" "}
                    {filters.city ? `found in ${filters.city}` : "found"}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <SearchFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
            </div>
          </div>

          {/* Mobile Filters Overlay */}
          {showFilters && (
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50"
              onClick={() => setShowFilters(false)}
            >
              <div className="absolute right-0 top-0 h-full w-80 bg-background p-6 animate-slide-in-right overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <SearchFilters onFiltersChange={handleFiltersChange} initialFilters={filters} />
              </div>
            </div>
          )}

          {/* Results Content */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="text-center py-20 text-muted-foreground">Loading properties...</div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No properties found matching your search criteria.
              </div>
            ) : viewMode === "list" ? (
              <div className="space-y-6 animate-fade-in">
                {properties.map((property, index) => (
                  <div key={property.id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <Card className="overflow-hidden hover:shadow-hover transition-all duration-300">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 aspect-[4/3] md:aspect-square">
                          <img
                            src={property.images?.[0] || "/placeholder.svg"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                              <p className="text-muted-foreground">{property.location}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                ${property.price?.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">/month</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <Badge variant="secondary">{property.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {property.bedrooms} beds • {property.bathrooms} baths • {property.area} ft²
                            </span>
                          </div>

                          <Button className="w-full md:w-auto">View Details</Button>
                        </CardContent>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                {properties.map((property, index) => (
                  <div key={property.id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <PropertyCard {...property} />
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {properties.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg" className="px-8">
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;