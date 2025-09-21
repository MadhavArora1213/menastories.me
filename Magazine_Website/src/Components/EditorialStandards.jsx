import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "Editorial Principles", to: "#principles" },
  { label: "Fact-Checking", to: "#fact-checking" },
  { label: "Sources & Attribution", to: "#sources" },
  { label: "Impartiality", to: "#impartiality" },
  { label: "Corrections", to: "#corrections" },
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

const EditorialStandardsSection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Editorial Standards Sections
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
            Editorial Standards
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE is committed to the highest editorial standards. Our content is guided by principles of accuracy, fairness, and transparency.
            </p>
          </section>

          <section id="principles" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Editorial Principles
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Accuracy and truthfulness in reporting.</li>
              <li>Fair and balanced coverage of all topics.</li>
              <li>Respect for privacy and dignity.</li>
              <li>Transparency in sourcing and corrections.</li>
            </ul>
          </section>

          <section id="fact-checking" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Fact-Checking
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              All articles are thoroughly fact-checked before publication. We verify information with multiple sources whenever possible.
            </p>
          </section>

          <section id="sources" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Sources & Attribution
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We attribute information to reliable sources and provide links or references where appropriate.
            </p>
          </section>

          <section id="impartiality" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Impartiality
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Our editorial team strives to present information impartially, without bias or favoritism.
            </p>
          </section>

          <section id="corrections" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Corrections
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              If errors are found, we correct them promptly and transparently, following our Correction Policy.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For questions about our editorial standards, email us at <a href="mailto:editorial@magazine.com" className="text-[#162048] underline font-bold">editorial@magazine.com</a>.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default EditorialStandardsSection;