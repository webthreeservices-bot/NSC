import { toast as sonnerToast } from "sonner"

export function useToast() {
  return {
    toast: sonnerToast,
    success: (message: string) => sonnerToast.success(message),
    error: (message: string) => sonnerToast.error(message),
    warning: (message: string) => sonnerToast.warning(message),
    info: (message: string) => sonnerToast.info(message),
  }
}
