'use client'

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingCart, Eye, Edit, Trash2, TrendingUp, DollarSign } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductModal } from "@/components/product-modal";
import { OrderDetailModal } from "@/components/order-detail-modal";
import { OrderStatusModal } from "@/components/order-status-modal";
import { makeAPICall, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function SellerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any[] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any[] | null>(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);

  // Fetch seller's products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["seller-products", user?.email],
    queryFn: async () => {
      const response = await makeAPICall({
        action: "read",
        table: "products",
        filters: { seller_email: user?.email }
      });
      return response.success ? response.data : [];
    },
    enabled: !!user?.email
  });

  // Fetch seller's orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["seller-orders", user?.email],
    queryFn: async () => {
      const response = await makeAPICall({
        action: "read",
        table: "orders",
        filters: { seller_email: user?.email }
      });
      return response.success ? response.data : [];
    },
    enabled: !!user?.email
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await makeAPICall({
        action: "delete",
        table: "products",
        id: productId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      toast({
        title: "Produk berhasil dihapus",
        description: "Produk telah berhasil dihapus dari toko Anda."
      });
    },
    onError: () => {
      toast({
        title: "Gagal menghapus produk",
        description: "Tidak dapat menghapus produk. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  });

  const handleEditProduct = (product: any[]) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleViewOrderDetails = (order: any[]) => {
    // Find the corresponding product
    const productId = order[2]; // product_id is at index 2
    const product = products.find((p: any[]) => p[0] === productId);
    
    setSelectedOrder(order);
    setSelectedProduct(product || null);
    setIsOrderDetailModalOpen(true);
  };

  const handleUpdateOrderStatus = (order: any[]) => {
    setSelectedOrder(order);
    setIsOrderStatusModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p: any[]) => p[8] === 1).length; // status is at index 8
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum: number, order: any[]) => sum + (parseFloat(order[5]) || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <Package className="inline-block w-8 h-8 mr-3 text-blue-600" />
              Dashboard Penjual
            </h1>
            <p className="text-lg text-gray-600">
              Kelola produk dan pesanan Anda
            </p>
          </div>
          
          {/* Prominent Add Product Button */}
          <div className="mt-6 lg:mt-0">
            <Button 
              onClick={handleAddProduct} 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-6 w-6 mr-2" />
              Tambah Produk Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Produk</CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
            <p className="text-sm text-blue-600 font-medium">
              {activeProducts} aktif
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-green-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-purple-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-yellow-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pesanan Pending</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {orders.filter((order: any[]) => order[6]?.toLowerCase() === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 h-12">
          <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-lg">
            Produk Saya
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-lg">
            Kelola Pesanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Produk Saya</h2>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">{products.length} produk</Badge>
              <Button onClick={handleAddProduct} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="bg-gray-200 h-56 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: any[], index: number) => (
                <ProductCard
                  key={`${product[0]}-${index}`}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  isOwner={true}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="h-20 w-20 text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum ada produk</h3>
                <p className="text-gray-500 text-center max-w-md mb-6 text-lg">
                  Mulai berjualan dengan menambahkan produk pertama Anda. Buat listing yang detail untuk menarik pembeli.
                </p>
                <Button onClick={handleAddProduct} size="lg" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-5 w-5" />
                  Tambah Produk Pertama
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h2>
            <Badge variant="secondary" className="text-lg px-4 py-2">{orders.length} pesanan</Badge>
          </div>

          {isLoadingOrders ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="bg-gray-200 h-4 rounded mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3 mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any[], index: number) => {
                // Order structure: [order_id, buyer_email, product_id, seller_email, quantity, total_price, status, notes, created_at, updated_at]
                const [orderId, buyerEmail, productId, , quantity, totalPrice, status, notes, createdAt] = order;
                
                // Find the corresponding product
                const product = products.find((p: any[]) => p[0] === productId);
                const productName = product ? product[2] : `Product ${productId}`;

                return (
                  <Card key={`${orderId}-${index}`} className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-gray-900">Pesanan #{orderId}</CardTitle>
                          <CardDescription className="text-gray-600 text-base">
                            Dari: {buyerEmail} • {formatDate(createdAt)}
                          </CardDescription>
                        </div>
                        <Badge className={`${getStatusColor(status)} text-sm px-3 py-1`}>
                          {status || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{productName}</p>
                          <p className="text-gray-500">Jumlah: {quantity}</p>
                        </div>

                        <div>
                          <p className="font-bold text-xl text-green-600">{formatPrice(parseFloat(totalPrice) || 0)}</p>
                        </div>

                        <div className="flex items-center justify-end space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrderDetails(order)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Detail
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Update Status
                          </Button>
                        </div>
                      </div>

                      {notes && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Catatan Pelanggan:</span> {notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <ShoppingCart className="h-20 w-20 text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum ada pesanan</h3>
                <p className="text-gray-500 text-center max-w-md text-lg">
                  Ketika pelanggan memesan produk Anda, pesanan akan muncul di sini.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
      />

      <OrderDetailModal
        isOpen={isOrderDetailModalOpen}
        onClose={() => setIsOrderDetailModalOpen(false)}
        order={selectedOrder}
        product={selectedProduct}
      />

      <OrderStatusModal
        isOpen={isOrderStatusModalOpen}
        onClose={() => setIsOrderStatusModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}