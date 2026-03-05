import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import FanInterface from "./pages/FanInterface";
import OperatorDashboard from "./pages/OperatorDashboard";
import ExecutiveOpsPanel from "./pages/ExecutiveOpsPanel";
import FanNavigation from "./pages/FanNavigation";
import CrowdDNAAnalytics from "./pages/CrowdDNAAnalytics";


function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/fan" component={FanInterface} />
      <Route path="/operator" component={OperatorDashboard} />
      <Route path="/executive" component={ExecutiveOpsPanel} />
      <Route path="/fan-navigation" component={FanNavigation} />
      <Route path="/crowd-dna" component={CrowdDNAAnalytics} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
