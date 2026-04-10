export const metadata = {
  title: "Lexis — Privacy",
};

export default function PrivacyPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-32 md:px-8 border-x border-white min-h-screen">
      <header className="mb-24 border-b border-white pb-12">
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter">PRIVACY</h1>
        <p className="mt-8 text-xl md:text-2xl font-mono uppercase tracking-widest">
          ZERO CLOUD. ZERO TELEMETRY.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 font-mono text-lg md:text-xl leading-relaxed">
        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0">
          I. Local Execution
        </div>
        <div className="md:col-span-8 space-y-6">
          <p>
            Lexis operates entirely on your local hardware. Prompts are processed and commands are 
            compiled directly on your machine. We do not transmit, log, or monitor your inputs, 
            outputs, or workflow habits.
          </p>
        </div>

        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0 mt-12 md:mt-0">
          II. Third-Party Providers
        </div>
        <div className="md:col-span-8 space-y-6 mt-12 md:mt-0">
          <p>
            If you choose to configure external LLM providers (e.g., OpenAI, Anthropic), data handling 
            will fall under their respective privacy policies. Lexis only acts as a pass-through 
            interface. We strongly advise using local models (e.g., Ollama) for maximum data isolation.
          </p>
        </div>

        <div className="md:col-span-4 uppercase font-black text-2xl tracking-tight border-b border-white pb-4 md:border-b-0 md:pb-0 mt-12 md:mt-0">
          III. Telemetry & Analytics
        </div>
        <div className="md:col-span-8 space-y-6 mt-12 md:mt-0">
          <p>
            This application contains zero tracking scripts, zero analytics, and zero crash reporting 
            telemetry. We rely exclusively on user-submitted GitHub issues for debugging.
          </p>
        </div>
      </div>
    </main>
  );
}
