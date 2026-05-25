import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
    return (
        <div className="flex flex-col space-y-2 w-full max-w-[480px]">
            <LoginForm />
        </div>
    )
}
