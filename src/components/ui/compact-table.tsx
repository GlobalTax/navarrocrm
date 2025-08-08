import * as React from 'react'
import { cn } from '@/lib/utils'

const CompactTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm border-collapse', className)}
      {...props}
    />
  </div>
))
CompactTable.displayName = 'CompactTable'

const CompactTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
))
CompactTableHeader.displayName = 'CompactTableHeader'

const CompactTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
CompactTableBody.displayName = 'CompactTableBody'

const CompactTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className
    )}
    {...props}
  />
))
CompactTableFooter.displayName = 'CompactTableFooter'

const CompactTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted h-8',
      className
    )}
    {...props}
  />
))
CompactTableRow.displayName = 'CompactTableRow'

const CompactTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'crm-table-header h-8 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
CompactTableHead.displayName = 'CompactTableHead'

const CompactTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'crm-table-cell px-2 py-1 align-middle [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
))
CompactTableCell.displayName = 'CompactTableCell'

const CompactTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-2 crm-compact-text text-center', className)}
    {...props}
  />
))
CompactTableCaption.displayName = 'CompactTableCaption'

export {
  CompactTable,
  CompactTableHeader,
  CompactTableBody,
  CompactTableFooter,
  CompactTableHead,
  CompactTableRow,
  CompactTableCell,
  CompactTableCaption,
}