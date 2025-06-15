import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { makeAPICall, fileToBase64 } from "@/lib/api";
import { insertProductSchema, type InsertProduct } from "@/lib/schema";
import { Upload, X } from "lucide-react";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any[] | null; // Edit mode if product is provided
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isEdit = !!product;
  
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      product_name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      status: 1,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEdit && product) {
      form.reset({
        product_name: product[2] || "",
        description: product[4] || "",
        price: product[5] || 0,
        stock: product[6] || 0,
        category: product[7] || "",
        status: product[8] || 1,
      });
      
      if (product[3]) {
        setImagePreview(product[3]);
      }
    } else {
      form.reset({
        product_name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        status: 1,
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [isEdit, product, form]);

  const productMutation = useMutation({
    mutationFn: async (data: InsertProduct) => {
      console.log('Product mutation data:', data);
      console.log('Is edit mode:', isEdit);
      console.log('Product data:', product);
      
      const apiData: any = {
        email: user?.email,
        action: isEdit ? 'update' : 'create',
        data: {
          product_name: data.product_name,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          category: data.category,
          status: data.status || 1,
        },
      };

      if (isEdit && product) {
        apiData.product_id = product[0];
        console.log('Setting product_id for update:', product[0]);
      }

      // Handle image upload
      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        apiData.data.imageData = base64.split(',')[1]; // Remove data:image/...;base64, prefix
        apiData.data.mimeType = imageFile.type;
        apiData.data.fileName = imageFile.name;
        console.log('Adding image data to request');
      }

      console.log('Final API payload for products:', apiData);
      return makeAPICall(apiData, 'products');
    },
    onSuccess: (response) => {
      console.log('Product save response:', response);
      if (response.success) {
        toast({
          title: isEdit ? "Produk berhasil diupdate!" : "Produk berhasil ditambahkan!",
          description: "Perubahan telah disimpan",
        });
        
        // Invalidate and refetch products
        queryClient.invalidateQueries({ queryKey: ['/api/products'] });
        onClose();
      } else {
        console.error('Product save failed:', response.error);
        toast({
          title: "Gagal menyimpan produk",
          description: response.error || "Terjadi kesalahan. Pastikan Google Apps Script sudah diperbarui.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Product save error:', error);
      toast({
        title: "Gagal menyimpan produk",
        description: "Terjadi kesalahan saat menyimpan produk",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    const fileInput = document.getElementById('product-image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = form.handleSubmit((data) => {
    productMutation.mutate(data);
  });

  const handleClose = () => {
    form.reset();
    setImagePreview("");
    setImageFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name">Nama Produk</Label>
            <Input
              id="product_name"
              {...form.register('product_name')}
              error={form.formState.errors.product_name?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-image">Gambar Produk</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="mx-auto max-h-48 rounded-lg object-cover"
                  />
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus Gambar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Klik untuk upload gambar</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('product-image')?.click()}
                  >
                    Pilih File
                  </Button>
                </div>
              )}
              <input
                id="product-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              rows={4}
              {...form.register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                {...form.register('price', { valueAsNumber: true })}
                error={form.formState.errors.price?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                {...form.register('stock', { valueAsNumber: true })}
                error={form.formState.errors.stock?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              {...form.register('category')}
              error={form.formState.errors.category?.message}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={productMutation.isPending}
            >
              {productMutation.isPending
                ? "Menyimpan..."
                : isEdit
                ? "Update Produk"
                : "Simpan Produk"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={productMutation.isPending}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
