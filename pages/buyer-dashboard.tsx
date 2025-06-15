'use client'

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/product-card";
import { OrderModal } from "@/components/order-modal";
import { Search, Filter } from "lucide-react";
import { makeAPICall } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function BuyerDashboard() {
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
      title: "Order placed successfully",
      description: "Your order has been submitted."
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setPriceRange("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Marketplace</h1>
          <p className="mt-2 text-gray-600">
            Discover sustainable products from verified sellers
          </p>
        </div>
        <Badge variant="secondary" className="mt-4 sm:mt-0">
          {filteredProducts.length} products available
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priceRange} onValueChange={setPriceRange}>
            <SelectTrigger>
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Prices</SelectItem>
              <SelectItem value="0-50">$0 - $50</SelectItem>
              <SelectItem value="50-100">$50 - $100</SelectItem>
              <SelectItem value="100-200">$100 - $200</SelectItem>
              <SelectItem value="200+">$200+</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={`${product[0]}-${index}`}
              product={product}
              onOrder={handleOrder}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
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