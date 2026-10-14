"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
    IndianRupee,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    CreditCard,
    ArrowDownRight,
    ArrowUpRight,
    FileText,
    Printer,
    Trash2,
    UserCheck,
    Sparkles,
    X,
    Banknote,
    Wallet,
    Receipt,
    ShieldCheck,
    Check,
    Users
} from "lucide-react"

interface StaffPayrollRow {
    staffId: string
    name: string
    phone: string | null
    role: string
    salaryType: string
    baseSalary: number
    pendingAdvancesTotal: number
    advances: any[]
    attendanceSummary: {
        presentDays: number
        halfDays: number
        absentDays: number
        totalPunched: number
    }
    salaryRecord: {
        id: string
        period: string
        baseSalary: number
        bonus: number
        advanceDeducted: number
        otherDeductions: number
        netPaid: number
        status: string
        paymentMethod: string
        paymentDate: string
        transactionRef: string | null
        notes: string | null
    } | null
    calculated: {
        baseSalary: number
        bonus: number
        advanceDeducted: number
        otherDeductions: number
        netPayable: number
        status: string
    }
}

interface AdvanceRow {
    id: string
    staffId: string
    staff: {
        id: string
        name: string
        role: string
        phone: string | null
        salary: number
    }
    amount: number
    advanceDate: string
    reason: string | null
    paymentMethod: string
    status: string
    recoveredAmount: number
    notes: string | null
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

export default function ShopStaffSalaryPage() {
    const today = new Date()
    const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
    const [activeTab, setActiveTab] = useState<"payroll" | "advances">("payroll")

    const [loading, setLoading] = useState(true)
    const [staffPayroll, setStaffPayroll] = useState<StaffPayrollRow[]>([])
    const [advancesList, setAdvancesList] = useState<AdvanceRow[]>([])
    const [metrics, setMetrics] = useState<any>({
        totalBaseBudget: 0,
        totalPaidOut: 0,
        totalPendingSalary: 0,
        totalOutstandingAdvances: 0,
        totalStaff: 0,
        paidCount: 0,
        unpaidCount: 0
    })

    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "UNPAID" | "HAS_ADVANCE">("ALL")

    // Modals
    const [payModalStaff, setPayModalStaff] = useState<StaffPayrollRow | null>(null)
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false)
    const [slipModalData, setSlipModalData] = useState<StaffPayrollRow | null>(null)

    // Pay Modal Form State
    const [payForm, setPayForm] = useState({
        baseSalary: 0,
        bonus: 0,
        advanceDeducted: 0,
        otherDeductions: 0,
        netPaid: 0,
        paymentMethod: "CASH",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "PAID",
        transactionRef: "",
        notes: ""
    })
    const [savingPay, setSavingPay] = useState(false)

    // Advance Modal Form State
    const [advanceForm, setAdvanceForm] = useState({
        staffId: "",
        amount: "",
        advanceDate: new Date().toISOString().split("T")[0],
        reason: "",
        paymentMethod: "CASH",
        notes: ""
    })
    const [savingAdvance, setSavingAdvance] = useState(false)

    // Fetch Payroll Data
    const fetchPayrollData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/shop/billing/salary?month=${selectedMonth}&year=${selectedYear}`)
            const data = await res.json()
            if (data.staffPayroll) {
                setStaffPayroll(data.staffPayroll)
                setMetrics(data.metrics)
            }
        } catch (err) {
            console.error("Error fetching salary data:", err)
        } finally {
            setLoading(false)
        }
    }

    // Fetch Advance List
    const fetchAdvancesData = async () => {
        try {
            const res = await fetch(`/api/shop/billing/salary/advance`)
            const data = await res.json()
            if (data.advances) {
                setAdvancesList(data.advances)
            }
        } catch (err) {
            console.error("Error fetching advances:", err)
        }
    }

    useEffect(() => {
        fetchPayrollData()
        fetchAdvancesData()
    }, [selectedMonth, selectedYear])

    // Handle Month change
    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12)
            setSelectedYear(selectedYear - 1)
        } else {
            setSelectedMonth(selectedMonth - 1)
        }
    }

    const handleNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1)
            setSelectedYear(selectedYear + 1)
        } else {
            setSelectedMonth(selectedMonth + 1)
        }
    }

    // Open Pay Modal
    const handleOpenPayModal = (staff: StaffPayrollRow) => {
        setPayModalStaff(staff)
        const base = staff.salaryRecord ? staff.salaryRecord.baseSalary : staff.baseSalary
        const bonus = staff.salaryRecord ? staff.salaryRecord.bonus : 0
        // Auto-recommend deducting all or partial pending advances
        const advanceDeduct = staff.salaryRecord
            ? staff.salaryRecord.advanceDeducted
            : Math.min(staff.pendingAdvancesTotal, base)
        const other = staff.salaryRecord ? staff.salaryRecord.otherDeductions : 0
        const net = Math.max(0, base + bonus - advanceDeduct - other)

        setPayForm({
            baseSalary: base,
            bonus,
            advanceDeducted: advanceDeduct,
            otherDeductions: other,
            netPaid: net,
            paymentMethod: staff.salaryRecord ? staff.salaryRecord.paymentMethod : "CASH",
            paymentDate: staff.salaryRecord ? staff.salaryRecord.paymentDate.split("T")[0] : new Date().toISOString().split("T")[0],
            status: staff.salaryRecord ? staff.salaryRecord.status : "PAID",
            transactionRef: staff.salaryRecord?.transactionRef || "",
            notes: staff.salaryRecord?.notes || ""
        })
    }

    // Recalculate Net in Pay Form
    const handlePayFormChange = (key: string, value: any) => {
        const updated = { ...payForm, [key]: value }
        const base = Number(updated.baseSalary) || 0
        const bonus = Number(updated.bonus) || 0
        const adv = Number(updated.advanceDeducted) || 0
        const other = Number(updated.otherDeductions) || 0
        updated.netPaid = Math.max(0, base + bonus - adv - other)
        setPayForm(updated)
    }

    // Submit Salary Payment
    const handleSaveSalaryPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!payModalStaff) return
        try {
            setSavingPay(true)
            const res = await fetch(`/api/shop/billing/salary`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    staffId: payModalStaff.staffId,
                    month: selectedMonth,
                    year: selectedYear,
                    ...payForm
                })
            })
            if (res.ok) {
                setPayModalStaff(null)
                await fetchPayrollData()
                await fetchAdvancesData()
            } else {
                alert("Failed to save salary payment")
            }
        } catch (err) {
            console.error(err)
            alert("Error saving salary payment")
        } finally {
            setSavingPay(false)
        }
    }

    // Submit New Advance
    const handleSaveAdvance = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!advanceForm.staffId || !advanceForm.amount) {
            alert("Please select staff and enter amount")
            return
        }
        try {
            setSavingAdvance(true)
            const res = await fetch(`/api/shop/billing/salary/advance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    staffId: advanceForm.staffId,
                    amount: Number(advanceForm.amount),
                    advanceDate: advanceForm.advanceDate,
                    reason: advanceForm.reason || "Staff Advance",
                    paymentMethod: advanceForm.paymentMethod,
                    notes: advanceForm.notes
                })
            })
            if (res.ok) {
                setIsAdvanceModalOpen(false)
                setAdvanceForm({
                    staffId: "",
                    amount: "",
                    advanceDate: new Date().toISOString().split("T")[0],
                    reason: "",
                    paymentMethod: "CASH",
                    notes: ""
                })
                await fetchPayrollData()
                await fetchAdvancesData()
            } else {
                alert("Failed to record advance payment")
            }
        } catch (err) {
            console.error(err)
            alert("Error recording advance")
        } finally {
            setSavingAdvance(false)
        }
    }

    // Delete Advance
    const handleDeleteAdvance = async (advanceId: string) => {
        if (!confirm("Are you sure you want to delete this advance record?")) return
        try {
            const res = await fetch(`/api/shop/billing/salary/advance?id=${advanceId}`, {
                method: "DELETE"
            })
            if (res.ok) {
                await fetchPayrollData()
                await fetchAdvancesData()
            }
        } catch (err) {
            console.error(err)
        }
    }

    // Filter Staff rows
    const filteredStaff = staffPayroll.filter(staff => {
        const matchesQuery = !searchQuery ||
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchQuery.toLowerCase())

        let matchesStatus = true
        if (statusFilter === "PAID") {
            matchesStatus = staff.salaryRecord?.status === "PAID"
        } else if (statusFilter === "UNPAID") {
            matchesStatus = !staff.salaryRecord || staff.salaryRecord.status !== "PAID"
        } else if (statusFilter === "HAS_ADVANCE") {
            matchesStatus = staff.pendingAdvancesTotal > 0
        }

        return matchesQuery && matchesStatus
    })

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-300">

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544]">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/shop/billing" className="text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
                            <ChevronLeft className="w-3.5 h-3.5" /> Launcher
                        </Link>
                        <span className="text-zinc-600">/</span>
                        <span className="text-[11px] font-bold text-[#818cf8] uppercase tracking-wider">Payroll &amp; Advance</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
                        <Banknote className="w-6 h-6 text-[#818cf8]" />
                        STAFF SALARY &amp; ADVANCE KHATA
                    </h1>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        स्टाफ सैलरी, एडवांस पेशगी, कटौती और भुगतान स्टेटस का पूरा हिसाब-किताब
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Add Advance Button */}
                    <button
                        onClick={() => setIsAdvanceModalOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141b36] hover:bg-[#1c264a] border border-[#242e56] text-amber-400 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                    >
                        <Wallet className="w-4 h-4 text-amber-400" />
                        <span>+ GIVE ADVANCE</span>
                    </button>

                    {/* Pay Salary Shortcut */}
                    <button
                        onClick={() => {
                            if (staffPayroll.length > 0) handleOpenPayModal(staffPayroll[0])
                        }}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#6366f1]/25 active:scale-95"
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>PAY SALARY</span>
                    </button>
                </div>
            </div>

            {/* ── Month & Year Switcher ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0b101f] border border-[#1b2544]">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-xl bg-[#141b36] hover:bg-[#1c264a] text-zinc-300 hover:text-white border border-[#242e56] transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#141b36] border border-[#242e56]">
                        <Calendar className="w-4 h-4 text-[#818cf8]" />
                        <span className="text-sm font-black text-white uppercase tracking-wider">
                            {MONTHS[selectedMonth - 1]} {selectedYear}
                        </span>
                    </div>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-xl bg-[#141b36] hover:bg-[#1c264a] text-zinc-300 hover:text-white border border-[#242e56] transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0e1326] border border-[#1b2544]">
                    <button
                        onClick={() => setActiveTab("payroll")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "payroll"
                            ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/20"
                            : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Monthly Salaries ({staffPayroll.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("advances")}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${activeTab === "advances"
                            ? "bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/20"
                            : "text-zinc-400 hover:text-white"
                            }`}
                    >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Advances Ledger ({advancesList.length})</span>
                    </button>
                </div>
            </div>

            {/* ── KPI Summary Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Payroll Budget */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] font-black uppercase tracking-wider mb-2">
                        <span>Total Monthly Budget</span>
                        <div className="w-7 h-7 rounded-lg bg-[#141b36] flex items-center justify-center text-[#818cf8]">
                            <IndianRupee className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-white">
                            ₹{metrics.totalBaseBudget?.toLocaleString("en-IN")}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                            {metrics.totalStaff} Total Staff members
                        </p>
                    </div>
                </div>

                {/* Paid Out */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
                        <span>Paid So Far (भुगतान हो चुका)</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-400">
                            ₹{metrics.totalPaidOut?.toLocaleString("en-IN")}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                            <b className="text-emerald-400">{metrics.paidCount}</b> staff paid
                        </p>
                    </div>
                </div>

                {/* Pending Unpaid */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-amber-400 text-[10px] font-black uppercase tracking-wider mb-2">
                        <span>Pending Salary (बकाया)</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-amber-400">
                            ₹{metrics.totalPendingSalary?.toLocaleString("en-IN")}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                            <b className="text-amber-400">{metrics.unpaidCount}</b> staff awaiting payment
                        </p>
                    </div>
                </div>

                {/* Total Advances Given */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0b101f] border border-[#1b2544] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-rose-400 text-[10px] font-black uppercase tracking-wider mb-2">
                        <span>Total Advance Balance (एडवांस)</span>
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                            <Wallet className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl font-black text-rose-400">
                            ₹{metrics.totalOutstandingAdvances?.toLocaleString("en-IN")}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">
                            Pending recovery from staff
                        </p>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                TAB 1: MONTHLY SALARIES & PAYROLL TABLE
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "payroll" && (
                <div className="rounded-2xl bg-[#0b101f] border border-[#1b2544] overflow-hidden shadow-xl">
                    {/* Filters & Search */}
                    <div className="p-4 border-b border-[#1b2544] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search staff name or role..."
                                className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#6366f1]"
                            />
                        </div>

                        {/* Status Filter Buttons */}
                        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                            {[
                                { id: "ALL", label: "All Staff" },
                                { id: "PAID", label: "Paid" },
                                { id: "UNPAID", label: "Unpaid" },
                                { id: "HAS_ADVANCE", label: "Has Advance" },
                            ].map((f) => (
                                <button
                                    key={f.id}
                                    onClick={() => setStatusFilter(f.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${statusFilter === f.id
                                        ? "bg-[#6366f1] text-white"
                                        : "bg-[#141b36] text-zinc-400 hover:text-white"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0e1326] text-zinc-400 uppercase font-black tracking-wider text-[10px] border-b border-[#1b2544]">
                                <tr>
                                    <th className="py-3 px-4">Staff Member</th>
                                    <th className="py-3 px-4">Base Salary</th>
                                    <th className="py-3 px-4">Attendance</th>
                                    <th className="py-3 px-4">Pending Advance</th>
                                    <th className="py-3 px-4">Advance Deduct</th>
                                    <th className="py-3 px-4">Net To Pay</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1b2544]">
                                {filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-zinc-500">
                                            No staff records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((staff) => {
                                        const isPaid = staff.salaryRecord?.status === "PAID"
                                        return (
                                            <tr key={staff.staffId} className="hover:bg-[#10172e] transition-colors">
                                                {/* Staff details */}
                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg bg-[#141b36] text-[#818cf8] flex items-center justify-center font-black text-xs">
                                                            {staff.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div>{staff.name}</div>
                                                            <div className="text-[10px] font-semibold text-zinc-400">{staff.role}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Base Salary */}
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    ₹{staff.baseSalary.toLocaleString("en-IN")}
                                                </td>

                                                {/* Attendance */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                                                            {staff.attendanceSummary.presentDays}P
                                                        </span>
                                                        {staff.attendanceSummary.halfDays > 0 && (
                                                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px]">
                                                                {staff.attendanceSummary.halfDays}H
                                                            </span>
                                                        )}
                                                        {staff.attendanceSummary.absentDays > 0 && (
                                                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold text-[10px]">
                                                                {staff.attendanceSummary.absentDays}A
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Pending Advances */}
                                                <td className="py-3.5 px-4">
                                                    {staff.pendingAdvancesTotal > 0 ? (
                                                        <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                                                            ₹{staff.pendingAdvancesTotal.toLocaleString("en-IN")}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-500">₹0</span>
                                                    )}
                                                </td>

                                                {/* Advance Deducted this month */}
                                                <td className="py-3.5 px-4 font-mono text-zinc-300">
                                                    {staff.salaryRecord?.advanceDeducted ? (
                                                        <span className="text-amber-400 font-bold">
                                                            -₹{staff.salaryRecord.advanceDeducted.toLocaleString("en-IN")}
                                                        </span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </td>

                                                {/* Net Amount Paid / Payable */}
                                                <td className="py-3.5 px-4 font-mono font-black text-sm text-white">
                                                    ₹{(staff.salaryRecord ? staff.salaryRecord.netPaid : staff.calculated.netPayable).toLocaleString("en-IN")}
                                                </td>

                                                {/* Status Badge */}
                                                <td className="py-3.5 px-4">
                                                    {isPaid ? (
                                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                            <Check className="w-3 h-3" /> PAID ({staff.salaryRecord?.paymentMethod})
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                                            <Clock className="w-3 h-3" /> UNPAID
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenPayModal(staff)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${isPaid
                                                                ? "bg-[#141b36] hover:bg-[#1e284f] text-[#818cf8]"
                                                                : "bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-md shadow-[#6366f1]/20"
                                                                }`}
                                                        >
                                                            {isPaid ? "Edit / Update" : "Pay Salary"}
                                                        </button>

                                                        {isPaid && (
                                                            <button
                                                                onClick={() => setSlipModalData(staff)}
                                                                className="p-1.5 rounded-lg bg-[#141b36] hover:bg-[#1e284f] text-zinc-300 hover:text-white"
                                                                title="View Salary Slip"
                                                            >
                                                                <FileText className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                TAB 2: ADVANCES LEDGER (एडवांस खाता)
            ════════════════════════════════════════════════════════════════ */}
            {activeTab === "advances" && (
                <div className="rounded-2xl bg-[#0b101f] border border-[#1b2544] overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-[#1b2544] flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                Staff Advance Payments Ledger (एडवांस लेजर)
                            </h2>
                            <p className="text-[11px] text-zinc-400">
                                Track all salary advances given to technicians and recovery status
                            </p>
                        </div>

                        <button
                            onClick={() => setIsAdvanceModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase"
                        >
                            <Plus className="w-3.5 h-3.5" /> Give New Advance
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#0e1326] text-zinc-400 uppercase font-black tracking-wider text-[10px] border-b border-[#1b2544]">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Staff Member</th>
                                    <th className="py-3 px-4">Advance Amount</th>
                                    <th className="py-3 px-4">Recovered / Deducted</th>
                                    <th className="py-3 px-4">Pending Balance</th>
                                    <th className="py-3 px-4">Reason / Notes</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4 text-right">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1b2544]">
                                {advancesList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-12 text-center text-zinc-500">
                                            No advance records recorded.
                                        </td>
                                    </tr>
                                ) : (
                                    advancesList.map((adv) => {
                                        const pending = adv.amount - adv.recoveredAmount
                                        return (
                                            <tr key={adv.id} className="hover:bg-[#10172e] transition-colors">
                                                <td className="py-3.5 px-4 text-zinc-300">
                                                    {new Date(adv.advanceDate).toLocaleDateString("en-IN")}
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-white">
                                                    {adv.staff?.name}
                                                    <div className="text-[10px] text-zinc-400 font-normal">{adv.staff?.role}</div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                                                    ₹{adv.amount.toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-emerald-400">
                                                    ₹{adv.recoveredAmount.toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-white">
                                                    ₹{pending.toLocaleString("en-IN")}
                                                </td>
                                                <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                                                    {adv.reason || "Advance"} {adv.notes ? `(${adv.notes})` : ""}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${adv.status === "DEDUCTED"
                                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                        : adv.status === "PARTIALLY_RECOVERED"
                                                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                        }`}>
                                                        {adv.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteAdvance(adv.id)}
                                                        className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                        title="Delete Advance"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                MODAL 1: RECORD SALARY PAYMENT
            ════════════════════════════════════════════════════════════════ */}
            {payModalStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-[#0b101f] border border-[#1b2544] rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#1b2544] pb-4 mb-4">
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-wider">
                                    Record Salary Payment
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    {payModalStaff.name} ({payModalStaff.role}) • {MONTHS[selectedMonth - 1]} {selectedYear}
                                </p>
                            </div>
                            <button
                                onClick={() => setPayModalStaff(null)}
                                className="w-8 h-8 rounded-lg bg-[#141b36] flex items-center justify-center text-zinc-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSalaryPayment} className="space-y-4">
                            {/* Base Salary */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    Base Salary (₹)
                                </label>
                                <input
                                    type="number"
                                    value={payForm.baseSalary}
                                    onChange={(e) => handlePayFormChange("baseSalary", Number(e.target.value))}
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-sm text-white font-mono"
                                    required
                                />
                            </div>

                            {/* Bonus / Incentive */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                        + Bonus / Overtime (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={payForm.bonus}
                                        onChange={(e) => handlePayFormChange("bonus", Number(e.target.value))}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono"
                                    />
                                </div>

                                {/* Advance Deduction */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-[11px] font-bold text-zinc-300 uppercase">
                                            - Advance Deduct (₹)
                                        </label>
                                        {payModalStaff.pendingAdvancesTotal > 0 && (
                                            <span className="text-[10px] text-amber-400">
                                                Avail: ₹{payModalStaff.pendingAdvancesTotal}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        value={payForm.advanceDeducted}
                                        onChange={(e) => handlePayFormChange("advanceDeducted", Number(e.target.value))}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-sm text-rose-400 font-mono"
                                    />
                                </div>
                            </div>

                            {/* Other Deductions */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    - Other Deductions (Absence / Penalties) (₹)
                                </label>
                                <input
                                    type="number"
                                    value={payForm.otherDeductions}
                                    onChange={(e) => handlePayFormChange("otherDeductions", Number(e.target.value))}
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-sm text-zinc-300 font-mono"
                                />
                            </div>

                            {/* Net Payable Highlight */}
                            <div className="p-3.5 rounded-xl bg-[#141b36] border border-[#242e56] flex items-center justify-between">
                                <span className="text-xs font-black uppercase text-zinc-300">
                                    Net Amount to Pay (कुल भुगतान):
                                </span>
                                <span className="text-xl font-black text-emerald-400 font-mono">
                                    ₹{payForm.netPaid.toLocaleString("en-IN")}
                                </span>
                            </div>

                            {/* Payment Method & Date */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={payForm.paymentMethod}
                                        onChange={(e) => handlePayFormChange("paymentMethod", e.target.value)}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white"
                                    >
                                        <option value="CASH">Cash (नकद)</option>
                                        <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                        <option value="BANK_TRANSFER">Bank Transfer (NEFT/IMPS)</option>
                                        <option value="CHEQUE">Cheque</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                        Payment Date
                                    </label>
                                    <input
                                        type="date"
                                        value={payForm.paymentDate}
                                        onChange={(e) => handlePayFormChange("paymentDate", e.target.value)}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white"
                                    />
                                </div>
                            </div>

                            {/* Transaction Ref / Notes */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    UTR / Transaction Ref (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={payForm.transactionRef}
                                    onChange={(e) => handlePayFormChange("transactionRef", e.target.value)}
                                    placeholder="UPI Ref ID or Cheque No"
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPayModalStaff(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingPay}
                                    className="px-5 py-2.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    {savingPay ? "Saving..." : "Confirm & Save Payment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                MODAL 2: GIVE NEW ADVANCE PAYMENT
            ════════════════════════════════════════════════════════════════ */}
            {isAdvanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0b101f] border border-[#1b2544] rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#1b2544] pb-4 mb-4">
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-wider">
                                    Give Advance to Staff
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    स्टाफ को नया एडवांस दें (यह सैलरी में से कटेगा)
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAdvanceModalOpen(false)}
                                className="w-8 h-8 rounded-lg bg-[#141b36] flex items-center justify-center text-zinc-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAdvance} className="space-y-4">
                            {/* Staff Selector */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    Select Staff Member *
                                </label>
                                <select
                                    value={advanceForm.staffId}
                                    onChange={(e) => setAdvanceForm({ ...advanceForm, staffId: e.target.value })}
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white"
                                    required
                                >
                                    <option value="">-- Choose Staff --</option>
                                    {staffPayroll.map((s) => (
                                        <option key={s.staffId} value={s.staffId}>
                                            {s.name} ({s.role}) - Base: ₹{s.baseSalary}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Advance Amount */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    Advance Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    value={advanceForm.amount}
                                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                                    placeholder="e.g. 5000"
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold"
                                    required
                                />
                            </div>

                            {/* Date & Payment Method */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={advanceForm.advanceDate}
                                        onChange={(e) => setAdvanceForm({ ...advanceForm, advanceDate: e.target.value })}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                        Payment Mode
                                    </label>
                                    <select
                                        value={advanceForm.paymentMethod}
                                        onChange={(e) => setAdvanceForm({ ...advanceForm, paymentMethod: e.target.value })}
                                        className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white"
                                    >
                                        <option value="CASH">Cash (नकद)</option>
                                        <option value="UPI">UPI / Online</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            {/* Reason / Notes */}
                            <div>
                                <label className="block text-[11px] font-bold text-zinc-300 uppercase mb-1">
                                    Reason / Purpose
                                </label>
                                <input
                                    type="text"
                                    value={advanceForm.reason}
                                    onChange={(e) => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                                    placeholder="e.g. Medical emergency, Festival, Family need"
                                    className="w-full bg-[#12182c] border border-[#1b2544] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500"
                                />
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdvanceModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAdvance}
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                                >
                                    {savingAdvance ? "Saving..." : "Record Advance"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                MODAL 3: VIEW & PRINT SALARY SLIP (PAYSIP)
            ════════════════════════════════════════════════════════════════ */}
            {slipModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-[#0b101f] border border-[#1b2544] rounded-2xl p-6 shadow-2xl">
                        {/* Printable Area */}
                        <div id="salary-slip-print" className="bg-[#12182c] p-5 rounded-xl border border-[#242e56] text-white space-y-4">
                            <div className="border-b border-[#242e56] pb-3 flex items-center justify-between">
                                <div>
                                    <div className="text-base font-black text-white uppercase tracking-wider">
                                        WORKSHOP SALARY SLIP
                                    </div>
                                    <p className="text-[11px] text-[#818cf8]">
                                        Period: {MONTHS[selectedMonth - 1]} {selectedYear}
                                    </p>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/30">
                                    PAID RECEIPT
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-zinc-400 text-[10px] block uppercase">Staff Name:</span>
                                    <b className="text-white">{slipModalData.name}</b>
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-[10px] block uppercase">Role:</span>
                                    <b className="text-white">{slipModalData.role}</b>
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-[10px] block uppercase">Payment Mode:</span>
                                    <b className="text-white">{slipModalData.salaryRecord?.paymentMethod}</b>
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-[10px] block uppercase">Payment Date:</span>
                                    <b className="text-white">
                                        {slipModalData.salaryRecord ? new Date(slipModalData.salaryRecord.paymentDate).toLocaleDateString("en-IN") : "-"}
                                    </b>
                                </div>
                            </div>

                            {/* Salary breakdown table */}
                            <div className="border-t border-b border-[#242e56] py-3 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Base Monthly Salary:</span>
                                    <span className="font-mono font-bold">₹{slipModalData.baseSalary.toLocaleString("en-IN")}</span>
                                </div>
                                {Number(slipModalData.salaryRecord?.bonus) > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>+ Bonus / Incentives:</span>
                                        <span className="font-mono font-bold">+₹{slipModalData.salaryRecord?.bonus.toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                                {Number(slipModalData.salaryRecord?.advanceDeducted) > 0 && (
                                    <div className="flex justify-between text-rose-400">
                                        <span>- Advance Deducted:</span>
                                        <span className="font-mono font-bold">-₹{slipModalData.salaryRecord?.advanceDeducted.toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                                {Number(slipModalData.salaryRecord?.otherDeductions) > 0 && (
                                    <div className="flex justify-between text-zinc-400">
                                        <span>- Other Deductions:</span>
                                        <span className="font-mono font-bold">-₹{slipModalData.salaryRecord?.otherDeductions.toLocaleString("en-IN")}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-[#242e56] font-black text-sm">
                                    <span className="text-white uppercase">Net Amount Paid:</span>
                                    <span className="text-emerald-400 font-mono">₹{slipModalData.salaryRecord?.netPaid.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 text-center">
                                Generated digitally by Detailing Garage Workshop Portal.
                            </p>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <button
                                onClick={() => setSlipModalData(null)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6366f1] text-white font-bold text-xs uppercase"
                            >
                                <Printer className="w-4 h-4" /> Print Slip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
