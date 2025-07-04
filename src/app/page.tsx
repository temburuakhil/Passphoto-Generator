import { Aperture } from 'lucide-react';
import { RedSnapEditor } from '@/components/redsnap-editor';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <header className="p-4 border-b bg-card">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
            <Aperture className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-primary font-headline">
              RedSnap
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Free Passport Photos with Red Background
          </p>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <RedSnapEditor />
      </main>
      <footer className="p-4 border-t text-center text-xs text-muted-foreground bg-card">
        <div className="container mx-auto">
          <p>
            Powered by Open Source AI. 100% Free. No Login Required.
          </p>
        </div>
      </footer>
    </div>
  );
}
