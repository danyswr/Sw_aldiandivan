'use client'

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ShoppingCart, Eye, Edit, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductModal } from "@/components/product-modal";
import { OrderDetailModal } from "@/components/order-detail-modal";
import { OrderStatusModal } from "@/components/order-status-modal";
import { makeAPICall, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function SellerDashboard() {
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
        title: "Product deleted",
        description: "Product has been successfully removed."
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Could not delete the product. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleEditProduct = (product: any[]) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
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
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate statistics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p[8] === 1).length; // status is at index 8
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order[5]) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your products and orders</p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {activeProducts} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">$</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">⏳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order[6]?.toLowerCase() === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Products</h2>
            <Badge variant="secondary">{products.length} products</Badge>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
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
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  Start selling by adding your first product. Create detailed listings to attract buyers.
                </p>
                <Button onClick={handleAddProduct} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Order Management</h2>
            <Badge variant="secondary">{orders.length} orders</Badge>
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
              {orders.map((order, index) => {
                // Order structure: [order_id, buyer_email, product_id, seller_email, quantity, total_price, status, notes, created_at, updated_at]
                const [orderId, buyerEmail, productId, , quantity, totalPrice, status, notes, createdAt] = order;
                
                // Find the corresponding product
                const product = products.find((p: any[]) => p[0] === productId);
                const productName = product ? product[2] : `Product ${productId}`;

                return (
                  <Card key={`${orderId}-${index}`} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{orderId}</CardTitle>
                          <CardDescription>
                            From: {buyerEmail} • {formatDate(createdAt)}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(status)}>
                          {status || 'Unknown'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium text-gray-900">{productName}</p>
                          <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                        </div>

                        <div>
                          <p className="font-semibold text-lg">{formatPrice(parseFloat(totalPrice) || 0)}</p>
                        </div>

                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrderDetails(order)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Details
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
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Customer Notes:</span> {notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 text-center max-w-md">
                  When customers place orders for your products, they will appear here.
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