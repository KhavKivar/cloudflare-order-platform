import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              OrderSapp
            </h1>
            <p className="text-muted-foreground text-sm">Panel de administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="key"
                className="text-sm font-medium text-muted-foreground ml-0.5"
              >
                Llave de acceso
              </label>
              <Input
                id="key"
                type="password"
                value={key}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
                placeholder="Ingresa tu token"
                className="h-11 focus:border-primary focus:ring-primary/20 transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium rounded-lg transition-colors active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-muted-foreground border-t-primary-foreground rounded-full animate-spin" />
                  Verificando...
                </div>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <footer className="mt-8 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              &copy; {new Date().getFullYear()} Vasvani App
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
