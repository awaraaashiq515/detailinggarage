"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

type Profile = {
    businessName: string; tagline: string; logoUrl: string
    phone: string; altPhone: string; email: string; website: string
    address: string; city: string; state: string; pinCode: string; country: string
    gstin: string; pan: string; cin: string; msme: string
    bankName: string; accountName: string; accountNumber: string; ifscCode: string; upiId: string
    defaultNotes: string; defaultTerms: string; signatureUrl: string
}

const EMPTY: Profile = {
    businessName: "", tagline: "", logoUrl: "",
    phone: "", altPhone: "", email: "", website: "",
    address: "", city: "", state: "", pinCode: "", country: "India",
    gstin: "", pan: "", cin: "", msme: "",
    bankName: "", accountName: "", accountNumber: "", ifscCode: "", upiId: "",
    defaultNotes: "", defaultTerms: "", signatureUrl: "",
}

const ACCENT = "#2a6fbd"
const lbl: React.CSSProperties = { display: "block", fontSize: "10px", fontWeight: "bold", color: "#444", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.3px" }
const inp: React.CSSProperties = { width: "100%", padding: "4px 6px", fontSize: "12px", border: "1px solid #b0c8e8", borderRadius: "2px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }
const section: React.CSSProperties = { background: "white", border: "1px solid #b0c8e8", borderRadius: "2px", marginBottom: "8px" }
const sHdr = (color = ACCENT): React.CSSProperties => ({ background: color, color: "white", padding: "4px 10px", fontWeight: "bold", fontSize: "11px", letterSpacing: "0.3px" })
const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "10px 12px" }
const grid3: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", padding: "10px 12px" }

export default function BillingSettingsPage() {
    const [profile, setProfile] = useState<Profile>(EMPTY)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        fetch("/api/admin/billing/profile")
            .then(r => r.json())
            .then(d => { if (d.success) setProfile({ ...EMPTY, ...d.profile }); setLoading(false) })
            .catch(() => setLoading(false))
    }, [])

    const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setProfile(p => ({ ...p, [k]: e.target.value }))

    const handleSave = async () => {
        setSaving(true)
        const res = await fetch("/api/admin/billing/profile", {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile),
        })
        const d = await res.json()
        setSaving(false)
        if (d.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
        else alert(d.error || "Failed to save")
    }

    if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial", color: "#555" }}>Loading settings...</div>

    return (
        <div style={{ minHeight: "100vh", background: "#d8e4f0", fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
            {/* Top Bar */}
            <div style={{ background: `linear-gradient(to bottom, #3a80cd, ${ACCENT})`, color: "white", padding: "5px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Link href="/super-admin" style={{ color: "white", textDecoration: "none" }}>← Dashboard</Link>
                    <span style={{ opacity: 0.5 }}>|</span>
                    <span style={{ fontWeight: "bold", fontSize: "13px" }}>⚙️ Billing Settings — Business Profile</span>
                </div>
                <button onClick={handleSave} disabled={saving} style={{ background: saved ? "#198a19" : "#16acd4", color: saved ? "white" : "#000", padding: "4px 18px", fontSize: "11px", fontWeight: "bold", border: "none", borderRadius: "2px", cursor: "pointer" }}>
                    {saving ? "Saving..." : saved ? "✓ Saved!" : "💾 Save Settings"}
                </button>
            </div>

            <div style={{ maxWidth: "860px", margin: "10px auto", padding: "0 10px" }}>

                {/* Preview Banner */}
                <div style={{ background: "white", border: `2px solid ${ACCENT}`, borderRadius: "3px", padding: "10px 16px", marginBottom: "10px", display: "flex", gap: "16px", alignItems: "center" }}>
                    {profile.logoUrl && <img src={profile.logoUrl} alt="logo" style={{ height: "48px", objectFit: "contain" }} />}
                    <div>
                        <div style={{ fontSize: "18px", fontWeight: "bold", color: ACCENT }}>{profile.businessName || "Your Business Name"}</div>
                        <div style={{ fontSize: "11px", color: "#666" }}>{profile.tagline}</div>
                        <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
                            {[profile.phone, profile.email, profile.city, profile.gstin ? `GSTIN: ${profile.gstin}` : ""].filter(Boolean).join("  •  ")}
                        </div>
                    </div>
                </div>

                {/* ── BASIC INFO ── */}
                <div style={section}>
                    <div style={sHdr()}>🏢 Business Information</div>
                    <div style={grid2}>
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={lbl}>Business / Company Name *</label>
                            <input value={profile.businessName} onChange={set("businessName")} style={{ ...inp, fontSize: "14px", fontWeight: "bold" }} placeholder="e.g. Detailing Garage" />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={lbl}>Tagline / Sub-heading</label>
                            <input value={profile.tagline} onChange={set("tagline")} style={inp} placeholder="e.g. Premium Auto Protection Studio" />
                        </div>
                        <div style={{ gridColumn: "1/-1" }}>
                            <label style={lbl}>Logo URL (paste image link or leave blank)</label>
                            <input value={profile.logoUrl} onChange={set("logoUrl")} style={inp} placeholder="https://..." />
                        </div>
                    </div>
                </div>

                {/* ── CONTACT ── */}
                <div style={section}>
                    <div style={sHdr("#1a5fa0")}>📞 Contact Details</div>
                    <div style={grid2}>
                        <div>
                            <label style={lbl}>Primary Phone</label>
                            <input value={profile.phone} onChange={set("phone")} style={inp} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                            <label style={lbl}>Alternate Phone</label>
                            <input value={profile.altPhone} onChange={set("altPhone")} style={inp} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                            <label style={lbl}>Email</label>
                            <input type="email" value={profile.email} onChange={set("email")} style={inp} placeholder="info@yourbusiness.com" />
                        </div>
                        <div>
                            <label style={lbl}>Website</label>
                            <input value={profile.website} onChange={set("website")} style={inp} placeholder="www.yourbusiness.com" />
                        </div>
                    </div>
                </div>

                {/* ── ADDRESS ── */}
                <div style={section}>
                    <div style={sHdr("#256a56")}>📍 Business Address</div>
                    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>
                            <label style={lbl}>Street Address / Area</label>
                            <textarea value={profile.address} onChange={set("address")} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Shop No., Building, Street, Area" />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                            <div>
                                <label style={lbl}>City</label>
                                <input value={profile.city} onChange={set("city")} style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>State</label>
                                <input value={profile.state} onChange={set("state")} style={inp} />
                            </div>
                            <div>
                                <label style={lbl}>PIN Code</label>
                                <input value={profile.pinCode} onChange={set("pinCode")} style={inp} maxLength={6} />
                            </div>
                            <div>
                                <label style={lbl}>Country</label>
                                <input value={profile.country} onChange={set("country")} style={inp} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TAX ── */}
                <div style={section}>
                    <div style={sHdr("#6a4a00")}>🏛 Tax & Legal Details</div>
                    <div style={grid2}>
                        <div>
                            <label style={lbl}>GSTIN</label>
                            <input value={profile.gstin} onChange={set("gstin")} style={{ ...inp, fontFamily: "monospace" }} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                        </div>
                        <div>
                            <label style={lbl}>PAN</label>
                            <input value={profile.pan} onChange={set("pan")} style={{ ...inp, fontFamily: "monospace" }} placeholder="ABCDE1234F" maxLength={10} />
                        </div>
                        <div>
                            <label style={lbl}>CIN (Company ID)</label>
                            <input value={profile.cin} onChange={set("cin")} style={{ ...inp, fontFamily: "monospace" }} placeholder="Optional" />
                        </div>
                        <div>
                            <label style={lbl}>MSME / Udyam No.</label>
                            <input value={profile.msme} onChange={set("msme")} style={{ ...inp, fontFamily: "monospace" }} placeholder="Optional" />
                        </div>
                    </div>
                </div>

                {/* ── BANK ── */}
                <div style={section}>
                    <div style={sHdr("#1a5a30")}>🏦 Bank & Payment Details</div>
                    <div style={grid3}>
                        <div>
                            <label style={lbl}>Bank Name</label>
                            <input value={profile.bankName} onChange={set("bankName")} style={inp} placeholder="e.g. HDFC Bank" />
                        </div>
                        <div>
                            <label style={lbl}>Account Holder Name</label>
                            <input value={profile.accountName} onChange={set("accountName")} style={inp} />
                        </div>
                        <div>
                            <label style={lbl}>Account Number</label>
                            <input value={profile.accountNumber} onChange={set("accountNumber")} style={{ ...inp, fontFamily: "monospace" }} />
                        </div>
                        <div>
                            <label style={lbl}>IFSC Code</label>
                            <input value={profile.ifscCode} onChange={set("ifscCode")} style={{ ...inp, fontFamily: "monospace" }} placeholder="HDFC0001234" />
                        </div>
                        <div>
                            <label style={lbl}>UPI ID</label>
                            <input value={profile.upiId} onChange={set("upiId")} style={{ ...inp, fontFamily: "monospace" }} placeholder="business@upi" />
                        </div>
                    </div>
                </div>

                {/* ── DEFAULTS ── */}
                <div style={section}>
                    <div style={sHdr("#555")}>📝 Default Note & Terms (Pre-filled on every invoice)</div>
                    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div>
                            <label style={lbl}>Default Note (printed on invoice)</label>
                            <textarea value={profile.defaultNotes} onChange={set("defaultNotes")} rows={3} style={{ ...inp, resize: "vertical" }} placeholder="e.g. WE SHALL NOT BE RESPONSIBLE FOR..." />
                        </div>
                        <div>
                            <label style={lbl}>Default Terms & Conditions</label>
                            <textarea value={profile.defaultTerms} onChange={set("defaultTerms")} rows={3} style={{ ...inp, resize: "vertical" }} placeholder="e.g. Payment due within 7 days..." />
                        </div>
                        <div>
                            <label style={lbl}>Signature Image URL (authorised signatory)</label>
                            <input value={profile.signatureUrl} onChange={set("signatureUrl")} style={inp} placeholder="https://..." />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
                    <button onClick={handleSave} disabled={saving} style={{ background: saved ? "#198a19" : ACCENT, color: "white", padding: "7px 28px", fontSize: "13px", fontWeight: "bold", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                        {saving ? "Saving..." : saved ? "✓ Settings Saved!" : "💾 Save All Settings"}
                    </button>
                </div>
            </div>
        </div>
    )
}
