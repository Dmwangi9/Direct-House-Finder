import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  featured?: boolean;
}

const PropertyCard = ({ 
  id, 
  title, 
  price, 
  location, 
  images = [], 
  bedrooms, 
  bathrooms, 
  area, 
  type,
  featured = false 
}: PropertyCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Ensure we have at least a placeholder image
  const displayImages = images.length > 0 ? images : ["/placeholder.svg"];

  return (
    <Card className="group overflow-hidden border-0 shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/50">
      <div className="relative">
        {/* Image with overlay */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={displayImages[currentImageIndex]}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          
          {/* Image indicators */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {displayImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          {/* Property Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground border-0">
              {type}
            </Badge>
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-accent/90 text-accent-foreground border-0 animate-glow">
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Price */}
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">
                {formatPrice(price)}
              </h3>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h4>

            {/* Location */}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>

            {/* Property Details */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-muted-foreground">
                  <Bed className="w-4 h-4 mr-1" />
                  <span className="text-sm">{bedrooms}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Bath className="w-4 h-4 mr-1" />
                  <span className="text-sm">{bathrooms}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Square className="w-4 h-4 mr-1" />
                  <span className="text-sm">{area} ft²</span>
                </div>
              </div>
            </div>

            {/* View Details Button */}
            <Link to={`/property/${id}`}>
              <Button className="w-full mt-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default PropertyCard;