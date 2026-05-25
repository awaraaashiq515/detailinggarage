"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginPurpose {
    id: string
    name: string
    description: string | null
    isActive: boolean
}

export default function LoginPurposesPage() {
    const [purposes, setPurposes] = useState<LoginPurpose[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [newPurpose, setNewPurpose] = useState({ name: "", description: "" })
    const [showAddForm, setShowAddForm] = useState(false)

    useEffect(() => {
        fetchPurposes()
    }, [])

    async function fetchPurposes() {
        try {
            const response = await fetch("/api/admin/login-purposes")
            if (response.ok) {
                const data = await response.json()
                setPurposes(data.purposes || [])
            }
        } catch (error) {
            console.error("Failed to fetch login purposes:", error)
        }
    }

    async function handleAdd() {
        if (!newPurpose.name) {
            alert("Please enter a purpose name")
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPurpose),
            })

            if (response.ok) {
                alert("Login purpose added successfully!")
                setNewPurpose({ name: "", description: "" })
                setShowAddForm(false)
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to add login purpose:", error)
            alert("Failed to add login purpose")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this login purpose?")) return

        try {
            const response = await fetch(`/api/admin/login-purposes?id=${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                alert("Login purpose deleted successfully!")
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to delete login purpose:", error)
            alert("Failed to delete login purpose")
        }
    }

    async function toggleActive(id: string, isActive: boolean) {
        try {
            const response = await fetch("/api/admin/login-purposes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, isActive: !isActive }),
            })

            if (response.ok) {
                fetchPurposes()
            } else {
                const data = await response.json()
                alert(`Error: ${data.error}`)
            }
        } catch (error) {
            console.error("Failed to update login purpose:", error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Login Purposes</h1>
                <p className="text-muted-foreground">Manage available login purposes for user registration</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Login Purposes Management</CardTitle>
                            <CardDescription>Add, edit, or remove login purposes that users can select during registration</CardDescription>
                        </div>
                        <Button onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? "Cancel" : "Add Purpose"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showAddForm && (
                        <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                            <div className="space-y-2">
                                <Label htmlFor="purposeName">Purpose Name *</Label>
                                <Input
                                    id="purposeName"
                                    placeholder="e.g., Business Partnership"
                                    value={newPurpose.name}
                                    onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="purposeDesc">Description</Label>
                                <Input
                                    id="purposeDesc"
                                    placeholder="Optional description"
                                    value={newPurpose.description}
                                    onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleAdd} disabled={isLoading} className="w-full">
                                {isLoading ? "Adding..." : "Add Login Purpose"}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-2">
                        {purposes.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No login purposes found</div>
                        ) : (
                            purposes.map((purpose) => (
                                <div key={purpose.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{purpose.name}</h3>
                                        {purpose.description && (
                                            <p className="text-sm text-muted-foreground">{purpose.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={purpose.isActive ? "default" : "outline"}
                                            onClick={() => toggleActive(purpose.id, purpose.isActive)}
                                        >
                                            {purpose.isActive ? "Active" : "Inactive"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(purpose.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
