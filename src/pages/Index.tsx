import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyCard from "@/components/property/PropertyCard";
import { ArrowRight, Star, Users, Shield, TrendingUp, MapPin, Search } from "lucide-react";
import { getProperties } from "@/lib/firebaseService";

const Index = () => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const stats = [
    { icon: Users, label: "Active Users", value: "50K+" },
    { icon: Shield, label: "Verified Properties", value: "15K+" },
    { icon: TrendingUp, label: "Successful Rentals", value: "8K+" },
    { icon: Star, label: "Average Rating", value: "4.9" },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      setIsLoading(true);
      const result = await getProperties({ limitCount: 6 });
      if (result.success) {
        setFeaturedProperties(result.properties || []);
      } else {
        console.error("Error fetching featured properties:", result.error);
      }
      setIsLoading(false);
    };
    fetchFeatured();
  }, []);

  // Handle search filters - navigate to search page with filters as URL params
  const handleFiltersChange = (filters: any) => {
    console.log("Filters applied:", filters);
    
    // Build URL query parameters from filters
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.city) params.append('city', filters.city);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms.toString());
    
    // Navigate to search page with query parameters
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <Badge className="mx-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                ✨ No Agent Fees • Direct Contact
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Find Your Perfect
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-glow">
                  Home Direct
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect directly with property owners. No middlemen, no extra fees. 
                Just honest, transparent home searching.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg rounded-full shadow-elegant hover:from-primary/90 hover:to-accent/90 hover:shadow-hover transition-all transform hover:scale-105"
                asChild
              >
                <Link to="/search">
                  <Search className="w-5 h-5 mr-2" />
                  Start Searching
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent px-8 py-6 text-lg rounded-full shadow-elegant hover:from-primary/90 hover:to-accent/90 hover:shadow-hover transition-all transform hover:scale-105"
                asChild
              >
                <Link to="/register">
                  List Your Property
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Component */}
          <div className="mt-16 max-w-4xl mx-auto animate-fade-in">
            <SearchFilters compact onFiltersChange={handleFiltersChange} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center space-y-3 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Properties</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover handpicked properties from verified owners
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">
              Loading featured properties...
            </div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              No featured properties found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
              {featuredProperties.map((property, index) => (
                <div key={property.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <PropertyCard {...property} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-full" asChild>
              <Link to="/search">
                View All Properties
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Find Your Next Home?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of happy renters who found their perfect home without agent fees
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="px-8 py-6 text-lg rounded-full bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/search">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Properties
                </Link>
              </Button>
              <Button
                size="lg"
                className="px-8 py-6 text-lg rounded-full bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/register">
                  List Your Property Free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;