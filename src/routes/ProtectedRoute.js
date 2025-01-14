import { Outlet, Navigate } from "react-router-dom";
import OnboardingPage from "../pages/Onboarding";
import { SessionError } from "../pages/SessionError";
import { useSessionCheck } from "../hooks/useSessionCheck";
import ErrorBoundary from "../components/ErrorBoundary.js";




export const ProtectedRoute = () => {
    const { isAuthenticated, isValidUser, currentUser } = useSessionCheck();
    // Using a more structured approach with early returns
    if (!isAuthenticated || !isValidUser) {
        return <Navigate to="/login" />;
    }

    // Now we know we have a valid authenticated user
    switch (currentUser.isOnboarded) {
        case false:
            return (
                <ErrorBoundary fallback={<SessionError error={`currentUser.isOnboarded=false`} />}>
                    <OnboardingPage />
                </ErrorBoundary>
            );
        case true:
            return (
                <ErrorBoundary fallback={<SessionError error={`currentUser.isOnboarded=true`} />}>
                    <Outlet />
                </ErrorBoundary>
            );
        default:
            return <SessionError error={`default`} />;
    }
};