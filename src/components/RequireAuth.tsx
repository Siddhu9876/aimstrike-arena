import { Navigate } from "react-router-dom";
import { usePlayer } from "@/store/playerStore";
import { ReactNode } from "react";

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const id = usePlayer((s) => s.id);
  if (!id) return <Navigate to="/" replace />;
  return <>{children}</>;
};