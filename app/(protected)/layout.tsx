import HomeBar from "@/components/homebar";
import Navbar from "./_components/Navbar";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const ProtectedLayout = ({children}: ProtectedLayoutProps) => {
    return (
        <div className="py-10 min-h-full w-full flex flex-col gap-y-10 items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
            <HomeBar/>
            {children}
        </div>
    );
}

export default ProtectedLayout