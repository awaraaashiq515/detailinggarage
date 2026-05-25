import { addDays } from 'date-fns';

/**
 * Calculate the end date for a subscription based on duration in days
 */
export function calculateSubscriptionEndDate(startDate: Date, durationDays: number): Date {
    return addDays(startDate, durationDays);
}

/**
 * Format currency in INR
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Get color/class for payment status
 */
export function getPaymentStatusColor(status: string): string {
    switch (status) {
        case 'PAID':
            return 'text-green-500 bg-green-500/10';
        case 'PENDING':
            return 'text-yellow-500 bg-yellow-500/10';
        case 'FAILED':
            return 'text-red-500 bg-red-500/10';
        case 'REFUNDED':
            return 'text-blue-500 bg-blue-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}

/**
 * Get color/class for subscription status
 */
export function getSubscriptionStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'text-green-500 bg-green-500/10';
        case 'EXPIRED':
            return 'text-red-500 bg-red-500/10';
        case 'CANCELLED':
            return 'text-gray-500 bg-gray-500/10';
        case 'PENDING_PAYMENT':
            return 'text-yellow-500 bg-yellow-500/10';
        case 'PENDING_APPROVAL':
            return 'text-orange-500 bg-orange-500/10';
        default:
            return 'text-gray-500 bg-gray-500/10';
    }
}
