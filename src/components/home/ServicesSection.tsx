"use client"

import { Wrench, Car, ShieldCheck, ShoppingCart, MessageSquare, Info } from "lucide-react"

const services = [
    { icon: <Wrench className="w-6 h-6" />, label: 'Car Repair', count: 12, color: '#ff4b55' },
    { icon: <ShieldCheck className="w-6 h-6" />, label: 'Detailing', count: 8, color: '#ff4b55' },
    { icon: <Car className="w-6 h-6" />, label: 'PDI Check', count: 15, color: '#ff4b55' },
    { icon: <ShoppingCart className="w-6 h-6" />, label: 'Marketplace', count: 42, color: '#ff4b55' },
    { icon: <MessageSquare className="w-6 h-6" />, label: 'Updates', count: 24, color: '#ff4b55' },
    { icon: <Info className="w-6 h-6" />, label: 'About', count: 1, color: '#ff4b55' },
]

export default function ServicesSection() {
    return (
        <section className="py-20 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                    {services.map((service, i) => (
                        <div key={i} className="flex flex-col items-center gap-4 group cursor-pointer section-reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                            <div className="w-20 h-20 rounded-full border border-gray-100 flex items-center justify-center text-[#ff4b55] group-hover:bg-[#ff4b55] group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1">
                                {service.icon}
                            </div>
                            <div className="text-center">
                                <div className="text-[14px] font-bold text-gray-800 group-hover:text-[#ff4b55] transition-colors">
                                    {service.label}
                                </div>
                                <div className="text-[12px] text-gray-400 font-medium">
                                    ({service.count})
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
