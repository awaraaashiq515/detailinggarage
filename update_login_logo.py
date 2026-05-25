with open("src/components/auth/login-form.tsx", "r") as f:
    content = f.read()

import_str = 'import { useRouter } from "next/navigation"\nimport { useEffect, useState } from "react"\nimport { getPublicHeaderSettings, type HeaderSettingsData } from "@/app/actions/header-settings"'
content = content.replace('import { useRouter } from "next/navigation"', import_str)

state_str = '''    const router = useRouter()
    
    const [settings, setSettings] = useState<HeaderSettingsData | null>(null)
    const [imgError, setImgError] = useState(false)

    useEffect(() => {
        getPublicHeaderSettings().then(setSettings)
    }, [])

    const useLogo = true
    const logoUrl = settings?.logoImageUrl || "/car-assure-logo.png"
    const brandName = settings?.brandName ?? "Car "
    const brandNameAccent = settings?.brandNameAccent ?? "Assure"'''
content = content.replace('    const router = useRouter()', state_str)

svg_str = '''                <div className="mx-auto w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                </div>'''

new_logo_str = '''                <div className="mx-auto mb-6 flex justify-center h-12">
                    {(useLogo && logoUrl && !imgError) ? (
                        <img
                            src={logoUrl}
                            alt="Brand Logo"
                            className="h-full w-auto object-contain"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="font-sans text-3xl font-black tracking-tighter text-slate-900 flex items-center h-full">
                            {brandName}<span className="text-accent">{brandNameAccent}</span>
                        </div>
                    )}
                </div>'''
content = content.replace(svg_str, new_logo_str)

with open("src/components/auth/login-form.tsx", "w") as f:
    f.write(content)
