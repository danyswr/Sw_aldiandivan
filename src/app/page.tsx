'use client'

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100 via-transparent to-transparent"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            🌱 Platform Marketplace Berkelanjutan
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Selamat Datang di <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              EcoMarket
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Platform marketplace berkelanjutan yang menghubungkan pembeli yang peduli lingkungan 
            dengan penjual yang bertanggung jawab. Temukan produk yang membuat perbedaan untuk Anda dan planet ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Mulai Berbelanja
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                Jadi Penjual
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Mengapa Pilih EcoMarket?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang sudah membuat pilihan berkelanjutan melalui platform kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Produk Terpilih</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Produk berkelanjutan dan ramah lingkungan yang dipilih khusus dari penjual terverifikasi.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Komunitas Terpercaya</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Bergabung dengan komunitas pembeli dan penjual yang peduli lingkungan dan berkelanjutan.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Aman & Terpercaya</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Transaksi aman dengan penjual terverifikasi dan perlindungan pembeli yang komprehensif.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Cepat & Mudah</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Antarmuka sederhana untuk browsing cepat, pemesanan, dan penjualan yang efisien.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-gray-600 text-lg">Produk Berkelanjutan</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-gray-600 text-lg">Penjual Terverifikasi</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">5000+</div>
              <div className="text-gray-600 text-lg">Pengguna Aktif</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-green-700 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/10 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Siap Membuat Perbedaan?
          </h2>
          <p className="text-green-100 text-xl md:text-2xl mb-12 leading-relaxed">
            Bergabunglah dengan ribuan pengguna yang sudah membuat pilihan berkelanjutan melalui EcoMarket.
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Mulai Hari Ini
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}