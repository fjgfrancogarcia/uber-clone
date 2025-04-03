import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  className?: string
  children: ReactNode
}

interface CardHeaderProps {
  className?: string
  children: ReactNode
}

interface CardTitleProps {
  className?: string
  children: ReactNode
}

interface CardDescriptionProps {
  className?: string
  children: ReactNode
}

interface CardContentProps {
  className?: string
  children: ReactNode
}

interface CardFooterProps {
  className?: string
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card bg-white rounded-lg shadow-card overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('px-6 py-5 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
  return (
    <h3
      className={cn('text-xl font-semibold text-gray-900 leading-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn('mt-1 text-sm text-gray-500', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div
      className={cn('px-6 py-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('px-6 py-4 bg-gray-50 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
} 