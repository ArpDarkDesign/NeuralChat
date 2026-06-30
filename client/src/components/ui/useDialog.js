import { useContext } from "react";
import { UIContext } from "./UIContext";

function useUIContext() {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("Dialog hooks must be used within ToastProvider");
  }

  return context;
}

export function useToast() {
  return useUIContext().showToast;
}

export function useConfirm() {
  return useUIContext().confirm;
}

export function useInputDialog() {
  return useUIContext().inputDialog;
}
