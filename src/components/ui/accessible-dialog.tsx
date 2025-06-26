
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const AccessibleDialog = DialogPrimitive.Root

const AccessibleDialogTrigger = DialogPrimitive.Trigger

const AccessibleDialogPortal = DialogPrimitive.Portal

const AccessibleDialogClose = DialogPrimitive.Close

const AccessibleDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
AccessibleDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const AccessibleDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string
    description?: string
  }
>(({ className, children, title, description, ...props }, ref) => (
  <AccessibleDialogPortal>
    <AccessibleDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      aria-describedby={description ? "dialog-description" : undefined}
      {...props}
    >
      <DialogPrimitive.Title className="sr-only">
        {title}
      </DialogPrimitive.Title>
      {description && (
        <DialogPrimitive.Description id="dialog-description" className="sr-only">
          {description}
        </DialogPrimitive.Description>
      )}
      {children}
    </DialogPrimitive.Content>
  </AccessibleDialogPortal>
))
AccessibleDialogContent.displayName = DialogPrimitive.Content.displayName

export {
  AccessibleDialog,
  AccessibleDialogPortal,
  AccessibleDialogOverlay,
  AccessibleDialogContent,
  AccessibleDialogTrigger,
  AccessibleDialogClose,
}
