export const metadata = {
  title: "Lexis — Terms",
};

export default function TermsPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-32 md:px-8 border-x border-white min-h-screen">
      <header className="mb-24 border-b border-white pb-12">
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter">TERMS</h1>
        <p className="mt-8 text-xl md:text-2xl font-mono uppercase tracking-widest text-red-500">
          PROCEED AT YOUR OWN RISK.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 font-mono text-lg md:text-xl leading-relaxed">
        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0">
          I. No Guarantees
        </div>
        <div className="md:col-span-8 space-y-6">
          <p>
            Lexis is provided "AS IS", without warranty of any kind. You assume the absolute risk 
            of command generation. Always verify what the shell is attempting to run.
          </p>
        </div>

        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0 mt-12 md:mt-0">
          II. User Responsibility
        </div>
        <div className="md:col-span-8 space-y-6 mt-12 md:mt-0">
          <p>
            By executing generated scripts, you assume full responsibility for data loss, system 
            compromise, unintended deletions, and production failures. Never run a command you do 
            not fully understand. Lexis explicitly disclaims liability for automated actions.
          </p>
        </div>

        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0 mt-12 md:mt-0">
          III. Commercial & Infra Use
        </div>
        <div className="md:col-span-8 space-y-6 mt-12 md:mt-0">
          <p>
            Lexis is built for isolated, developer-level usage. It is not intended for unmonitored 
            server environments, production pipelines, or CI/CD deployments without stringent access 
            controls, policy safeguards, and manual approval gates.
          </p>
        </div>
      </div>
    </main>
  );
}
