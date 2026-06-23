import { z } from "zod";

export const createOrderSchema = z.object({
 
   street: z.string().min(5, "street is required"),
    city: z.string().min(5, "city is required"),
     governorate: z.string().min(5, "governorate is required"),
    paymentMethod: z.enum(["cash", "card"], {
      errorMap: () => ({ message: "Payment method must be cash or card" }),
    }),

    coupon: z.string().optional(),
  })


export const statusSchema = z.object({
  status: z.enum(
    ["pending", "processing", "shipped", "delivered", "cancelled"], 
    { 
      errorMap: () => ({ message: "Invalid order status. Must be one of: pending, processing, shipped, delivered, cancelled." }) 
    }
  ),

});