import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

/**
 * Uses the shared shell rather than its own blue radial-gradient page with a
 * second, different navbar.
 */
const ProtectedLayout = ({ children }: ProtectedLayoutProps) => (
    <AppShell>
        <Container width="feed" className="flex flex-col items-center gap-8 py-12">
            {children}
        </Container>
    </AppShell>
);

export default ProtectedLayout;
