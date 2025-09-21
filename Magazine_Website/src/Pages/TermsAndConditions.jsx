import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "Acceptance of Terms", to: "#acceptance" },
  { label: "User Responsibilities", to: "#responsibilities" },
  { label: "Intellectual Property", to: "#intellectual-property" },
  { label: "Prohibited Activities", to: "#prohibited" },
  { label: "Third-Party Links", to: "#third-party" },
  { label: "Disclaimer", to: "#disclaimer" },
  { label: "Limitation of Liability", to: "#liability" },
  { label: "Indemnification", to: "#indemnification" },
  { label: "Changes to Terms", to: "#changes" },
  { label: "Governing Law", to: "#law" },
  { label: "Contact Us", to: "#contact" },
];

// Utility to get current section from scroll
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

const TermsAndConditions = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        {/* Sticky Sidebar */}
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Terms & Conditions
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

        {/* Article Content */}
        <section className="flex-1">
          <h1 className="text-4xl font-extrabold text-[#162048] mb-8 tracking-wide border-b-4 border-[#162048] pb-4">
            Terms and Conditions
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Welcome to MAGAZINE. These Terms and Conditions govern your use of our website and services. By accessing or using MAGAZINE, you agree to comply with these terms.
            </p>
          </section>

          <section id="acceptance" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Acceptance of Terms
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section id="responsibilities" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              User Responsibilities
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Provide accurate information when required.</li>
              <li>Respect other users and refrain from abusive behavior.</li>
              <li>Comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section id="intellectual-property" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Intellectual Property
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              All content, trademarks, and intellectual property on MAGAZINE are owned by us or our licensors. You may not use, reproduce, or distribute our content without permission.
            </p>
          </section>

          <section id="prohibited" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Prohibited Activities
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Posting unlawful, harmful, or offensive content.</li>
              <li>Attempting to gain unauthorized access to our systems.</li>
              <li>Using our site for fraudulent or malicious purposes.</li>
            </ul>
          </section>

          <section id="third-party" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Third-Party Links
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Our website may contain links to third-party sites. We are not responsible for the content or privacy practices of those sites.
            </p>
          </section>

          <section id="disclaimer" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Disclaimer
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of our content.
            </p>
          </section>

          <section id="liability" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Limitation of Liability
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We are not liable for any damages arising from your use of our website or services.
            </p>
          </section>

          <section id="indemnification" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Indemnification
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              You agree to indemnify and hold MAGAZINE harmless from any claims, damages, or expenses resulting from your violation of these Terms.
            </p>
          </section>

          <section id="changes" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Changes to Terms
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We may update these Terms and Conditions at any time. Changes will be posted on this page with the effective date.
            </p>
          </section>

          <section id="law" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Governing Law
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              These Terms are governed by the laws of New York, USA.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For questions about these Terms and Conditions, email us at{" "}
              <a href="mailto:legal@magazine.com" className="text-[#162048] underline font-bold">
                legal@magazine.com
              </a>
              .<br />
              Or write to: MAGAZINE Legal Team, 225 Liberty Street, 7th Floor, New York, NY 10281.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default TermsAndConditions;