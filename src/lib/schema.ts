import { z } from "zod";

export const insertProductSchema = z.object({
  product_name: z.string().min(1, "Nama produk wajib diisi"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  price: z.number().min(0.01, "Harga harus lebih dari 0"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  image_url: z.string().optional(),
  status: z.number().optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

export const orderFormSchema = z.object({
  quantity: z.number().min(1, "Jumlah minimal 1"),
  notes: z.string().optional(),
});

export type OrderForm = z.infer<typeof orderFormSchema>;