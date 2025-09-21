import React, { useEffect, useState } from "react";

const sidebarLinks = [
  { label: "Introduction", to: "#introduction" },
  { label: "Copyright Ownership", to: "#ownership" },
  { label: "Use of Content", to: "#use-content" },
  { label: "Permissions", to: "#permissions" },
  { label: "Reporting Infringement", to: "#reporting" },
  { label: "Third-Party Content", to: "#third-party" },
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

const CopyrightInformationSection = () => {
  const ids = sidebarLinks.map((l) => l.to);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-[#e3e7f7] min-h-screen">
      <main className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10">
        <aside className="bg-white border-4 border-[#162048] rounded-2xl p-6 w-full md:w-1/3 mb-8 md:mb-0 md:sticky md:top-24 h-fit self-start shadow-lg">
          <h3 className="font-extrabold text-2xl text-[#162048] mb-6 tracking-wide">
            Copyright Information Sections
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
            Copyright Information
          </h1>

          <section id="introduction" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Introduction
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              MAGAZINE respects intellectual property rights and is committed to protecting the content on our website. This page outlines our copyright policies and your rights regarding our content.
            </p>
          </section>

          <section id="ownership" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Copyright Ownership
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              All articles, images, graphics, and other materials on MAGAZINE are protected by copyright laws and are owned by MAGAZINE or its licensors unless otherwise stated.
            </p>
          </section>

          <section id="use-content" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Use of Content
            </h2>
            <ul className="list-disc pl-6 text-lg text-[#1a1a1a] mb-4">
              <li>You may view, download, and print content for personal, non-commercial use only.</li>
              <li>Any other use, including reproduction, modification, distribution, or republication, requires prior written permission from MAGAZINE.</li>
            </ul>
          </section>

          <section id="permissions" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Permissions
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              To request permission to use our content, please contact us at <a href="mailto:copyright@magazine.com" className="text-[#162048] underline font-bold">copyright@magazine.com</a> with details of your request.
            </p>
          </section>

          <section id="reporting" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Reporting Infringement
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              If you believe your copyright has been infringed on MAGAZINE, please notify us with supporting information. We will investigate and take appropriate action.
            </p>
          </section>

          <section id="third-party" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Third-Party Content
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              Some content may be owned by third parties and used with permission. Such content is subject to the copyright policies of the respective owners.
            </p>
          </section>

          <section id="contact" className="mb-10 scroll-mt-32">
            <h2 className="text-2xl font-extrabold text-[#162048] mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-lg text-[#1a1a1a] mb-4 leading-relaxed">
              For copyright questions or requests, email us at <a href="mailto:copyright@magazine.com" className="text-[#162048] underline font-bold">copyright@magazine.com</a>.
            </p>
          </section>
        </section>
      </main>
    </div>
  );
};

export default CopyrightInformationSection;