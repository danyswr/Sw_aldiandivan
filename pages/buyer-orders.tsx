'use client'

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Calendar, DollarSign } from "lucide-react";
import { OrderDetailModal } from "@/components/order-detail-modal";
import { makeAPICall, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function BuyerOrders() {
  const { user } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any[] | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any[] | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fetch buyer's orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["buyer-orders", user?.email],
    queryFn: async () => {
      const response = await makeAPICall({
        action: "read",
        table: "orders",
        filters: { buyer_email: user?.email }
      });
      return response.success ? response.data : [];
    },
    enabled: !!user?.email
  });

  // Fetch products to get product details
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await makeAPICall({
        action: "read",
        table: "products"
      });
      return response.success ? response.data : [];
    }
  });

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

  const handleViewDetails = (order: any[]) => {
    // Find the corresponding product
    const productId = order[2]; // product_id is at index 2
    const product = products.find((p: any[]) => p[0] === productId);
    
    setSelectedOrder(order);
    setSelectedProduct(product || null);
    setIsDetailModalOpen(true);
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>
        <div className="grid gap-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">Track and manage your order history</p>
        </div>
        <Badge variant="secondary">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 text-center max-w-md">
              When you place your first order, it will appear here. Start browsing products to make your first purchase!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order, index) => {
            // Order structure: [order_id, buyer_email, product_id, seller_email, quantity, total_price, status, notes, created_at, updated_at]
            const [orderId, buyerEmail, productId, sellerEmail, quantity, totalPrice, status, notes, createdAt] = order;
            
            // Find the corresponding product
            const product = products.find((p: any[]) => p[0] === productId);
            const productName = product ? product[2] : `Product ${productId}`;
            const productImage = product ? product[3] : '';

            return (
              <Card key={`${orderId}-${index}`} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{orderId}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Placed on {formatDate(createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{productName}</p>
                        <p className="text-sm text-gray-500">Quantity: {quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-lg">{formatPrice(parseFloat(totalPrice) || 0)}</span>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedOrder}
        product={selectedProduct}
      />
    </div>
  );
}