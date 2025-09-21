import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Our Commitment", to: "#commitment" },
  { label: "What We Collect", to: "#collect" },
  { label: "How We Use Info", to: "#use-info" },
  { label: "Sharing & Disclosure", to: "#sharing" },
  { label: "Your Rights", to: "#rights" },
  { label: "Data Protection", to: "#protection" },
  { label: "Children's Privacy", to: "#children" },
  { label: "International Users", to: "#international" },
  { label: "Policy Updates", to: "#updates" },
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

const PrivacyPolicySection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        {/* Sticky Sidebar */}
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Privacy Policy Sections
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
            Privacy Policy
          </h1>

          <section id="commitment" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Our Commitment to Your Privacy
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              At <span className="font-bold text-[#162048]">MAGAZINE</span>, your privacy is our highest priority. We believe in transparency, trust, and empowering you to control your personal information. This Privacy Policy explains how we collect, use, and protect your data when you interact with our website and services.
            </p>
          </section>

          <section id="collect" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              What We Collect
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>
                <strong>Personal Data:</strong> Name, email, and any details you provide when subscribing, commenting, or contacting us.
              </li>
              <li>
                <strong>Usage Data:</strong> Device info, IP address, browser type, pages visited, and interactions.
              </li>
              <li>
                <strong>Cookies & Tracking:</strong> Used for analytics, site functionality, and personalization.
              </li>
              <li>
                <strong>Third-Party Data:</strong> Information from partners or social media if you interact with us there.
              </li>
            </ul>
            <div className="mt-2 text-[#162048] font-semibold">
              We never sell your personal information.
            </div>
          </section>

          <section id="use-info" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>To deliver, maintain, and improve our content and services.</li>
              <li>To personalize your experience and recommend relevant articles.</li>
              <li>To communicate updates, newsletters, and respond to inquiries.</li>
              <li>To analyze site usage and optimize user experience.</li>
              <li>To comply with legal obligations and protect our users.</li>
            </ul>
          </section>

          <section id="sharing" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Sharing & Disclosure
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>
                <strong>Service Providers:</strong> Trusted vendors for site operation and communication.
              </li>
              <li>
                <strong>Legal Requirements:</strong> Disclosure if required by law or to protect rights.
              </li>
              <li>
                <strong>Business Transfers:</strong> Data may transfer in case of merger or acquisition.
              </li>
              <li>
                <strong>With Consent:</strong> Shared for other purposes only with your permission.
              </li>
            </ul>
          </section>

          <section id="rights" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Your Choices & Rights
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Opt out of newsletters or marketing emails anytime.</li>
              <li>Disable cookies in your browser settings.</li>
              <li>Contact us to access, update, or delete your data.</li>
              <li>Additional rights may apply under local laws (GDPR, CCPA).</li>
            </ul>
          </section>

          <section id="protection" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Data Protection
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We use industry-standard security measures, including encryption and secure servers, to protect your data. Our team regularly reviews our practices to ensure your information is safe.
            </p>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>Secure HTTPS connections</li>
              <li>Regular security audits</li>
              <li>Limited access to personal data</li>
            </ul>
            <div className="mt-2 text-[#162048] font-semibold">
              No method of transmission or storage is 100% secure. Please use strong passwords and be cautious online.
            </div>
          </section>

          <section id="children" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Children's Privacy
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We do not knowingly collect personal information from children under 13. If you believe your child has provided us data, contact us for removal.
            </p>
          </section>

          <section id="international" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              International Users
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              If you access MAGAZINE from outside the United States, your information may be transferred to, stored, and processed in the US. We comply with applicable data protection laws and respect your rights.
            </p>
          </section>

          <section id="updates" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Policy Updates
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted here with the effective date. Please review regularly.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For questions about this Privacy Policy or your data, email us at{" "}
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

export default PrivacyPolicySection;