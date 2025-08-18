import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

const spinnerSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const Spinner = ({ 
  size = 'md', 
  className = '', 
  color = 'text-ceg-blue',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]',
        spinnerSizes[size],
        color,
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </motion.div>
  )
}

export { Spinner }
