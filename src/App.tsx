import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Lobby from "./pages/Lobby";
import PlaySelect from "./pages/PlaySelect";
import Game from "./pages/Game";
import Weapons from "./pages/Weapons";
import Missions from "./pages/Missions";
import Shop from "./pages/Shop";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound.tsx";
import { RequireAuth } from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lobby" element={<RequireAuth><Lobby /></RequireAuth>} />
          <Route path="/play" element={<RequireAuth><PlaySelect /></RequireAuth>} />
          <Route path="/game/:mode" element={<RequireAuth><Game /></RequireAuth>} />
          <Route path="/weapons" element={<RequireAuth><Weapons /></RequireAuth>} />
          <Route path="/missions" element={<RequireAuth><Missions /></RequireAuth>} />
          <Route path="/shop" element={<RequireAuth><Shop /></RequireAuth>} />
          <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
