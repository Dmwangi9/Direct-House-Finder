import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { getPropertyById, auth } from "@/lib/firebaseService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const [property, setProperty] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);


  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      const result = await getPropertyById(id);
      if (result.success) {
        setProperty(result.property);
        // Fetch owner email from 'users' collection
        const ownerId = (result.property as any).ownerId;
        if (ownerId) {
          try {
            const userRef = doc(db, "users", ownerId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              setProperty((prev: any) => ({
                ...prev,
                ownerEmail: userData.email || null
              }));
            }
          } catch (err) {
            console.error("Error fetching owner email:", err);
          }
        }
      } else {
        console.error("Error fetching property:", result.error);
      }
      setIsLoading(false);
    };
    fetchProperty();
  }, [id]);

  const nextImage = () => {
    if (!property?.images || property.images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!property?.images || property.images.length === 0) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading property details...
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground">
        <p>Property not found.</p>
        <Button asChild className="mt-4">
          <Link to="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/search">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted">
                <img
                  src={property.images?.[currentImageIndex] || ""}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={prevImage}
                  disabled={!property.images || property.images.length === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  onClick={nextImage}
                  disabled={!property.images || property.images.length === 0}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {(property.images || []).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex space-x-2 p-4 overflow-x-auto">
                {(property.images || []).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <p className="text-muted-foreground flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.fullAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {property.price !== undefined && property.price !== null
                        ? new Intl.NumberFormat('en-KE', {
                            style: 'currency',
                            currency: 'KES',
                            maximumFractionDigits: 0,
                          }).format(property.price)
                        : "N/A"}
                    </div>
                    <div className="text-muted-foreground">/month</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.bedrooms ?? "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Bath className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.bathrooms ?? "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Bathrooms</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Square className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.area ?? "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Sq Ft</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold">{property.yearBuilt ?? "N/A"}</div>
                      <div className="text-sm text-muted-foreground">Year Built</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description ?? "No description provided."}
                  </p>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                  {(property.amenities && property.amenities.length > 0) ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(property.amenities || []).map((amenity, index) => {
                        // Check if amenity is an object with icon property or just a string
                        if (typeof amenity === 'object' && amenity.icon && amenity.name) {
                          const Icon = amenity.icon;
                          return (
                            <div key={index} className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-primary" />
                              <span className="text-sm">{amenity.name}</span>
                            </div>
                          );
                        } else {
                          // Handle string amenities
                          return (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="w-5 h-5 text-primary">✓</div>
                              <span className="text-sm">{amenity}</span>
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">No amenities listed.</div>
                  )}
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Location</h3>
                  <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{property.location}</div>
                      <div className="text-sm text-muted-foreground">{property.fullAddress}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Availability</h3>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-accent/20 text-accent-foreground">
                      Available {property.available ?? "N/A"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Owner Info and Contact */}
          <div className="space-y-6">
            {/* Owner Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">{property.ownerName ?? "N/A"}</div>
                    <div className="text-sm text-muted-foreground">
                      Property Owner
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEmailModal(true)}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                  <p>
                    💡 <strong>Tip:</strong> Be respectful and mention specific details about 
                    what you liked about this property in your message.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property Type</span>
                  <Badge variant="secondary">{property.type ?? "N/A"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Rent</span>
                  <span className="font-semibold">
                    {property.price !== undefined && property.price !== null
                      ? new Intl.NumberFormat('en-KE', {
                          style: 'currency',
                          currency: 'KES',
                          maximumFractionDigits: 0,
                        }).format(property.price)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-semibold">{property.available ?? "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet Policy</span>
                  <span className="font-semibold">Ask Owner</span>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Owner Email</h2>
            <p className="mb-6">
              {property.ownerEmail || "No email available"}
            </p>
            <Button onClick={() => setShowEmailModal(false)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;