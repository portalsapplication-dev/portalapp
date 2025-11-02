import { ReactNode } from "react";
import Navigation from "./Navigation";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex md:flex-row flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground">Portals</h1>
          </div>
        </header>

        <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
