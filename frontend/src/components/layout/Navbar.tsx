import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-background px-6 py-4 flex items-center gap-8">
      <Link to="/" className="font-bold text-xl flex items-center gap-2">
        <Zap className="text-primary h-6 w-6" />
        <span>Data Bridge</span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/connections" className="hover:text-primary transition-colors">
          Connections
        </Link>
        <Link to="/integrations" className="hover:text-primary transition-colors">
          Integrations
        </Link>
      </div>
    </nav>
  );
}
