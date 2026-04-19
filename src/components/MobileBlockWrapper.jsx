import { useEffect, useState } from "react";

export default function MobileBlockWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind md breakpoint
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white text-center p-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Desktop Only</h1>
          <p className="text-slate-400">
            This CRM is only accessible on desktop/laptop for better experience.
          </p>
        </div>
      </div>
    );
  }

  return children;
}