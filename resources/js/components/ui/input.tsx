import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2 text-sm text-gray-900 shadow-xs transition-all duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700/80 dark:bg-gray-900/40 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:bg-gray-900 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
