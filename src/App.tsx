import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { BottomNav } from "./components/BottomNav";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AddExpense } from "./pages/AddExpense";
import { Wallets } from "./pages/Wallets";
import { History } from "./pages/History";
import { Export } from "./pages/Export";
import "./styles/global.css";

export default function App() {
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/history" element={<History />} />
        <Route path="/export" element={<Export />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  );
}
