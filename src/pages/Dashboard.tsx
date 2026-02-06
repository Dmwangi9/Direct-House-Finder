import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/layout/Navbar";
import { 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Upload,  
  DollarSign, 
  Users, 
  Heart,
  MessageCircle,
  TrendingUp,
  Camera,
  MapPin,
  Calendar,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { 
  getUserProperties, 
  addProperty, 
  updateProperty, 
  deleteProperty,
  uploadMultipleImages,
} from "@/lib/firebaseService";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  // Form state for adding/editing properties
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    type: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    location: "",
    fullAddress: "",
    description: "",
    yearBuilt: "",
    available: "",
  });
  // State for editing property
  const [editingProperty, setEditingProperty] = useState<any | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Fetch user's properties on component mount
  useEffect(() => {
    fetchUserProperties();
  }, []);

  const fetchUserProperties = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to view your properties.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await getUserProperties(user.uid);
    
    if (result.success) {
      setProperties(result.properties || []);
    } else {
      toast({
        title: "Error loading properties",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images per property.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      type: "",
      bedrooms: "",
      bathrooms: "",
      area: "",
      location: "",
      fullAddress: "",
      description: "",
      yearBuilt: "",
      available: "",
    });
    setSelectedImages([]);
    setImagePreview([]);
  };

  // Edit property handler
  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || "",
      price: property.price || "",
      type: property.type || "",
      bedrooms: property.bedrooms?.toString() || "",
      bathrooms: property.bathrooms?.toString() || "",
      area: property.area?.toString() || "",
      location: property.location || "",
      fullAddress: property.fullAddress || "",
      description: property.description || "",
      yearBuilt: property.yearBuilt?.toString() || "",
      available: property.available || "",
    });
    setImagePreview(property.images || []);
    setActiveTab("add-property");
  };

  const handleAddProperty = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to add properties.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title || !formData.price || !formData.type || !formData.location) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images
let imageUrls: string[] = [];
if (selectedImages.length > 0) {
  toast({
    title: "Uploading images...",
    description: "Please wait while we upload your property images.",
  });

  const tempPropertyId = `temp_${Date.now()}`;
  const uploadResult = await uploadMultipleImages(selectedImages, tempPropertyId);

  if (uploadResult.success) {
    imageUrls = uploadResult.urls || [];
  } else {
    throw new Error("Failed to upload images");
  }
}

      // Add property to Firestore
      const propertyData = {
        title: formData.title,
        price: parseFloat(formData.price),
        type: formData.type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 0,
        area: parseInt(formData.area) || 0,
        location: formData.location,
        fullAddress: formData.fullAddress || formData.location,
        description: formData.description,
        yearBuilt: parseInt(formData.yearBuilt) || new Date().getFullYear(),
        available: formData.available || "Available Now",
        ownerId: user.uid,
        ownerName: user.displayName || "Property Owner",
        images: imageUrls,
        status: isDraft ? 'draft' : 'active',
      };

      // If editing, update property instead of adding new
      if (editingProperty) {
        const result = await updateProperty(editingProperty.id, propertyData as any);
        if (result.success) {
          toast({
            title: "Property updated!",
            description: `Your property "${formData.title}" has been updated successfully.`,
          });
          await fetchUserProperties();
          resetForm();
          setEditingProperty(null);
          setActiveTab("properties");
          return;
        } else {
          throw new Error(result.error);
        }
      }

      const result = await addProperty(propertyData as any);

      if (result.success) {
        toast({
          title: isDraft ? "Draft saved!" : "Property published!",
          description: `Your property "${formData.title}" has been ${isDraft ? 'saved as draft' : 'published successfully'}.`,
        });

        // Refresh properties list
        await fetchUserProperties();
        
        // Reset form and switch to properties tab
        resetForm();
        setActiveTab("properties");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error adding property",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string, propertyTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${propertyTitle}"?`)) {
      return;
    }

    const result = await deleteProperty(propertyId);

    if (result.success) {
      toast({
        title: "Property deleted",
        description: `"${propertyTitle}" has been removed successfully.`,
      });
      
      // Refresh properties list
      await fetchUserProperties();
    } else {
      toast({
        title: "Error deleting property",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const stats = [
    { 
      title: "Total Properties", 
      value: properties.length, 
      icon: DollarSign,
      change: properties.filter(p => {
        const created = p.createdAt?.toDate();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return created && created > monthAgo;
      }).length + " this month",
      changeType: "positive"
    },
    { 
      title: "Active Listings", 
      value: properties.filter(p => p.status === 'active').length, 
      icon: Eye,
      change: properties.filter(p => p.status === 'draft').length + " drafts",
      changeType: "neutral"
    },
    { 
      title: "Total Value", 
      value: formatPrice(properties.reduce((sum, p) => sum + (p.price || 0), 0)), 
      icon: TrendingUp,
      change: "Monthly rent potential",
      changeType: "positive"
    },
    { 
      title: "Properties", 
      value: properties.filter(p => p.status === 'rented').length + " Rented", 
      icon: Users,
      change: properties.filter(p => p.status === 'active').length + " available",
      changeType: "neutral"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "rented":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {auth.currentUser?.displayName || "Property Owner"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">My Properties</TabsTrigger>
          <TabsTrigger value="add-property">Add Property</TabsTrigger>
        </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-gradient-to-br from-card to-card/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className={`text-xs ${
                          stat.changeType === "positive" ? "text-green-600" : 
                          stat.changeType === "negative" ? "text-red-600" : 
                          "text-muted-foreground"
                        }`}>
                          {stat.change}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-muted-foreground">Loading properties...</p>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No properties yet.</p>
                    <Button onClick={() => setActiveTab("add-property")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                          {property.images && property.images[0] ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <MapPin className="w-8 h-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(property.price)}/month
                          </p>
                        </div>
                        <Badge className={getStatusColor(property.status)}>
                          {property.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading your properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by adding your first property listing
                  </p>
                  <Button onClick={() => setActiveTab("add-property")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Property
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 aspect-[4/3] md:aspect-square">
                        <img
                          src={property.images?.[0] || "/placeholder.svg"}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{property.title}</h3>
                              <Badge className={getStatusColor(property.status)}>
                                {property.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{property.location}</p>
                            <p className="text-xl font-bold text-primary mb-4">
                              {formatPrice(property.price)}/month
                            </p>
                            
                            {/* Property Details */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{property.bedrooms} beds</span>
                              <span>•</span>
                              <span>{property.bathrooms} baths</span>
                              <span>•</span>
                              <span>{property.area} sq ft</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/property/${property.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditProperty(property)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteProperty(property.id, property.title)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add Property Tab */}
          <TabsContent value="add-property" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingProperty ? "Edit Property" : "Add New Property"}</CardTitle>
                <p className="text-muted-foreground">
                  Create a new listing to attract potential tenants
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={(e) => handleAddProperty(e, false)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Property Title *</Label>
                      <Input 
                        id="title"
                        placeholder="e.g., Modern Downtown Apartment"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="price">Monthly Rent (KES) *</Label>
                      <Input 
                        id="price"
                        type="number"
                        placeholder="50000"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Property Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Condo">Condo</SelectItem>
                          <SelectItem value="Townhouse">Townhouse</SelectItem>
                          <SelectItem value="Studio">Studio</SelectItem>
                          <SelectItem value="Loft">Loft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bedrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Studio</SelectItem>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bathrooms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bathroom</SelectItem>
                          <SelectItem value="2">2 Bathrooms</SelectItem>
                          <SelectItem value="3">3 Bathrooms</SelectItem>
                          <SelectItem value="4">4+ Bathrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (sq ft)</Label>
                      <Input 
                        id="area"
                        type="number"
                        placeholder="1200"
                        value={formData.area}
                        onChange={(e) => handleInputChange("area", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Location *</Label>
                    <Input 
                      id="location"
                      placeholder="e.g., Nairobi, Westlands"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullAddress">Full Address (Optional)</Label>
                    <Input 
                      id="fullAddress"
                      placeholder="123 Main Street, Westlands, Nairobi"
                      value={formData.fullAddress}
                      onChange={(e) => handleInputChange("fullAddress", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description"
                      placeholder="Describe your property, highlight key features, amenities, and what makes it special..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Property Images</Label>
                    
                    {/* Image Preview */}
                    {imagePreview.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {selectedImages.length > 0 
                          ? `${selectedImages.length} image(s) selected` 
                          : "Drag and drop images here, or click to select files"
                        }
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Images
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Max 10 images. JPG, PNG up to 5MB each
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={(e: any) => handleAddProperty(e, true)}
                      disabled={isSubmitting}
                    >
                      Save as Draft
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-primary to-accent"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Publish Property
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;