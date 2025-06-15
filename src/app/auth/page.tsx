'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { makeAPICall } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await makeAPICall({
        action: "login",
        data: loginData
      });

      if (response.success) {
        login(response.user);
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!"
        });
        
        const redirectPath = response.user.role === "buyer" ? "/buyer" : "/seller";
        router.push(redirectPath);
      } else {
        toast({
          title: "Login gagal",
          description: response.message || "Email atau password salah",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login gagal",
        description: "Periksa koneksi internet dan coba lagi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await makeAPICall({
        action: "register",
        data: registerData
      });

      if (response.success) {
        toast({
          title: "Registrasi berhasil",
          description: "Anda sekarang dapat login dengan akun baru"
        });
        
        // Reset form
        setRegisterData({
          name: "",
          email: "",
          password: "",
          role: ""
        });
      } else {
        toast({
          title: "Registrasi gagal",
          description: response.message || "Silakan coba lagi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registrasi gagal",
        description: "Periksa koneksi internet dan coba lagi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Selamat Datang di EcoMarket
          </h2>
          <p className="text-lg text-gray-600">
            Bergabung dengan marketplace berkelanjutan
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100 rounded-t-lg">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">
                  Daftar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-6">
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Masuk</h3>
                  <p className="text-gray-600">
                    Masukkan kredensial Anda untuk mengakses akun
                  </p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="p-6">
                <div className="space-y-2 mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Daftar</h3>
                  <p className="text-gray-600">
                    Buat akun baru untuk memulai
                  </p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-semibold text-gray-700">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nama lengkap Anda"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-semibold text-gray-700">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-semibold text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Buat password yang aman"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-green-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-role" className="text-sm font-semibold text-gray-700">
                      Peran
                    </Label>
                    <Select value={registerData.role} onValueChange={(value) => setRegisterData({ ...registerData, role: value })}>
                      <SelectTrigger className="h-12 border-gray-200 focus:border-green-500">
                        <SelectValue placeholder="Pilih peran Anda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Pembeli
                          </div>
                        </SelectItem>
                        <SelectItem value="seller">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Penjual
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Membuat akun..." : "Daftar Sekarang"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}