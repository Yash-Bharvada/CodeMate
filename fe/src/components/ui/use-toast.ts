
// Simple toast implementation without complex state management
let toastCallback: ((message: string) => void) | null = null

export const useToast = () => {
  const toast = ({ title, description }: { title?: string; description?: string }) => {
    const message = title || description || "Notification"
    if (toastCallback) {
      toastCallback(message)
    } else {
      // Fallback to console if no callback is set
      console.log("Toast:", message)
    }
  }

  return { toast }
}

export const toast = ({ title, description }: { title?: string; description?: string }) => {
  const message = title || description || "Notification"
  if (toastCallback) {
    toastCallback(message)
  } else {
    console.log("Toast:", message)
  }
}

// Function to set the toast callback (can be used by components that want to handle toasts)
export const setToastCallback = (callback: (message: string) => void) => {
  toastCallback = callback
}
