import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { makeAPICall, formatPrice } from "@/lib/api";
import { orderFormSchema, type OrderForm } from "@/lib/schema";
import { ImageIcon } from "lucide-react";
import { z } from "zod";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any[] | null; // Product array from Google Sheets
}



export function OrderModal({ isOpen, onClose, product }: OrderModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [totalPrice, setTotalPrice] = useState(0);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const quantity = form.watch('quantity');

  useEffect(() => {
    if (product && quantity) {
      setTotalPrice(product[5] * quantity);
    }
  }, [product, quantity]);

  const orderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      if (!product || !user) throw new Error("Missing required data");

      const orderData = {
        product_id: product[0],
        seller_id: product[1],
        quantity: data.quantity,
        total_price: product[5] * data.quantity,
      };

      return makeAPICall({
        email: user.email,
        action: 'create',
        data: orderData,
      }, 'orders');
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Pesanan berhasil dibuat!",
          description: "Pesanan Anda telah diterima",
        });
        
        // Invalidate products to refresh stock
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        onClose();
      } else {
        toast({
          title: "Gagal membuat pesanan",
          description: response.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Gagal membuat pesanan",
        description: "Terjadi kesalahan saat membuat pesanan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    orderMutation.mutate(data);
  });

  const handleClose = () => {
    form.reset({ quantity: 1 });
    onClose();
  };

  if (!product) return null;

  // Product array structure: [product_id, user_id, product_name, image_url, description, price, stock, category, status, created_at, updated_at]
  const [productId, userId, productName, imageUrl, description, price, stock] = product;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pesan Produk</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl.includes('drive.google.com/uc?') 
                    ? imageUrl.replace('uc?export=view&id=', 'thumbnail?id=').concat('&sz=w400-h400')
                    : imageUrl
                  } 
                  alt={productName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.log('Image failed to load:', imageUrl);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{productName}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {description || "Tidak ada deskripsi"}
              </p>
              <p className="text-xl font-bold text-primary mt-1">
                {formatPrice(price)}
              </p>
              <p className="text-sm text-gray-500">
                Stok tersedia: {stock}
              </p>
            </div>
          </div>

          {/* Order Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={stock}
                {...form.register('quantity', { valueAsNumber: true })}
                error={form.formState.errors.quantity?.message}
              />
            </div>

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Harga:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? "Memproses..." : "Pesan Sekarang"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
