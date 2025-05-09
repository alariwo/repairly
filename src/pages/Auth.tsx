import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { LoginFormData, SignupFormData } from "@/types/auth";

enum AuthView {
  LOGIN = "login",
  SIGNUP = "signup",
}

const Auth = () => {
  const [view, setView] = useState<AuthView>(AuthView.LOGIN);

  const handleLogin = (data: LoginFormData) => {
    console.log("Login form submitted:", data);
  };

  const handleSignup = (data: SignupFormData) => {
    console.log("Signup form submitted:", data);
  };

  const switchToSignup = () => {
    setView(AuthView.SIGNUP);
  };

  const switchToLogin = () => {
    setView(AuthView.LOGIN);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">RepairAM</h1>
          <p className="text-muted-foreground">RepairAm Shop Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {view === AuthView.LOGIN ? "Welcome Back" : "Create an Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {view === AuthView.LOGIN ? (
              <LoginForm onSubmit={handleLogin} onSignupClick={switchToSignup} />
            ) : (
              <SignupForm onSubmit={handleSignup} onLoginClick={switchToLogin} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
