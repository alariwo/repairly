import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Wrench } from "lucide-react"; // Import the Wrench icon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Define the schema for the login form
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = ({ onSignupClick }: { onSignupClick: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Show the "Working" toast with a wrench icon
      const workingToastId = toast({
        title: "Waving my magic wand.",
        description: "Please wait while I process your request...",
      });

      // Simulate a delay to mimic server processing (optional)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Send the login request to the server
      const response = await fetch("https://repairly-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const { token, user } = await response.json();

      // Store the token and user role in local storage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);

      // Dispatch a custom event to notify other components about the login
      window.dispatchEvent(new CustomEvent("user-logged-in"));

      // Redirect based on user role
      if (user.role === "technician") {
        navigate("/technician");
      } else if (user.role === "admin" || user.role === "super-admin") {
        navigate("/dashboard");
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Email or Password Incorrect. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="Enter your email"
        />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <Button type="submit" className="w-full bg-repairam hover:bg-repairam-dark">
        <LogIn className="mr-2 h-4 w-4" /> Login
      </Button>
      {/* <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <span
          className="text-primary cursor-pointer"
          onClick={onSignupClick}
        >
          Sign up here
        </span>
      </p> */}
    </form>
  );
};