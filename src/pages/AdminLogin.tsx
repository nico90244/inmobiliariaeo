import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Inmobiliaria EO" className="h-16 w-auto brightness-0 invert" />
        </div>

        <div className="bg-background p-8 border border-foreground/10">
          <h1 className="font-heading text-xl font-bold text-foreground text-center mb-6">Panel de Administración</h1>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-4 p-3 bg-destructive/10">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase block mb-1">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-foreground/10 py-2.5 px-3 font-body text-sm text-foreground focus:border-primary focus:outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-widest uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
