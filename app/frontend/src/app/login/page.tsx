import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button/button";
import Input from "@/components/ui/Input/input";
import { toast } from "sonner";
import httpClient from "@/lib/api-provider";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) return;

    setLoading(true);
    try {
      // We set the token first so the request includes it
      localStorage.setItem("token", key);

      // Try to fetch clients to verify the key
      await httpClient.get("/clients");

      toast.success("Bienvenido de nuevo");
      navigate("/");
    } catch (error: unknown) {
      localStorage.removeItem("token");
      toast.error("Llave de acceso inválida");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              OrderSapp
            </h1>
            <p className="text-slate-500 text-sm">Panel de administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="key"
                className="text-sm font-medium text-slate-700 ml-0.5"
              >
                Llave de acceso
              </label>
              <Input
                id="key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ingresa tu token"
                className="h-11 border-slate-200 focus:border-amber-400 focus:ring-amber-100 transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} Vasvani App
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
