import Cursor from "./components/Cursor";
import { ToastProvider } from "./components/ui/ToastProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ToastProvider>
     {window.matchMedia("(hover: hover) and (pointer: fine)").matches && <Cursor />}
      <AppRoutes />
    </ToastProvider>
  );
}

export default App;
