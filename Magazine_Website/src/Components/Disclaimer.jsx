import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "General Disclaimer", to: "#general" },
  { label: "No Professional Advice", to: "#advice" },
  { label: "External Links", to: "#external" },
  { label: "Limitation of Liability", to: "#liability" },
  { label: "Changes to Disclaimer", to: "#changes" },
  { label: "Contact Us", to: "#contact" },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    function onScroll() {
      let found = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id.replace("#", ""));
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) found = id;
        }
      }
      setActive(found);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

const DisclaimerSection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Disclaimer Sections
          </h3>
          <ul className="space-y-3">
            {sidebarLinks.map((item, idx) => (
              <li key={idx}>
                <a
                  href={item.to}
                  className={`flex items-center px-4 py-3 rounded-xl font-semibold transition-all duration-200
                    ${
                      activeSection === item.to
                        ? "bg-[#162048] text-white font-extrabold shadow-lg border-2 border-[#162048]"
                        : "text-[#162048] hover:bg-[#162048]/10 hover:text-[#1a1a1a] border-2 border-transparent"
                    }`}
                  style={{
                    boxShadow:
                      activeSection === item.to
                        ? "0 2px 8px rgba(22,32,72,0.12)"
                        : undefined,
                  }}
                >
                  <span className="mr-2 text-lg font-bold">
                    {activeSection === item.to ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="7" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="#162048" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="7" />
                      </svg>
                    )}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex-1">
          <h1 className="text-4xl font-extrabold text-[#162048] mb-8 tracking-wide border-b-4 border-[#162048] pb-4">
            Disclaimer
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              This Disclaimer governs your use of MAGAZINE. By accessing our website, you accept this disclaimer in full.
            </p>
          </section>

          <section id="general" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              General Disclaimer
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              All information on MAGAZINE is provided in good faith, but we make no representations or warranties of any kind regarding accuracy, adequacy, validity, reliability, or completeness.
            </p>
          </section>

          <section id="advice" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              No Professional Advice
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Content on MAGAZINE is for informational purposes only and does not constitute professional advice. Always seek the advice of qualified professionals.
            </p>
          </section>

          <section id="external" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              External Links
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE may contain links to external websites. We do not guarantee or endorse the content of third-party sites and are not responsible for their practices.
            </p>
          </section>

          <section id="liability" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Limitation of Liability
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE is not liable for any loss or damage arising from your use of our website or reliance on any information provided.
            </p>
          </section>

          <section id="changes" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Changes to Disclaimer
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We may update this Disclaimer at any time. Changes will be posted here with the effective date.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For questions about this Disclaimer, email us at <a href="mailto:legal@magazine.com" className="text-[#162048] underline font-bold">legal@magazine.com</a>.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default DisclaimerSection;