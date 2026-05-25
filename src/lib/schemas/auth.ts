import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits" }).regex(/^[0-9+\-\s()]+$/, { message: "Invalid mobile number format" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["CLIENT", "DEALER", "AGENT", "ENTERPRISE"], { message: "Please select a valid role" }),
    purposeOfLoginId: z.string().min(1, { message: "Please select a purpose of login" }),

    // Dealer specific fields
    dealerBusinessName: z.string().optional(),
    dealerGstNumber: z.string().optional(),
    dealerCity: z.string().optional(),
    dealerState: z.string().optional(),
    dealerBankName: z.string().optional(),
    dealerAccountNum: z.string().optional(),
    dealerIfscCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.role === "DEALER") {
        return !!data.dealerBusinessName && !!data.dealerGstNumber && !!data.dealerBankName && !!data.dealerAccountNum && !!data.dealerIfscCode && !!data.dealerCity && !!data.dealerState
    }
    return true
}, {
    message: "All dealer business and bank details (GST, Bank, City, State) are required",
    path: ["dealerBusinessName"],
})

export const verifyOTPSchema = z.object({
    userId: z.string(),
    emailOTP: z.string().optional(),
    mobileOTP: z.string().optional(),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type VerifyOTPValues = z.infer<typeof verifyOTPSchema>
