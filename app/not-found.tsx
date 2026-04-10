import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="w-full flex-1 pt-6 px-6 md:px-12 xl:px-16 mx-auto">
      <header className="grid grid-cols-12 gap-6 border-b border-white pb-6 mb-12 lg:mb-24 items-end">
        <div className="col-span-6">
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase text-white">Lexis</p>
        </div>
        <div className="col-span-6 flex justify-end">
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#666666]">Route Error</p>
        </div>
      </header>

      <section className="pb-16 lg:pb-24 border-b border-white mb-16 lg:mb-24" aria-labelledby="not-found-title">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666]">/ 00 - Not Found</p>
        <h1
          id="not-found-title"
          className="mt-8 text-[26vw] leading-[0.8] tracking-[-0.06em] uppercase font-medium text-white"
        >
          404
        </h1>
        <p className="mt-8 text-[12vw] leading-[0.85] tracking-[-0.05em] uppercase font-medium text-[#666666]">
          Missing Page.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start pb-12 lg:pb-20">
        <div className="lg:col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#666666] pt-2">
          / Action
        </div>
        <p className="lg:col-span-5 text-[26px] md:text-[32px] leading-[1.2] font-medium tracking-tight max-w-[18ch]">
          The address does not point to a published route. Return home and continue from the main terminal.
        </p>
        <div className="lg:col-span-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-white px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
          >
            Back To Homepage
          </Link>
        </div>
      </section>
    </main>
  );
}
