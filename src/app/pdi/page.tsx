import { PDIRequestForm } from "@/components/pdi/request-form"
import { getCurrentUser } from "@/lib/auth/jwt"
import { db } from "@/lib/db"
import { CheckCircle2, Shield, Search, FileText, ArrowRight, Star } from "lucide-react"
import Link from "next/link"

// Fetch packages (view only)
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { getWebsiteContent } from "@/lib/website-content"

async function getPDIPackages() {
    return await db.package.findMany({
        where: { type: "PDI", status: "ACTIVE" },
        orderBy: { price: "asc" }
    })
}

export default async function PDIPage() {
    const user = await getCurrentUser()
    const packages = await getPDIPackages()
    const content = await getWebsiteContent()

    return (
        <div className="min-h-screen bg-[#08090c] text-white selection:bg-accent/30">
            <Navbar />
            <div className="pt-20">
                {/* Hero Section */}
                <div className="relative pt-24 pb-12 overflow-hidden lg:pt-28 lg:pb-16">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-[#08090c] to-blue-500/5 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/20 blur-[120px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
                    <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none opacity-50 mix-blend-screen" />
                    
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                            <div className="space-y-8 text-center lg:text-left z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 transition-colors cursor-default backdrop-blur-sm shadow-[0_0_20px_rgba(22, 172, 212,0.15)]">
                                    <Shield className="w-4 h-4" />
                                    <span>Premium Car Care Services</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
                                    Protect Your <br className="hidden md:block lg:hidden" /> Investment.<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent-hover">
                                        Detailing Perfection.
                                    </span>
                                </h1>
                                <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    From rigorous Pre-Delivery Inspections to flawless Ceramic Coatings, we ensure your vehicle stays pristine. Never buy a lemon.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                                    <a href="#book" className="px-8 py-4 rounded-full bg-accent hover:bg-accent-hover text-black font-bold tracking-wide transition-all shadow-[0_0_30px_rgba(22, 172, 212,0.3)] hover:shadow-[0_0_40px_rgba(22, 172, 212,0.5)] hover:-translate-y-1">
                                        Book Inspection
                                    </a>
                                    <a href="#packages" className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide transition-all border border-white/10 hover:border-white/20 hover:-translate-y-1">
                                        View Pricing
                                    </a>
                                </div>
                            </div>
                            
                            <div className="relative lg:h-[450px] flex items-center justify-center lg:justify-end z-10 mt-12 lg:mt-0">
                                <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] lg:aspect-auto lg:h-full group">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-blue-500/20 rounded-3xl transform rotate-3 scale-105 opacity-50 group-hover:rotate-6 transition-transform duration-700 blur-xl"></div>
                                    <img 
                                        src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&w=1200&q=80" 
                                        alt="Premium Car Detailing" 
                                        className="relative w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 group-hover:-translate-y-2 transition-transform duration-700"
                                    />
                                    {/* Floating Badges */}
                                    <div className="absolute -left-6 top-1/4 bg-[#111318]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">50+ Point</div>
                                                <div className="text-gray-400 text-xs">PDI Check</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -right-6 bottom-1/4 bg-[#111318]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                                <Star className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold">99%</div>
                                                <div className="text-gray-400 text-xs">Happy Clients</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Us Section */}
                <div id="about" className="py-16 bg-[#111318] border-y border-white/5 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-8">
                                <div className="space-y-4">
                                    <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">About Us</h2>
                                    <h3 className="text-3xl md:text-4xl font-bold text-white">{content.about.title}</h3>
                                </div>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    {content.about.description}
                                </p>
                                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10">
                                    {content.about.stats.map((stat, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="text-3xl font-bold text-white">{stat.value}</div>
                                            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-2xl transform translate-x-4 translate-y-4" />
                                <img src={content.about.image} alt="About Us" className="w-full h-[400px] object-cover rounded-2xl relative z-10 border border-white/10 shadow-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div id="services" className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Our Expertise</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-white">Premium Services</h3>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {content.services.filter(s => s.isActive).map((service) => (
                            <div key={service.id} className="group p-8 rounded-3xl bg-[#111318] border border-white/5 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {service.icon === 'Search' && <Search className="w-7 h-7 text-accent" />}
                                    {service.icon === 'Shield' && <Shield className="w-7 h-7 text-accent" />}
                                    {service.icon === 'Sparkles' && <Star className="w-7 h-7 text-accent" />}
                                    {!['Search', 'Shield', 'Sparkles'].includes(service.icon) && <CheckCircle2 className="w-7 h-7 text-accent" />}
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-4">{service.title}</h4>
                                <p className="text-gray-400 leading-relaxed">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Request Form & How it Works */}
                <div id="book" className="py-16 bg-[#111318] border-y border-white/5 relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4">
                                    <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Book a Service</h2>
                                    <h3 className="text-3xl md:text-4xl font-bold text-white">How It Works</h3>
                                </div>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[#151821] text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/10 bg-[#151821] shadow">
                                            <h4 className="font-bold text-white mb-1">1. Submit Request</h4>
                                            <p className="text-sm text-gray-400">Fill out the simple form with your details.</p>
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[#151821] text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <Search className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/10 bg-[#151821] shadow">
                                            <h4 className="font-bold text-white mb-1">2. Expert Service</h4>
                                            <p className="text-sm text-gray-400">Our engineers perform the requested service.</p>
                                        </div>
                                    </div>
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-[#151821] text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/10 bg-[#151821] shadow">
                                            <h4 className="font-bold text-white mb-1">3. Completion</h4>
                                            <p className="text-sm text-gray-400">Receive reports or your pristine vehicle back.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Request Form */}
                            <div className="flex-1 w-full max-w-lg bg-[#08090c] p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-6">Book Now</h3>
                                <PDIRequestForm user={user ? { name: user.name, email: user.email, mobile: (user as any).mobile } : undefined} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Packages Section */}
                <div id="packages" className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                        <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Pricing</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-white">Transparent Packages</h3>
                    </div>

                    <div className={`grid gap-8 ${packages.length === 1 ? 'max-w-xl mx-auto' : 'md:grid-cols-3'}`}>
                        {packages.length > 0 ? (
                            packages.map((pkg) => (
                                <div key={pkg.id} className="bg-[#111318] border border-white/5 rounded-3xl p-8 flex flex-col hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(22, 172, 212,0.3)] group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-transparent blur-xl" />
                                    <div className="mb-8 relative z-10">
                                        <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-extrabold text-accent">₹{pkg.price}</span>
                                            <span className="text-gray-500 text-sm font-medium">/ vehicle</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1 relative z-10">
                                        <li className="flex items-center gap-3 text-gray-300">
                                            <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                                            <span>{pkg.pdiCount} Inspection{pkg.pdiCount > 1 ? 's' : ''}</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-gray-300">
                                            <Star className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                            <span className="leading-relaxed">{pkg.description}</span>
                                        </li>
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-16 bg-[#111318] rounded-3xl border border-white/5 border-dashed">
                                <p className="text-gray-500 text-lg">No packages currently available.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gallery Section */}
                {content.gallery.filter(g => g.isActive).length > 0 && (
                    <div id="gallery" className="py-16 bg-[#111318] border-y border-white/5">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                                <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Portfolio</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white">Our Masterpieces</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {content.gallery.filter(g => g.isActive).map((img) => (
                                    <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border border-white/10">
                                        <img src={img.url} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <span className="text-accent text-sm font-semibold mb-1">{img.category}</span>
                                            <h4 className="text-white text-lg font-bold">{img.title}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Testimonials Section */}
                {content.testimonials.filter(t => t.isActive).length > 0 && (
                    <div id="testimonials" className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                            <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Testimonials</h2>
                            <h3 className="text-3xl md:text-4xl font-bold text-white">Client Stories</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {content.testimonials.filter(t => t.isActive).map((test) => (
                                <div key={test.id} className="bg-[#111318] p-8 rounded-3xl border border-white/5 relative">
                                    <div className="absolute top-8 right-8 text-accent/20">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.017 21L16.439 16.5C14.757 16.5 13.398 15.352 13.398 13.5C13.398 11.648 14.898 10.148 16.75 10.148C18.602 10.148 20.102 11.648 20.102 13.5C20.102 15.699 18.344 21 15.828 21H14.017ZM3.914 21L6.336 16.5C4.654 16.5 3.295 15.352 3.295 13.5C3.295 11.648 4.795 10.148 6.647 10.148C8.499 10.148 9.999 11.648 9.999 13.5C9.999 15.699 8.241 21 5.725 21H3.914Z" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        {test.avatarUrl && <img src={test.avatarUrl} alt={test.name} className="w-14 h-14 rounded-full object-cover border border-white/10" />}
                                        <div>
                                            <h4 className="text-white font-bold">{test.name}</h4>
                                            <p className="text-gray-500 text-sm">{test.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed relative z-10 italic">"{test.content}"</p>
                                    <div className="flex gap-1 mt-6">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'text-accent fill-accent' : 'text-gray-700'}`} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Social Integration */}
                {(content.social.instagramUrl || content.social.facebookUrl) && (
                    <div id="social" className="py-16 bg-[#111318] border-y border-white/5">
                        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
                            <div className="max-w-3xl mx-auto mb-12 space-y-4">
                                <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Follow Us</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white">Join the Community</h3>
                            </div>
                            
                            {/* If an elfsight widget ID is provided, embed it, else show a button */}
                            {content.social.widgetId && content.social.widgetId !== 'YOUR_ELFSIGHT_WIDGET_ID' ? (
                                <div className="elfsight-app-wrapper min-h-[300px] flex items-center justify-center border border-white/10 rounded-3xl bg-black/20 p-8">
                                    <div className={`elfsight-app-${content.social.widgetId}`}></div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap justify-center gap-6">
                                    {content.social.instagramUrl && (
                                        <a href={content.social.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] rounded-full text-white font-bold hover:scale-105 transition-transform shadow-lg">
                                            Instagram
                                        </a>
                                    )}
                                    {content.social.facebookUrl && (
                                        <a href={content.social.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-[#1877F2] rounded-full text-white font-bold hover:scale-105 transition-transform shadow-lg">
                                            Facebook
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Contact Section */}
                <div id="contact" className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-accent font-semibold tracking-wider uppercase text-sm">Get in Touch</h2>
                                <h3 className="text-3xl md:text-4xl font-bold text-white">Visit Our Studio</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Location</h4>
                                        <p className="text-gray-400 mt-1 leading-relaxed">{content.contact.address}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Phone</h4>
                                        <p className="text-gray-400 mt-1">{content.contact.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 border border-accent/20">
                                        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Email</h4>
                                        <p className="text-gray-400 mt-1">{content.contact.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden bg-gray-900 border border-white/10 aspect-video lg:aspect-auto">
                            {/* We simulate a map if URL is given, otherwise placeholder */}
                            <iframe 
                                src="https://maps.google.com/maps?width=100%25&height=600&hl=en&q=Mandi,%20Himachal%20Pradesh&t=&z=13&ie=UTF8&iwloc=B&output=embed" 
                                className="absolute inset-0 w-full h-full border-0 grayscale invert opacity-70" 
                                allowFullScreen={false} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                </div>

            </div>
            {content.social.widgetId && content.social.widgetId !== 'YOUR_ELFSIGHT_WIDGET_ID' && (
                <script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
            )}
            <Footer />
        </div>
    )
}
