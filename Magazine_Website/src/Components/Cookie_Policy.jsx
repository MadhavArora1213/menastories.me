import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "What Are Cookies?", to: "#what-are-cookies" },
  { label: "How We Use Cookies", to: "#how-we-use" },
  { label: "Types of Cookies We Use", to: "#types" },
  { label: "Managing Cookies", to: "#managing" },
  { label: "Third-Party Cookies", to: "#third-party" },
  { label: "Changes to Policy", to: "#changes" },
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

const CookiePolicySection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        {/* Sticky Sidebar */}
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Cookie Policy Sections
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
            Cookie Policy
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              This Cookie Policy explains how MAGAZINE uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control our use of them.
            </p>
          </section>

          <section id="what-are-cookies" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              What Are Cookies?
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Cookies are small data files placed on your device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide reporting information.
            </p>
          </section>

          <section id="how-we-use" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              How We Use Cookies
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>To remember your preferences and settings.</li>
              <li>To analyze site traffic and usage.</li>
              <li>To deliver personalized content and advertisements.</li>
              <li>To improve website functionality and performance.</li>
            </ul>
          </section>

          <section id="types" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>
                <strong>Essential Cookies:</strong> Necessary for the operation of our website.
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors interact with our site.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences and choices.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Used to deliver relevant ads and track ad performance.
              </li>
            </ul>
          </section>

          <section id="managing" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Managing Cookies
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              You can control and manage cookies through your browser settings. You may also opt out of certain cookies, but this may affect your experience on our site.
            </p>
          </section>

          <section id="third-party" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Third-Party Cookies
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Some cookies may be set by third-party services that appear on our pages. We do not control the use of these cookies and recommend you review their policies.
            </p>
          </section>

          <section id="changes" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Changes to This Policy
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We may update this Cookie Policy from time to time. Changes will be posted here with the effective date. Please review regularly.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For questions about this Cookie Policy, email us at{" "}
              <a href="mailto:privacy@magazine.com" className="text-[#162048] underline font-bold">
                privacy@magazine.com
              </a>
              .<br />
              Or write to: MAGAZINE Privacy Team, 225 Liberty Street, 7th Floor, New York, NY 10281.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default CookiePolicySection;