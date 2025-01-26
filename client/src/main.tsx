import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Dispatch from "./pages/Dispatch";
import Drivers from "./pages/Drivers";
import Orders from "./pages/Orders";

import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CreateOrderWizard from "@/components/DefaultCustomerOrderingPage.tsx";

function Router() {
    return (
        <Layout>
            <Route path="/login" component={Login} />
            <Route path="/create-new" component={CreateOrderWizard} />
            <Switch>
                <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
                <Route path="/customers" component={() => <ProtectedRoute component={Customers} />} />
                <Route path="/dispatch" component={() => <ProtectedRoute component={Dispatch} />} />
                <Route path="/drivers" component={() => <ProtectedRoute component={Drivers} />} />
                <Route path="/orders" component={() => <ProtectedRoute component={Orders} />} />

                <Route>404 Page Not Found</Route>
            </Switch>
        </Layout>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <Router />
            <Toaster />
        </QueryClientProvider>
    </StrictMode>
);
