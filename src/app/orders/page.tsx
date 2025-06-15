'use client'

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Calendar, DollarSign, ShoppingBag } from "lucide-react";
import { OrderDetailModal } from "@/components/order-detail-modal";
import { makeAPICall, formatPrice } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function OrdersPage() {
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

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Menunggu";
      case "confirmed":
        return "Dikonfirmasi";
      case "shipped":
        return "Dikirim";
      case "delivered":
        return "Terkirim";
      case "cancelled":
        return "Dibatalkan";
      default:
        return status || "Tidak Diketahui";
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
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <h1 className="text-4xl font-bold text-gray-900">Pesanan Saya</h1>
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <ShoppingBag className="inline-block w-8 h-8 mr-3 text-blue-600" />
              Pesanan Saya
            </h1>
            <p className="text-lg text-gray-600">Lacak dan kelola riwayat pesanan Anda</p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2 bg-white/80">
            {orders.length} {orders.length === 1 ? 'pesanan' : 'pesanan'}
          </Badge>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-20 w-20 text-gray-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Belum ada pesanan</h3>
            <p className="text-gray-500 text-center max-w-md text-lg">
              Ketika Anda melakukan pemesanan pertama, pesanan akan muncul di sini. Mulai jelajahi produk untuk melakukan pembelian pertama!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {orders.map((order: any[], index: number) => {
            // Order structure: [order_id, buyer_email, product_id, seller_email, quantity, total_price, status, notes, created_at, updated_at]
            const [orderId, buyerEmail, productId, sellerEmail, quantity, totalPrice, status, notes, createdAt] = order;
            
            // Find the corresponding product
            const product = products.find((p: any[]) => p[0] === productId);
            const productName = product ? product[2] : `Produk ${productId}`;
            const productImage = product ? product[3] : '';

            return (
              <Card key={`${orderId}-${index}`} className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900">Pesanan #{orderId}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Dipesan pada {formatDate(createdAt)}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(status)} text-sm px-3 py-1`}>
                      {getStatusText(status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-4">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-16 h-16 rounded-lg object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{productName}</p>
                        <p className="text-gray-500">Jumlah: {quantity}</p>
                        <p className="text-sm text-gray-400">Penjual: {sellerEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-bold text-2xl text-green-600">{formatPrice(parseFloat(totalPrice) || 0)}</span>
                    </div>

                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                        className="flex items-center gap-2 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </div>
                  </div>

                  {notes && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Catatan:</span> {notes}
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