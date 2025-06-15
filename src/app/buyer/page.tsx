'use client'

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { OrderModal } from "@/components/order-modal";
import { Search, Filter, ShoppingBag, TrendingUp } from "lucide-react";
import { makeAPICall } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function BuyerPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any[] | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await makeAPICall({
        action: "read",
        table: "products"
      });
      return response.success ? response.data : [];
    }
  });

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    return products.filter((product) => {
      if (!Array.isArray(product) || product.length < 9) return false;
      
      const [, , productName, , description, price, stock, category, status] = product;
      
      // Only show active products with stock
      if (status !== 1 || stock <= 0) return false;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (
          !productName?.toLowerCase().includes(searchLower) &&
          !description?.toLowerCase().includes(searchLower) &&
          !category?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      
      // Category filter
      if (selectedCategory && category !== selectedCategory) {
        return false;
      }
      
      // Price range filter
      if (priceRange) {
        const productPrice = parseFloat(price) || 0;
        switch (priceRange) {
          case "0-50":
            if (productPrice > 50) return false;
            break;
          case "50-100":
            if (productPrice < 50 || productPrice > 100) return false;
            break;
          case "100-200":
            if (productPrice < 100 || productPrice > 200) return false;
            break;
          case "200+":
            if (productPrice < 200) return false;
            break;
        }
      }
      
      return true;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    
    const categorySet = new Set<string>();
    products.forEach((product) => {
      if (Array.isArray(product) && product.length >= 8) {
        const category = product[7]; // category is at index 7
        if (category && typeof category === 'string') {
          categorySet.add(category);
        }
      }
    });
    return Array.from(categorySet);
  }, [products]);

  const handleOrder = (product: any[]) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsOrderModalOpen(false);
    setSelectedProduct(null);
    refetch(); // Refresh products to update stock
    toast({
      title: "Pesanan berhasil dibuat",
      description: "Pesanan Anda telah berhasil disubmit."
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange("");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <ShoppingBag className="inline-block w-8 h-8 mr-3 text-green-600" />
              Marketplace Produk
            </h1>
            <p className="text-lg text-gray-600">
              Temukan produk berkelanjutan dari penjual terverifikasi
            </p>
          </div>
          <div className="mt-6 sm:mt-0 flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/80">
              <TrendingUp className="w-4 h-4 mr-2" />
              {filteredProducts.length} produk tersedia
            </Badge>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari produk, kategori, atau penjual..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-gray-200 focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-green-500">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger className="h-12 bg-white border-gray-200 focus:border-green-500">
              <SelectValue placeholder="Rentang Harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Harga</SelectItem>
              <SelectItem value="0-50">Rp 0 - Rp 50.000</SelectItem>
              <SelectItem value="50-100">Rp 50.000 - Rp 100.000</SelectItem>
              <SelectItem value="100-200">Rp 100.000 - Rp 200.000</SelectItem>
              <SelectItem value="200+">Rp 200.000+</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="h-12 flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200"
          >
            <Filter className="h-4 w-4" />
            Hapus Filter
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 animate-pulse">
              <div className="bg-gray-200 h-56 rounded-xl mb-6"></div>
              <div className="bg-gray-200 h-4 rounded mb-3"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={`${product[0]}-${index}`}
              product={product}
              onOrder={handleOrder}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak ada produk ditemukan</h3>
            <p className="text-gray-500 mb-6 text-lg">
              Coba sesuaikan kriteria pencarian atau filter untuk menemukan yang Anda cari.
            </p>
            <Button onClick={clearFilters} variant="outline" size="lg">
              Hapus semua filter
            </Button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}