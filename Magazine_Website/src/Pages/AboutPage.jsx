import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Example images (replace with your own or use Unsplash/illustrations)
const images = {
  hero: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80",
  team: "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=800&q=80",
  values: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
  company: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
};

const sections = [
  {
    id: "who-we-are",
    title: "Who We Are",
    image: images.team,
    content: (
      <p>
        MAGAZINE’s accomplished team of editors, writers, designers and
        photographers are dedicated to our core mission: to inform, entertain and
        inspire by sharing the stories that everyone will be talking about. Our
        team is comprised of trusted experts in nearly every field. We’re the
        go-to source for news about technology, lifestyle, business, travel,
        health, entertainment and more, and we elevate powerful human interest
        stories and everyday people making a difference in their communities.
        With decades of experience and a true passion for the subjects we cover,
        our journalists believe in the power of storytelling to make a difference.
      </p>
    ),
  },
  {
    id: "all-about-magazine",
    title: "All About MAGAZINE",
    image: images.hero,
    content: (
      <p>
        MAGAZINE delivers trustworthy news and captivating human interest stories,
        connecting you to the pulse of culture. Since our first issue, we have
        been striving to tell compelling stories about the people behind the
        issues, as opposed to just the issues themselves. We are your everyday
        escape, taking you inside the lives of intriguing stars, newsmakers,
        up-and-comers and ordinary people doing extraordinary things. We serve
        and delight you by providing ideas about beauty, food and style through
        the lens of the people influencing the trends. And we are a force for
        good by telling stories of hope, optimism and kindness that drive
        conversation and inspire action.
      </p>
    ),
  },
  {
    id: "editorial-policy",
    title: "Editorial Policy",
    image: images.values,
    content: (
      <>
        <p>
          If you read it on MAGAZINE, you know it is true. MAGAZINE is committed
          to accurate, fair and complete journalism. We uphold the highest
          standards of editorial integrity and transparency in all our content.
        </p>
        <p>
          <Link to="#" className="text-[#162048] underline font-bold">
            Read our full Editorial Policy
          </Link>
        </p>
      </>
    ),
  },
  {
    id: "ai-other-tech",
    title: "AI & Other Technology",
    image: images.hero,
    content: (
      <p>
        At MAGAZINE, we are committed to providing the highest quality content,
        created by a trusted group of human writers, reporters and editors with
        our audience in mind. It is against our guidelines to publish
        automatically generated content that has been written by AI tools.
      </p>
    ),
  },
  {
    id: "our-values",
    title: "Our Values",
    image: images.values,
    content: (
      <>
        <p>
          From our founding through today, MAGAZINE remains committed to sharing
          stories of ordinary people doing extraordinary things and extraordinary
          people doing ordinary things. We are dedicated to telling a broad
          spectrum of personality-driven stories that reflect our vast and varied
          audience.
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li>
            <strong>Accuracy:</strong> We ensure all information is correct
            and up-to-date.
          </li>
          <li>
            <strong>Fairness:</strong> We present diverse viewpoints and
            respect all voices.
          </li>
          <li>
            <strong>Transparency:</strong> We disclose sources and correct
            errors promptly.
          </li>
          <li>
            <strong>Creativity:</strong> We encourage innovative ideas and
            fresh perspectives.
          </li>
          <li>
            <strong>Community:</strong> We foster a welcoming environment for
            readers and contributors.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "community-guidelines",
    title: "Community Guidelines",
    image: images.values,
    content: (
      <>
        <p>
          Our comments section is intended to be a place where readers can
          engage in discussions about our stories. Offensive language, hate
          speech, personal attacks and/or defamatory statements are not
          allowed. Advertising or spammy content is also prohibited. Comments
          are not always available on all stories.
        </p>
        <p>
          Comments are moderated and may be deleted without notice. Repeat
          offenders may be banned without notice. We reserve the right to
          delete comments and ban offenders at our discretion. Our decisions
          are final.
        </p>
      </>
    ),
  },
  {
    id: "leadership",
    title: "MAGAZINE Leadership",
    image: images.team,
    content: (
      <>
        <p>
          Our leadership team is committed to upholding our values and guiding
          MAGAZINE’s vision. Our editorial staff includes experienced
          journalists, subject matter experts, and creative professionals who
          work together to deliver outstanding content.
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li>Editor in Chief: Alex Johnson</li>
          <li>Associate General Manager: Jane Smith</li>
          <li>Executive Director, Special Projects: Mark Wilson</li>
          <li>Director of Operations and Finance: Sarah Lee</li>
          <li>Executive Editorial Director: John Doe</li>
        </ul>
      </>
    ),
  },
  {
    id: "editorial-staff",
    title: "Editorial Staff",
    image: images.team,
    content: (
      <>
        <p>
          Our editorial team includes section editors, writers, designers,
          photographers, and digital producers. Each member brings unique
          expertise and a passion for storytelling.
        </p>
        <ul className="list-disc pl-6 mb-2">
          <li>Senior Editors: Technology, Lifestyle, Travel, Business, Health, Entertainment</li>
          <li>Staff Writers & Reporters</li>
          <li>Design & Photography Team</li>
          <li>Digital & Social Media Team</li>
        </ul>
      </>
    ),
  },
  {
    id: "about-company",
    title: "About Our Company",
    image: images.company,
    content: (
      <p>
        MAGAZINE is part of a family of brands committed to creating
        accurate, helpful news and information that represents and serves
        all people. From mobile to magazines, thousands trust us to help
        them make decisions, take action and find inspiration. Our brands
        include MAGAZINE, Better Living, Food & Style, and more.
      </p>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    image: images.hero,
    content: (
      <>
        <p>
          Do you have something you'd like to let us know? Whether you have
          an idea to share or a lead we should pursue, we look forward to
          hearing from you:{" "}
          <a
            href="mailto:tips@magazine.com"
            className="text-[#162048] underline font-bold"
          >
            tips@magazine.com
          </a>
          .
        </p>
        <p>
          Send feedback on content to{" "}
          <a
            href="mailto:feedback@magazine.com"
            className="text-[#162048] underline font-bold"
          >
            feedback@magazine.com
          </a>
          .
        </p>
        <p>
          For press inquiries, email us at{" "}
          <a
            href="mailto:press@magazine.com"
            className="text-[#162048] underline font-bold"
          >
            press@magazine.com
          </a>
          .
        </p>
        <p>
          If you would rather send us a letter, you can reach us at 225
          Liberty Street, 7th Floor, New York, NY 10281.
        </p>
      </>
    ),
  },
  {
    id: "engage-with-us",
    title: "Engage with Us",
    image: images.values,
    content: (
      <p>
        MAGAZINE is everywhere you are. You can find us on Facebook,
        Instagram, Snapchat, Pinterest and TikTok.
      </p>
    ),
  },
  {
    id: "work-with-us",
    title: "Work with Us",
    image: images.team,
    content: (
      <p>
        Join our crew of top-notch reporters, editors, designers and more as
        we continue to report the latest news and human interest stories.{" "}
        <a
          href="#"
          className="text-[#162048] underline font-bold"
        >
          View job openings
        </a>
      </p>
    ),
  },
  {
    id: "advertise-with-us",
    title: "Advertise with Us",
    image: images.company,
    content: (
      <p>
        MAGAZINE offers the highest value to advertisers through a
        combination of scale, credibility and intent. Interested in
        advertising with us? Email us at{" "}
        <a
          href="mailto:ads@magazine.com"
          className="text-[#162048] underline font-bold"
        >
          ads@magazine.com
        </a>{" "}
        or check out our media kit to learn more.
      </p>
    ),
  },
];

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    function onScroll() {
      let found = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
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

const AboutPage = () => {
  const ids = sections.map((s) => s.id);
  const activeSection = useActiveSection(ids);

  return (
    <div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[260px] md:h-[400px] mb-12 rounded-b-3xl overflow-hidden shadow-xl">
        <img
          src={images.hero}
          alt="Magazine Team"
          className="object-cover w-full h-full brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#162048]/70 via-transparent to-[#ffe000]/40"></div>
        <div className="absolute left-0 right-0 bottom-0 px-6 py-6 md:px-16 md:py-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-2">
            About MAGAZINE
          </h1>
          <p className="text-lg md:text-2xl text-white font-medium drop-shadow-lg">
            Inspiring stories. Trusted journalism. Real people.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-2 md:px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="bg-white border-2 border-[#162048] rounded-xl p-4 w-full md:w-1/4 mb-8 md:mb-0 md:sticky md:top-32 h-fit self-start shadow-md">
          <h3 className="font-extrabold text-xl md:text-2xl text-[#162048] mb-4 tracking-wide">
            About Navigation
          </h3>
          <ul className="space-y-2">
            {sections.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`block px-3 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      activeSection === item.id
                        ? "bg-[#162048] text-white font-bold shadow border border-[#162048]"
                        : "text-[#162048] hover:bg-[#ffe000]/10 hover:text-[#1a1a1a] border border-transparent"
                    }`}
                  style={{
                    boxShadow:
                      activeSection === item.id
                        ? "0 2px 8px rgba(22,32,72,0.10)"
                        : undefined,
                  }}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <section className="flex-1">
          <div className="space-y-12">
            {sections.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="scroll-mt-32 mb-8"
              >
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#162048] mb-4 tracking-wide">
                  {sec.title}
                </h2>
                <div className="mb-4 flex justify-center">
                  <div className="border-4 border-black rounded-xl overflow-hidden shadow-lg w-full max-w-xl bg-white">
                    <img
                      src={sec.image}
                      alt={sec.title}
                      className="w-full h-48 md:h-64 object-cover"
                    />
                  </div>
                </div>
                <div className="prose max-w-none text-[#1a1a1a] leading-relaxed">
                  {sec.content}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;