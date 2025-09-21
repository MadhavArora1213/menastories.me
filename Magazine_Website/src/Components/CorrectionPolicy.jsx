import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "Our Correction Commitment", to: "#commitment" },
  { label: "How to Request a Correction", to: "#request" },
  { label: "Correction Process", to: "#process" },
  { label: "Transparency", to: "#transparency" },
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

const CorrectionPolicySection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Correction Policy Sections
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
            Correction Policy
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE is committed to accuracy and transparency. We strive to correct errors promptly and clearly.
            </p>
          </section>

          <section id="commitment" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Our Correction Commitment
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We take responsibility for our content and will correct factual errors as soon as they are identified.
            </p>
          </section>

          <section id="request" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              How to Request a Correction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              If you spot an error, please contact us at <a href="mailto:corrections@magazine.com" className="text-[#162048] underline font-bold">corrections@magazine.com</a> with details and supporting information.
            </p>
          </section>

          <section id="process" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Correction Process
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Review the request and verify the error.</li>
              <li>Make necessary corrections to the content.</li>
              <li>Note the correction at the end of the article if significant.</li>
              <li>Notify the requester if contact information is provided.</li>
            </ul>
          </section>

          <section id="transparency" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Transparency
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Major corrections will be clearly marked and explained. We value your trust and strive for openness.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For correction requests or questions, email us at <a href="mailto:corrections@magazine.com" className="text-[#162048] underline font-bold">corrections@magazine.com</a>.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default CorrectionPolicySection;