"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Users, Plus, Search, ChevronRight, Phone, Mail,
    UserCheck, DollarSign, Calendar, CheckCircle2, XCircle,
    Clock, AlertCircle, Edit, Trash2, ArrowUpRight, Check,
    Filter, Wrench, Sparkles, Award, FileText, IndianRupee,
    Briefcase, ShieldCheck, RefreshCw, X, MoreVertical,
    Eye, EyeOff, Key, Smartphone, MapPin
} from "lucide-react"

type StaffMember = {
    id: string
    userId?: string | null
    name: string
    phone: string | null
    email: string | null
    hasPortalAccess?: boolean
    role: string
    specialization: string | null
    salaryType: string
    salary: number
    commissionRate: number
    status: string
    joinedDate: string
    aadharOrId: string | null
    address: string | null
    notes: string | null
    todayStatus: string
    checkIn: string | null
    checkOut: string | null
    punchMethod?: string | null
    latitude?: number | null
    longitude?: number | null
    distanceMeters?: number | null
    completedJobsCount: number
    pendingCommissionsCount: number
    pendingCommissionAmount: number
}

type CommissionItem = {
    id: string
    staffId: string
    staff: { id: string; name: string; role: string; phone: string | null; commissionRate: number }
    invoiceId: string | null
    invoice?: {
        id: string
        invoiceNumber: string
        grandTotal: number
        subTotal: number
        vehicleName: string | null
        vehicleRegNo: string | null
        date: string
        status: string
        client: { name: string }
    } | null
    amount: number
    rate: number
    status: string
    paidAt: string | null
    notes: string | null
    createdAt: string
}

const ROLES = [
    { value: "TECHNICIAN", label: "Detailing Technician" },
    { value: "PPF_INSTALLER", label: "PPF & Wrap Specialist" },
    { value: "CERAMIC_SPECIALIST", label: "Ceramic Coating Expert" },
    { value: "PAINTER", label: "Painter & Denter" },
    { value: "MECHANIC", label: "Automobile Mechanic" },
    { value: "WASHER", label: "Car Washer & Prep" },
    { value: "MANAGER", label: "Workshop Manager" },
    { value: "HELPER", label: "Workshop Helper" },
]

const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    TECHNICIAN: { bg: "#16acd415", text: "#16acd4", border: "#16acd430" },
    PPF_INSTALLER: { bg: "#c084fc15", text: "#c084fc", border: "#c084fc30" },
    CERAMIC_SPECIALIST: { bg: "#38bdf815", text: "#38bdf8", border: "#38bdf830" },
    PAINTER: { bg: "#fb923c15", text: "#fb923c", border: "#fb923c30" },
    MECHANIC: { bg: "#f472b615", text: "#f472b6", border: "#f472b630" },
    WASHER: { bg: "#34d39915", text: "#34d399", border: "#34d39930" },
    MANAGER: { bg: "#fbbf2415", text: "#fbbf24", border: "#fbbf2430" },
    HELPER: { bg: "#94a3b815", text: "#94a3b8", border: "#94a3b830" },
}

export default function ShopStaffPage() {
    const [activeTab, setActiveTab] = useState<"directory" | "attendance" | "commissions">("directory")
    const [staffList, setStaffList] = useState<StaffMember[]>([])
    const [summary, setSummary] = useState<any>({
        totalStaff: 0,
        activeStaff: 0,
        presentToday: 0,
        totalMonthlySalary: 0,
        totalPendingCommissions: 0,
    })
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")

    // Attendance State
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0])
    const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; checkIn: string; checkOut: string; notes: string }>>({})
    const [savingAttendance, setSavingAttendance] = useState(false)
    const [attendanceSavedToast, setAttendanceSavedToast] = useState(false)

    // Commissions State
    const [commissions, setCommissions] = useState<CommissionItem[]>([])
    const [commissionFilter, setCommissionFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL")
    const [loadingCommissions, setLoadingCommissions] = useState(false)
    const [showManualCommissionModal, setShowManualCommissionModal] = useState(false)
    const [manualCommissionForm, setManualCommissionForm] = useState({
        staffId: "",
        amount: "",
        notes: ""
    })

    // Add / Edit Staff Modal
    const [showStaffModal, setShowStaffModal] = useState(false)
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
    const [savingStaff, setSavingStaff] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [staffForm, setStaffForm] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        role: "TECHNICIAN",
        specialization: "",
        salaryType: "MONTHLY",
        salary: "",
        commissionRate: "5",
        status: "ACTIVE",
        joinedDate: new Date().toISOString().split("T")[0],
        aadharOrId: "",
        address: "",
        notes: "",
    })

    const generateRandomPassword = () => {
        const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#"
        let pass = ""
        for (let i = 0; i < 10; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setStaffForm(prev => ({ ...prev, password: pass }))
        setShowPassword(true)
    }

    // Fetch staff
    const fetchStaff = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/shop/billing/staff")
            const data = await res.json()
            if (data.success) {
                setStaffList(data.staff || [])
                setSummary(data.summary || {})

                // initialize attendanceMap with today's status
                const attMap: Record<string, { status: string; checkIn: string; checkOut: string; notes: string }> = {}
                data.staff.forEach((s: StaffMember) => {
                    attMap[s.id] = {
                        status: s.todayStatus === "NOT_MARKED" ? "PRESENT" : s.todayStatus,
                        checkIn: s.checkIn || "09:30 AM",
                        checkOut: s.checkOut || "07:00 PM",
                        notes: ""
                    }
                })
                setAttendanceMap(attMap)
            }
        } catch (err) {
            console.error("Failed to load staff:", err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch commissions
    const fetchCommissions = async () => {
        try {
            setLoadingCommissions(true)
            const res = await fetch("/api/shop/billing/staff/commissions")
            const data = await res.json()
            if (data.success) {
                setCommissions(data.commissions || [])
            }
        } catch (err) {
            console.error("Failed to load commissions:", err)
        } finally {
            setLoadingCommissions(false)
        }
    }

    useEffect(() => {
        fetchStaff()
        fetchCommissions()
    }, [])

    // Open Add Modal
    const handleOpenAdd = () => {
        setEditingStaffId(null)
        setShowPassword(false)
        setStaffForm({
            name: "",
            phone: "",
            email: "",
            password: "",
            role: "TECHNICIAN",
            specialization: "",
            salaryType: "MONTHLY",
            salary: "",
            commissionRate: "5",
            status: "ACTIVE",
            joinedDate: new Date().toISOString().split("T")[0],
            aadharOrId: "",
            address: "",
            notes: "",
        })
        setShowStaffModal(true)
    }

    // Open Edit Modal
    const handleOpenEdit = (staff: StaffMember) => {
        setEditingStaffId(staff.id)
        setShowPassword(false)
        setStaffForm({
            name: staff.name,
            phone: staff.phone || "",
            email: staff.email || "",
            password: "",
            role: staff.role || "TECHNICIAN",
            specialization: staff.specialization || "",
            salaryType: staff.salaryType || "MONTHLY",
            salary: staff.salary ? staff.salary.toString() : "",
            commissionRate: staff.commissionRate !== undefined ? staff.commissionRate.toString() : "5",
            status: staff.status || "ACTIVE",
            joinedDate: staff.joinedDate ? staff.joinedDate.split("T")[0] : new Date().toISOString().split("T")[0],
            aadharOrId: staff.aadharOrId || "",
            address: staff.address || "",
            notes: staff.notes || "",
        })
        setShowStaffModal(true)
    }

    // Save Staff (Add or Edit)
    const handleSaveStaff = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!staffForm.name.trim()) return

        try {
            setSavingStaff(true)
            const url = editingStaffId
                ? `/api/shop/billing/staff/${editingStaffId}`
                : "/api/shop/billing/staff"
            const method = editingStaffId ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(staffForm)
            })
            const data = await res.json()

            if (data.success) {
                setShowStaffModal(false)
                fetchStaff()
            } else {
                alert(data.error || "Failed to save staff member")
            }
        } catch (err) {
            console.error("Save staff error:", err)
            alert("Error connecting to server")
        } finally {
            setSavingStaff(false)
        }
    }

    // Delete staff
    const handleDeleteStaff = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return

        try {
            const res = await fetch(`/api/shop/billing/staff/${id}`, { method: "DELETE" })
            const data = await res.json()
            if (data.success) {
                fetchStaff()
            } else {
                alert(data.error || "Failed to remove staff")
            }
        } catch (err) {
            console.error("Delete staff error:", err)
        }
    }

    // Toggle staff active/inactive status
    const handleToggleStatus = async (staff: StaffMember) => {
        const newStatus = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
        try {
            const res = await fetch(`/api/shop/billing/staff/${staff.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })
            if (res.ok) fetchStaff()
        } catch (err) {
            console.error(err)
        }
    }

    // Save Daily Attendance
    const handleSaveAttendance = async () => {
        try {
            setSavingAttendance(true)
            const records = Object.entries(attendanceMap).map(([staffId, data]) => ({
                staffId,
                date: attendanceDate,
                status: data.status,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                notes: data.notes
            }))

            const res = await fetch("/api/shop/billing/staff/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records })
            })
            const data = await res.json()

            if (data.success) {
                setAttendanceSavedToast(true)
                setTimeout(() => setAttendanceSavedToast(false), 3000)
                fetchStaff()
            } else {
                alert(data.error || "Failed to save attendance")
            }
        } catch (err) {
            console.error("Save attendance error:", err)
        } finally {
            setSavingAttendance(false)
        }
    }

    // Mark single staff attendance
    const setStaffAttendanceStatus = (staffId: string, status: string) => {
        setAttendanceMap(prev => ({
            ...prev,
            [staffId]: {
                ...(prev[staffId] || { checkIn: "09:30 AM", checkOut: "07:00 PM", notes: "" }),
                status
            }
        }))
    }

    // Mark all as PRESENT
    const handleMarkAllPresent = () => {
        const updated: Record<string, any> = { ...attendanceMap }
        staffList.filter(s => s.status === "ACTIVE").forEach(s => {
            updated[s.id] = {
                ...(updated[s.id] || { checkIn: "09:30 AM", checkOut: "07:00 PM", notes: "" }),
                status: "PRESENT"
            }
        })
        setAttendanceMap(updated)
    }

    // Mark Commission as Paid
    const handlePayCommission = async (commId: string) => {
        if (!confirm("Mark this commission as PAID & settled?")) return

        try {
            const res = await fetch("/api/shop/billing/staff/commissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "MARK_PAID",
                    commissionId: commId
                })
            })
            const data = await res.json()
            if (data.success) {
                fetchCommissions()
                fetchStaff()
            }
        } catch (err) {
            console.error("Pay commission error:", err)
        }
    }

    // Save manual commission
    const handleSaveManualCommission = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!manualCommissionForm.staffId || !manualCommissionForm.amount) return

        try {
            const res = await fetch("/api/shop/billing/staff/commissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    staffId: manualCommissionForm.staffId,
                    amount: manualCommissionForm.amount,
                    notes: manualCommissionForm.notes || "Manual bonus / commission",
                    rate: 0
                })
            })
            const data = await res.json()
            if (data.success) {
                setShowManualCommissionModal(false)
                setManualCommissionForm({ staffId: "", amount: "", notes: "" })
                fetchCommissions()
                fetchStaff()
            }
        } catch (err) {
            console.error("Error creating manual commission:", err)
        }
    }

    // Filter staff
    const filteredStaff = staffList.filter(s => {
        if (roleFilter !== "ALL" && s.role !== roleFilter) return false
        if (statusFilter !== "ALL" && s.status !== statusFilter) return false
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            return (
                s.name.toLowerCase().includes(q) ||
                (s.phone && s.phone.includes(q)) ||
                (s.specialization && s.specialization.toLowerCase().includes(q)) ||
                s.role.toLowerCase().includes(q)
            )
        }
        return true
    })

    // Filter commissions
    const filteredCommissions = commissions.filter(c => {
        if (commissionFilter === "ALL") return true
        return c.status === commissionFilter
    })

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">Shop Portal</span>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <Link href="/shop/billing" className="text-zinc-500 hover:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                            Billing
                        </Link>
                        <ChevronRight className="w-3 h-3 text-zinc-700" />
                        <span className="text-[#16acd4] text-[10px] font-bold uppercase tracking-widest">Staff &amp; Team</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Staff &amp; Technicians</h1>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#16acd4]/10 text-[#16acd4] border border-[#16acd4]/25">
                            {summary.totalStaff} Team Members
                        </span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">Manage workshop detailers, mechanics, attendance, payroll &amp; job commissions</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/shop/billing/staff/attendance"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600/80 hover:bg-emerald-600 transition-all border border-emerald-500/40 shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                        <Calendar className="w-4 h-4 text-emerald-300" />
                        <span>Attendance Register</span>
                    </Link>
                    <button
                        onClick={handleOpenAdd}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 shadow-lg shadow-[#16acd4]/20 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #16acd4, #0e8fb0)" }}
                    >
                        <Plus className="w-4 h-4" /> Add Staff Member
                    </button>
                </div>
            </div>

            {/* ── Metric Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {[
                    {
                        label: "Total Staff",
                        value: summary.totalStaff,
                        sub: `${summary.activeStaff} active in workshop`,
                        icon: Users,
                        color: "#16acd4"
                    },
                    {
                        label: "Present Today",
                        value: summary.presentToday,
                        sub: `out of ${summary.activeStaff} active`,
                        icon: UserCheck,
                        color: "#34d399"
                    },
                    {
                        label: "Monthly Salary",
                        value: `₹${(summary.totalMonthlySalary || 0).toLocaleString("en-IN")}`,
                        sub: "fixed salary payroll",
                        icon: IndianRupee,
                        color: "#fbbf24"
                    },
                    {
                        label: "Pending Commission",
                        value: `₹${(summary.totalPendingCommissions || 0).toLocaleString("en-IN")}`,
                        sub: "earned by technicians",
                        icon: Award,
                        color: "#c084fc"
                    },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="rounded-2xl border border-white/8 p-4 lg:p-5 transition-all hover:border-white/15"
                        style={{ background: "#111113" }}
                    >
                        <div className="flex items-center gap-3 mb-2.5">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + "18" }}>
                                <s.icon className="w-4 h-4" style={{ color: s.color }} />
                            </div>
                            <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">{s.label}</span>
                        </div>
                        <p className="text-2xl lg:text-3xl font-black text-white tracking-tight">{s.value}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Navigation Tabs ── */}
            <div className="flex items-center gap-2 border-b border-white/8 pb-2 overflow-x-auto">
                {[
                    { id: "directory", label: "Team Directory", icon: Users, count: summary.totalStaff },
                    { id: "attendance", label: "Daily Attendance", icon: Calendar, badge: "Register" },
                    { id: "commissions", label: "Commissions & Payouts", icon: Award, count: summary.totalPendingCommissions > 0 ? `₹${summary.totalPendingCommissions.toLocaleString("en-IN")}` : null },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            activeTab === tab.id
                                ? "bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30"
                                : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count !== null && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                activeTab === tab.id ? "bg-[#16acd4] text-black" : "bg-white/10 text-zinc-400"
                            }`}>
                                {tab.count}
                            </span>
                        )}
                        {tab.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* =========================================================================
                TAB 1: TEAM DIRECTORY
            ========================================================================= */}
            {activeTab === "directory" && (
                <div className="flex flex-col gap-4">
                    {/* Filters & Search Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl border border-white/8 bg-[#111113]">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by name, phone, specialization or role..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-[#17171a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#16acd4]"
                            />
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                                className="bg-[#17171a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4]"
                            >
                                <option value="ALL">All Roles</option>
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-[#17171a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:border-[#16acd4]"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active Only</option>
                                <option value="INACTIVE">Inactive Only</option>
                                <option value="ON_LEAVE">On Leave</option>
                            </select>
                        </div>
                    </div>

                    {/* Staff Cards Grid */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#16acd4] mb-3" />
                            <p className="text-sm">Loading staff members...</p>
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl border border-white/8 bg-[#111113] p-8">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-zinc-600">
                                <Users className="w-7 h-7" />
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">No Staff Members Found</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                                {searchQuery || roleFilter !== "ALL" || statusFilter !== "ALL"
                                    ? "No staff matching your search filter."
                                    : "You haven't added any staff or technicians to your workshop yet."}
                            </p>
                            <button
                                onClick={handleOpenAdd}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-[#16acd4] hover:bg-[#1499bd] transition-colors"
                            >
                                + Add First Staff Member
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStaff.map(staff => {
                                const roleStyle = ROLE_BADGE_COLORS[staff.role] || ROLE_BADGE_COLORS.TECHNICIAN
                                const roleLabel = ROLES.find(r => r.value === staff.role)?.label || staff.role

                                return (
                                    <div
                                        key={staff.id}
                                        className="rounded-2xl border border-white/8 p-5 transition-all hover:border-white/20 flex flex-col justify-between group"
                                        style={{ background: "#111113" }}
                                    >
                                        <div>
                                            {/* Top Card Row */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-lg"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${roleStyle.text}25, ${roleStyle.text}10)`,
                                                            color: roleStyle.text,
                                                            border: `1px solid ${roleStyle.border}`
                                                        }}
                                                    >
                                                        {staff.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-white group-hover:text-[#16acd4] transition-colors leading-tight">
                                                            {staff.name}
                                                        </h3>
                                                        <span
                                                            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border"
                                                            style={{
                                                                backgroundColor: roleStyle.bg,
                                                                color: roleStyle.text,
                                                                borderColor: roleStyle.border
                                                            }}
                                                        >
                                                            {roleLabel}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status indicator */}
                                                <button
                                                    onClick={() => handleToggleStatus(staff)}
                                                    title={`Click to ${staff.status === "ACTIVE" ? "deactivate" : "activate"}`}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                                                        staff.status === "ACTIVE"
                                                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                                                            : "bg-zinc-800 text-zinc-400 border border-white/5 hover:bg-zinc-700"
                                                    }`}
                                                >
                                                    {staff.status === "ACTIVE" ? "Active" : "Inactive"}
                                                </button>
                                            </div>

                                            {/* Specialization */}
                                            {staff.specialization && (
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-3 bg-white/5 px-2.5 py-1 rounded-lg">
                                                    <Sparkles className="w-3 h-3 text-[#16acd4] shrink-0" />
                                                    <span className="truncate">{staff.specialization}</span>
                                                </div>
                                            )}

                                            {/* Contact Details & Portal Access */}
                                            <div className="space-y-1.5 text-xs text-zinc-400 mb-4">
                                                {staff.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <a href={`tel:${staff.phone}`} className="hover:text-white transition-colors">{staff.phone}</a>
                                                    </div>
                                                )}
                                                {staff.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span className="truncate">{staff.email}</span>
                                                    </div>
                                                )}
                                                <div className="pt-1 flex items-center justify-between">
                                                    {staff.hasPortalAccess ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#16acd4]/15 text-[#16acd4] border border-[#16acd4]/30">
                                                            <Smartphone className="w-3 h-3" /> App Portal Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-zinc-500 bg-white/5">
                                                            Portal Inactive
                                                        </span>
                                                    )}
                                                    {staff.hasPortalAccess && (
                                                        <Link 
                                                            href="/staff" 
                                                            target="_blank"
                                                            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-0.5 hover:underline"
                                                        >
                                                            <span>Preview</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Financial Metrics */}
                                            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#17171a] border border-white/5 mb-4 text-xs">
                                                <div>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Salary</span>
                                                    <span className="font-bold text-white">
                                                        {staff.salary > 0 ? `₹${staff.salary.toLocaleString("en-IN")}` : "Per Job"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 ml-1 font-medium">/{staff.salaryType === "DAILY" ? "day" : "mo"}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Commission</span>
                                                    <span className="font-bold text-[#c084fc]">
                                                        {staff.commissionRate > 0 ? `${staff.commissionRate}%` : "None"}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500 ml-1">/job</span>
                                                </div>
                                            </div>

                                            {/* Completed Invoices / Jobs Counter */}
                                            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 px-1">
                                                <span>Jobs Assigned:</span>
                                                <span className="font-bold text-white">{staff.completedJobsCount} invoices</span>
                                            </div>
                                            {staff.pendingCommissionAmount > 0 && (
                                                <div className="flex items-center justify-between text-xs text-amber-400 mb-2 px-1 font-semibold">
                                                    <span>Pending Commission:</span>
                                                    <span>₹{staff.pendingCommissionAmount.toLocaleString("en-IN")}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[10px] text-zinc-500">Today:</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    staff.todayStatus === "PRESENT" ? "bg-emerald-500/15 text-emerald-400" :
                                                    staff.todayStatus === "HALF_DAY" ? "bg-amber-500/15 text-amber-400" :
                                                    staff.todayStatus === "ABSENT" ? "bg-red-500/15 text-red-400" :
                                                    "bg-zinc-800 text-zinc-500"
                                                }`}>
                                                    {staff.todayStatus === "NOT_MARKED" ? "Not Marked" : staff.todayStatus}
                                                </span>
                                                {staff.latitude && staff.longitude && (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${staff.latitude},${staff.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#16acd4] hover:underline bg-[#16acd4]/10 border border-[#16acd4]/20 px-1.5 py-0.5 rounded"
                                                        title={`Punch Location: ${staff.latitude}, ${staff.longitude}`}
                                                    >
                                                        <MapPin className="w-2.5 h-2.5" />
                                                        <span>Map ↗</span>
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenEdit(staff)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                                    title="Edit staff details"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                    title="Remove staff member"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
                TAB 2: DAILY ATTENDANCE
            ========================================================================= */}
            {activeTab === "attendance" && (
                <div className="flex flex-col gap-5">
                    {/* Attendance Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/8 bg-[#111113]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Daily Attendance Register</h3>
                                <p className="text-[11px] text-zinc-400">Mark daily check-in, check-out &amp; attendance status</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <input
                                type="date"
                                value={attendanceDate}
                                onChange={e => setAttendanceDate(e.target.value)}
                                className="bg-[#17171a] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                            />
                            <button
                                onClick={handleMarkAllPresent}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors"
                            >
                                Mark All Present
                            </button>
                            <button
                                onClick={handleSaveAttendance}
                                disabled={savingAttendance}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black bg-[#16acd4] hover:bg-[#1499bd] transition-all disabled:opacity-50 shadow-lg shadow-[#16acd4]/20"
                            >
                                {savingAttendance ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Save Attendance
                            </button>
                        </div>
                    </div>

                    {attendanceSavedToast && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Attendance saved successfully!
                        </div>
                    )}

                    {/* Attendance Table */}
                    <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="border-b border-white/8 text-zinc-400 uppercase tracking-wider text-[10px] bg-[#17171a]">
                                        <th className="py-3.5 px-4">Staff Member</th>
                                        <th className="py-3.5 px-4">Role / Title</th>
                                        <th className="py-3.5 px-4">Attendance Status</th>
                                        <th className="py-3.5 px-4">Check-In</th>
                                        <th className="py-3.5 px-4">Check-Out</th>
                                        <th className="py-3.5 px-4">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {staffList.filter(s => s.status === "ACTIVE").map(staff => {
                                        const currentAtt = attendanceMap[staff.id] || {
                                            status: "PRESENT",
                                            checkIn: "09:30 AM",
                                            checkOut: "07:00 PM",
                                            notes: ""
                                        }

                                        return (
                                            <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-[#16acd4]/15 text-[#16acd4] flex items-center justify-center font-bold text-xs">
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-white">{staff.name}</p>
                                                            <p className="text-[10px] text-zinc-500">{staff.phone || "No phone"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="text-zinc-300 font-medium">
                                                        {ROLES.find(r => r.value === staff.role)?.label || staff.role}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        {[
                                                            { key: "PRESENT", label: "Present", color: "bg-emerald-500 text-black", border: "border-emerald-500" },
                                                            { key: "HALF_DAY", label: "Half Day", color: "bg-amber-500 text-black", border: "border-amber-500" },
                                                            { key: "ABSENT", label: "Absent", color: "bg-red-500 text-white", border: "border-red-500" },
                                                            { key: "LEAVE", label: "Leave", color: "bg-purple-500 text-white", border: "border-purple-500" },
                                                        ].map(b => (
                                                            <button
                                                                key={b.key}
                                                                onClick={() => setStaffAttendanceStatus(staff.id, b.key)}
                                                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                                                    currentAtt.status === b.key
                                                                        ? `${b.color} font-black shadow-md`
                                                                        : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                                                                }`}
                                                            >
                                                                {b.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <input
                                                        type="text"
                                                        value={currentAtt.checkIn}
                                                        onChange={e => {
                                                            const val = e.target.value
                                                            setAttendanceMap(prev => ({
                                                                ...prev,
                                                                [staff.id]: { ...(prev[staff.id] || currentAtt), checkIn: val }
                                                            }))
                                                        }}
                                                        placeholder="09:30 AM"
                                                        className="w-24 bg-[#17171a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <input
                                                        type="text"
                                                        value={currentAtt.checkOut}
                                                        onChange={e => {
                                                            const val = e.target.value
                                                            setAttendanceMap(prev => ({
                                                                ...prev,
                                                                [staff.id]: { ...(prev[staff.id] || currentAtt), checkOut: val }
                                                            }))
                                                        }}
                                                        placeholder="07:00 PM"
                                                        className="w-24 bg-[#17171a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                                    />
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <input
                                                        type="text"
                                                        value={currentAtt.notes || ""}
                                                        onChange={e => {
                                                            const val = e.target.value
                                                            setAttendanceMap(prev => ({
                                                                ...prev,
                                                                [staff.id]: { ...(prev[staff.id] || currentAtt), notes: val }
                                                            }))
                                                        }}
                                                        placeholder="Optional remark..."
                                                        className="w-36 bg-[#17171a] border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#16acd4]"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
                TAB 3: COMMISSIONS & PAYOUTS
            ========================================================================= */}
            {activeTab === "commissions" && (
                <div className="flex flex-col gap-4">
                    {/* Commission Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-white/8 bg-[#111113]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Technician Commissions &amp; Job Payouts</h3>
                                <p className="text-[11px] text-zinc-400">Automatic per-invoice commission calculation &amp; payout ledger</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="flex items-center rounded-xl bg-[#17171a] p-1 border border-white/10">
                                {(["ALL", "PENDING", "PAID"] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setCommissionFilter(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            commissionFilter === f
                                                ? "bg-[#16acd4] text-black shadow"
                                                : "text-zinc-400 hover:text-white"
                                        }`}
                                    >
                                        {f === "ALL" ? "All" : f === "PENDING" ? "Pending Payout" : "Paid"}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowManualCommissionModal(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg"
                            >
                                <Plus className="w-3.5 h-3.5" /> Direct Bonus / Incentive
                            </button>
                        </div>
                    </div>

                    {/* Commissions Table */}
                    {loadingCommissions ? (
                        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
                            <RefreshCw className="w-6 h-6 animate-spin text-[#16acd4] mb-3" />
                            <p className="text-sm">Loading commission entries...</p>
                        </div>
                    ) : filteredCommissions.length === 0 ? (
                        <div className="py-16 text-center rounded-2xl border border-white/8 bg-[#111113] p-8">
                            <Award className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-sm font-bold text-white mb-1">No Commissions Recorded Yet</h3>
                            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                When you create an invoice and assign a staff member with a commission rate, their commissions will automatically show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-white/8 bg-[#111113] overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-white/8 text-zinc-400 uppercase tracking-wider text-[10px] bg-[#17171a]">
                                            <th className="py-3.5 px-4">Staff / Technician</th>
                                            <th className="py-3.5 px-4">Invoice / Job</th>
                                            <th className="py-3.5 px-4">Vehicle &amp; Client</th>
                                            <th className="py-3.5 px-4">Rate (%)</th>
                                            <th className="py-3.5 px-4">Commission Amount</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredCommissions.map(comm => (
                                            <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <p className="font-bold text-white">{comm.staff?.name || "Unknown Staff"}</p>
                                                    <span className="text-[10px] text-zinc-500 uppercase">{comm.staff?.role}</span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {comm.invoice ? (
                                                        <Link
                                                            href={`/shop/billing/invoices`}
                                                            className="text-[#16acd4] hover:underline font-bold flex items-center gap-1"
                                                        >
                                                            <span>{comm.invoice.invoiceNumber}</span>
                                                            <ArrowUpRight className="w-3 h-3" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-zinc-500">Direct Bonus</span>
                                                    )}
                                                    <span className="text-[10px] text-zinc-500 block">
                                                        {new Date(comm.createdAt).toLocaleDateString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <p className="text-zinc-300 font-medium">{comm.invoice?.vehicleName || comm.invoice?.vehicleRegNo || "—"}</p>
                                                    <p className="text-[10px] text-zinc-500">{comm.invoice?.client?.name || comm.notes || "—"}</p>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="font-bold text-zinc-300">
                                                        {comm.rate > 0 ? `${comm.rate}%` : "Flat"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="text-base font-black text-emerald-400">
                                                        ₹{comm.amount.toLocaleString("en-IN")}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                        comm.status === "PAID"
                                                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                                    }`}>
                                                        {comm.status === "PAID" ? "Settled / Paid" : "Pending"}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    {comm.status === "PENDING" ? (
                                                        <button
                                                            onClick={() => handlePayCommission(comm.id)}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition-all"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    ) : (
                                                        <span className="text-zinc-500 text-[11px] font-medium flex items-center justify-end gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Settled
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* =========================================================================
                MODAL: ADD / EDIT STAFF
            ========================================================================= */}
            {showStaffModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
                    <div
                        className="rounded-3xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl transition-all my-8"
                        style={{ background: "#121215" }}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/8 bg-[#17171b]">
                            <div>
                                <h3 className="text-lg font-black text-white">
                                    {editingStaffId ? "Edit Staff Member" : "Add New Staff Member"}
                                </h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Enter technician or employee details</p>
                            </div>
                            <button
                                onClick={() => setShowStaffModal(false)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSaveStaff} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Ramesh Kumar"
                                        value={staffForm.name}
                                        onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Role / Designation *
                                    </label>
                                    <select
                                        value={staffForm.role}
                                        onChange={e => setStaffForm({ ...staffForm, role: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        {ROLES.map(r => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Mobile Phone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        value={staffForm.phone}
                                        onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Specialization / Skill
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 9H Ceramic & TPU PPF"
                                        value={staffForm.specialization}
                                        onChange={e => setStaffForm({ ...staffForm, specialization: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            {/* Staff Portal Login Credentials */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#16acd4]/10 via-purple-500/5 to-transparent border border-[#16acd4]/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-[#16acd4]/20 text-[#16acd4] flex items-center justify-center">
                                            <Key className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                                Staff Portal Access (Credentials)
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#16acd4]/20 text-[#16acd4] font-semibold uppercase">Mobile App</span>
                                            </h4>
                                            <p className="text-[11px] text-zinc-400">Used by technicians to login at <span className="text-[#16acd4] font-mono">/staff</span> & record car repairs</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={generateRandomPassword}
                                        className="text-[10px] font-bold text-[#16acd4] hover:text-white bg-[#16acd4]/10 hover:bg-[#16acd4]/20 border border-[#16acd4]/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <Sparkles className="w-3 h-3" /> Auto-Generate
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                            Login Email / Username
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                placeholder="e.g. technician@garage.in"
                                                value={staffForm.email}
                                                onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                                                className="w-full bg-[#121215] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                                            {editingStaffId ? "Password (Blank = Keep Current)" : "Password"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder={editingStaffId ? "Keep unchanged or new" : "Enter or generate password"}
                                                value={staffForm.password}
                                                onChange={e => setStaffForm({ ...staffForm, password: e.target.value })}
                                                className="w-full bg-[#121215] border border-white/10 rounded-xl pl-3 pr-9 py-2 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Salary Type
                                    </label>
                                    <select
                                        value={staffForm.salaryType}
                                        onChange={e => setStaffForm({ ...staffForm, salaryType: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="MONTHLY">Monthly Fixed</option>
                                        <option value="DAILY">Daily Wage</option>
                                        <option value="COMMISSION">Commission Only</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Base Salary (₹)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 25000"
                                        value={staffForm.salary}
                                        onChange={e => setStaffForm({ ...staffForm, salary: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Job Commission (%)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 5"
                                        value={staffForm.commissionRate}
                                        onChange={e => setStaffForm({ ...staffForm, commissionRate: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Status
                                    </label>
                                    <select
                                        value={staffForm.status}
                                        onChange={e => setStaffForm({ ...staffForm, status: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="ON_LEAVE">On Leave</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        value={staffForm.joinedDate}
                                        onChange={e => setStaffForm({ ...staffForm, joinedDate: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                        Aadhaar / ID Card
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="XXXX-XXXX-XXXX"
                                        value={staffForm.aadharOrId}
                                        onChange={e => setStaffForm({ ...staffForm, aadharOrId: e.target.value })}
                                        className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    placeholder="Local address..."
                                    value={staffForm.address}
                                    onChange={e => setStaffForm({ ...staffForm, address: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Notes / Emergency Contact
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Notes, references or emergency contact number..."
                                    value={staffForm.notes}
                                    onChange={e => setStaffForm({ ...staffForm, notes: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/8">
                                <button
                                    type="button"
                                    onClick={() => setShowStaffModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingStaff}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[#16acd4] hover:bg-[#1499bd] transition-all disabled:opacity-50"
                                >
                                    {savingStaff ? "Saving..." : editingStaffId ? "Update Staff" : "Add Staff Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
                MODAL: MANUAL COMMISSION / BONUS
            ========================================================================= */}
            {showManualCommissionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="rounded-3xl border border-white/10 w-full max-w-md overflow-hidden shadow-2xl bg-[#121215]">
                        <div className="flex items-center justify-between p-5 border-b border-white/8 bg-[#17171b]">
                            <div>
                                <h3 className="text-base font-black text-white">Add Direct Bonus / Incentive</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Award manual commission to a team member</p>
                            </div>
                            <button
                                onClick={() => setShowManualCommissionModal(false)}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveManualCommission} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Select Staff Member *
                                </label>
                                <select
                                    required
                                    value={manualCommissionForm.staffId}
                                    onChange={e => setManualCommissionForm({ ...manualCommissionForm, staffId: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                >
                                    <option value="">Select staff...</option>
                                    {staffList.filter(s => s.status === "ACTIVE").map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Incentive / Commission Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    placeholder="e.g. 1500"
                                    value={manualCommissionForm.amount}
                                    onChange={e => setManualCommissionForm({ ...manualCommissionForm, amount: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                                    Reason / Notes
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Outstanding work on Thar Full PPF"
                                    value={manualCommissionForm.notes}
                                    onChange={e => setManualCommissionForm({ ...manualCommissionForm, notes: e.target.value })}
                                    className="w-full bg-[#17171a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#16acd4]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                                <button
                                    type="button"
                                    onClick={() => setShowManualCommissionModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-[#16acd4] hover:bg-[#1499bd]"
                                >
                                    Record Bonus
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}
