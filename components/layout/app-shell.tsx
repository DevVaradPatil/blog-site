import SiteFooter from "./site-footer";
import SiteHeader from "./site-header";

type AppShellProps = {
    children: React.ReactNode;
    /** Soft accent bloom behind the top of the page. */
    glow?: boolean;
};

const AppShell = ({ children, glow = false }: AppShellProps) => (
    <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className={`flex-1 ${glow ? "glow" : ""}`}>{children}</main>
        <SiteFooter />
    </div>
);

export default AppShell;
