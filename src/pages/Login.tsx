// Import necessary React hooks and components
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Import UI components from shadcn/ui library
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
// Import custom layout component
import Navbar from "@/components/layout/Navbar";
// Import icons from lucide-react
import { Eye, EyeOff, Home, Mail, Lock, ArrowRight } from "lucide-react";
// Import toast hook for notifications
import { useToast } from "@/hooks/use-toast";
// Import Firebase login function
import { loginUser } from "@/lib/firebaseService";
// Import Firestore helpers and database instance
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseService";

const Login = () => {
  // Initialize toast hook for displaying notifications
  const { toast } = useToast();
  // Initialize navigate hook for redirects
  const navigate = useNavigate();
  
  // STATE MANAGEMENT
  // Controls password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  // Stores email input value
  const [email, setEmail] = useState("");
  // Stores password input value
  const [password, setPassword] = useState("");
  // Tracks "Remember me" checkbox state
  const [rememberMe, setRememberMe] = useState(false);
  // Controls loading state during form submission
  const [isLoading, setIsLoading] = useState(false);

  // FORM SUBMISSION HANDLER WITH FIREBASE
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent default form submission behavior
    e.preventDefault();
    // Set loading state to true
    setIsLoading(true);
    
    // Call Firebase login function
    const result = await loginUser(email, password);
    
    // Set loading state to false after response
    setIsLoading(false);
    
    // Check if login was successful
    if (result.success) {
      // Show success toast notification
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      
      // Fetch user document and redirect based on accountType
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.accountType === "owner") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        navigate("/"); // fallback if document not found
      }
    } else {
      // Show error toast notification
      toast({
        title: "Login failed",
        description: result.error || "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  return (
    // MAIN CONTAINER - Full screen with light gray background
    <div className="min-h-screen bg-gray-50">
      {/* Navigation bar component */}
      <Navbar />
      
      {/* CONTENT CONTAINER - Centered layout with padding */}
      <div className="max-w-md mx-auto p-4 pt-16">
        
        {/* HEADER SECTION - Logo, title and description */}
        <div className="text-center mb-8">
          {/* Circular logo container with gradient background */}
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-white" />
          </div>
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          {/* Subtitle description */}
          <p className="text-gray-600">
            Sign in to access your property dashboard
          </p>
        </div>

        {/* LOGIN FORM CARD */}
        <Card className="shadow-lg">
          {/* Card header with centered title */}
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          
          {/* Card content containing all form elements */}
          <CardContent className="space-y-6">
            {/* MAIN LOGIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* EMAIL INPUT FIELD */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {/* Input container with left icon */}
                <div className="relative">
                  {/* Mail icon positioned on the left */}
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10" // Left padding for icon space
                    required
                  />
                </div>
              </div>

              {/* PASSWORD INPUT FIELD WITH VISIBILITY TOGGLE */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                {/* Input container with left and right icons */}
                <div className="relative">
                  {/* Lock icon on the left */}
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"} // Toggle between text and password
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10" // Padding for both left and right icons
                    required
                  />
                  {/* Password visibility toggle button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {/* Switch between eye and eye-off icons */}
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {/* REMEMBER ME CHECKBOX AND FORGOT PASSWORD LINK */}
              <div className="flex items-center justify-between">
                {/* Remember me checkbox with label */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                {/* Forgot password link */}
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* SUBMIT BUTTON WITH LOADING STATE */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading} // Disable during form submission
              >
                {/* Conditional icon and text based on loading state */}
                {isLoading ? (
                  // Loading spinner animation
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  // Arrow icon for normal state
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                {/* Button text changes during loading */}
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            {/* SIGN UP LINK SECTION */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FEATURES SECTION - Three promotional features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {/* Feature 1: List Properties */}
          <div className="space-y-2">
            {/* Feature icon container */}
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Home className="w-4 h-4 text-blue-600" />
            </div>
            {/* Feature description */}
            <p className="text-xs text-gray-600">List Properties</p>
          </div>
          
          {/* Feature 2: Direct Contact */}
          <div className="space-y-2">
            {/* Feature icon container */}
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-4 h-4 text-green-600" />
            </div>
            {/* Feature description */}
            <p className="text-xs text-gray-600">Direct Contact</p>
          </div>
          
          {/* Feature 3: No Fees */}
          <div className="space-y-2">
            {/* Feature icon container */}
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </div>
            {/* Feature description */}
            <p className="text-xs text-gray-600">No Fees</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;