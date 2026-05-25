"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, MapPin, Car, Phone, FileText } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
// import { createPDIRequest } from "@/app/actions/pdi-requests" // We'll bind this later or pass it as prop/import
// Importing dynamically or directly depends on project structure, assuming server actions allow direct import
import { createPDIRequest } from "@/app/actions/pdi-requests"

const formSchema = z.object({
    vehicleMake: z.string().min(1, "Vehicle make is required"),
    vehicleModel: z.string().min(1, "Vehicle model is required"),
    vehicleType: z.string().min(1, "Vehicle type is required"),
    location: z.string().min(1, "Location is required"),
    mobile: z.string().min(10, "Valid mobile number is required"),
    preferredDate: z.date().optional(),
    notes: z.string().optional(),
})

interface PDIRequestFormProps {
    user?: {
        name: string
        email: string
        mobile?: string | null
    }
}

export function PDIRequestForm({ user }: PDIRequestFormProps) {
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vehicleMake: "",
            vehicleModel: "",
            vehicleType: "",
            location: "",
            mobile: user?.mobile || "",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            toast({
                title: "Authentication Required",
                description: "Please log in to submit a request.",
                variant: "destructive"
            })
            return
        }

        setSubmitting(true)
        try {
            const formData = {
                ...values,
                preferredDate: values.preferredDate?.toISOString()
            }

            const result = await createPDIRequest(formData)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                })
            } else {
                setSubmitted(true)
                toast({
                    title: "Request Submitted",
                    description: "We have received your PDI request.",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit request. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (!user) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center space-y-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Car className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Ready to inspect your car?</h3>
                <p className="text-gray-400 max-w-sm mx-auto">
                    Please log in or register to submit a PDI request. It takes less than a minute.
                </p>
                <div className="flex gap-4 justify-center pt-4">
                    <Button asChild variant="default" className="bg-amber-500 text-black hover:bg-amber-400">
                        <a href="/login">Log In</a>
                    </Button>
                    <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/10">
                        <a href="/register">Register</a>
                    </Button>
                </div>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 rounded-full bg-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
                <div className="p-4 bg-black/20 rounded-lg max-w-sm mx-auto mb-6">
                    <p className="text-green-400 font-medium">✅ Your PDI request has been sent successfully.</p>
                    <p className="text-gray-400 text-sm mt-1">Our team will contact you shortly.</p>
                </div>
                <Button
                    onClick={() => {
                        setSubmitted(false)
                        form.reset()
                    }}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                >
                    Submit Another Request
                </Button>
            </div>
        )
    }

    return (
        <div className="bg-[#111318] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-amber-500/10 border-b border-amber-500/10 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-500" />
                    Request PDI Service
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                    Fill in the details below and we'll handle the rest.
                </p>
            </div>

            <div className="p-6 md:p-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Auto-filled User Info Display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Client Name</label>
                                <div className="text-white font-medium mt-1">{user.name}</div>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email</label>
                                <div className="text-white font-medium mt-1">{user.email}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="vehicleMake"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Vehicle Make</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Toyota, BMW" {...field} className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleModel"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Vehicle Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Camry, X5" {...field} className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Vehicle Type</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Sedan, SUV, EV" {...field} className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-300">Mobile Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                                <Input placeholder="+1 234 567 890" {...field} className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">PDI Location</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                            <Input placeholder="Showroom Name, City, Address" {...field} className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="preferredDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="text-gray-300">Preferred Date (Optional)</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal bg-black/20 border-white/10 text-white hover:bg-white/5 hover:text-white",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span className="text-gray-500">Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-300">Additional Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Any specific requirements or concerns..."
                                            {...field}
                                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-amber-500/50 min-h-[100px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-amber-500 text-black hover:bg-amber-400 font-bold h-12 uppercase tracking-wide"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Submit PDI Request"
                            )}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
