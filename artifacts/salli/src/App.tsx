import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/language-context";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import Khushoo from "@/pages/khushoo";
import Motivation from "@/pages/motivation";
import Doaas from "@/pages/doaas";
import AiChat from "@/pages/ai-chat";
import Social from "@/pages/social";
import Messages from "@/pages/messages";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/community" component={Community} />
        <Route path="/khushoo" component={Khushoo} />
        <Route path="/motivation" component={Motivation} />
        <Route path="/doaas" component={Doaas} />
        <Route path="/ai-chat" component={AiChat} />
        <Route path="/social" component={Social} />
        <Route path="/messages" component={Messages} />
        <Route path="/messages/:userId" component={Messages} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
