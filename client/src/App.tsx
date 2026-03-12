import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import PlatformQuickAccess from "./components/PlatformQuickAccess";
import SiteFooter from "./components/SiteFooter";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import FanInterface from "./pages/FanInterface";
import OperatorDashboard from "./pages/OperatorDashboard";
import OperatorDashboardApple from "./pages/OperatorDashboardApple";
import ExecutiveDashboardApple from "./pages/ExecutiveDashboardApple";
import StadiumCommandCenter from "./pages/StadiumCommandCenter";
import FanExperienceApple from "./pages/FanExperienceApple";
import ExecutiveIntelligence from "./pages/ExecutiveIntelligence";
import CrowdOSHub from "./pages/CrowdOSHub";
import ExecutiveOpsPanel from "./pages/ExecutiveOpsPanel";


function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={CrowdOSHub} />
      <Route path="/home" component={Home} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/fan" component={FanInterface} />
      <Route path="/operator" component={OperatorDashboard} />
      <Route path="/operator-apple" component={OperatorDashboardApple} />
      <Route path="/executive-apple" component={ExecutiveDashboardApple} />
      <Route path="/stadium-command" component={StadiumCommandCenter} />
      <Route path="/fan-apple" component={FanExperienceApple} />
      <Route path="/executive-intelligence" component={ExecutiveIntelligence} />
      <Route path="/executive" component={ExecutiveOpsPanel} />
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
  const basePath = import.meta.env.BASE_URL === "/" ? "" : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Toaster />
            <PlatformQuickAccess />
            <AppRoutes />
            <SiteFooter />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
