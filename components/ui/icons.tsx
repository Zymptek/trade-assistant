'use client'

import ZymptekLogo from '@/components/zymptek-logo'
import { cn } from '@/lib/utils'

function IconLogo({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <ZymptekLogo
      className={cn('h-4 w-4', className)}
      {...props}
    />
  )
}

export { IconLogo }
