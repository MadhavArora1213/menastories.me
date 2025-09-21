import React from "react";

const guidelines = [
	{
		title: "Accuracy & Fact-Checking",
		description:
			"We are committed to publishing accurate and reliable information. All articles are thoroughly researched and fact-checked before publication. Corrections are made promptly when errors are identified.",
	},
	{
		title: "Impartiality & Fairness",
		description:
			"Our editorial team strives to present stories fairly and without bias. We seek diverse viewpoints and avoid conflicts of interest in our reporting.",
	},
	{
		title: "Transparency",
		description:
			"We disclose sources, affiliations, and any potential conflicts of interest. Sponsored content is clearly labeled, and we maintain transparency in our editorial process.",
	},
	{
		title: "Respect & Sensitivity",
		description:
			"We treat all subjects and sources with respect and sensitivity. Content that is discriminatory, hateful, or offensive is not tolerated.",
	},
	{
		title: "Corrections & Updates",
		description:
			"If a story requires correction or update, we act quickly and transparently. Our correction policy ensures readers are informed of any changes.",
	},
	{
		title: "Editorial Independence",
		description:
			"Our editorial decisions are made independently, free from undue influence by advertisers, sponsors, or outside parties.",
	},
	{
		title: "Community Standards",
		description:
			"We encourage constructive engagement and uphold community guidelines in comments and interactions. Hate speech, personal attacks, and spam are not permitted.",
	},
];

const EditorialGuidelines = () => (
	<div className="bg-gradient-to-br from-[#e3e7f7] via-white to-[#e3e7f7] min-h-screen py-12">
		<div className="container mx-auto px-4">
			<h1 className="text-5xl font-extrabold text-[#162048] mb-10 text-center tracking-wide drop-shadow-lg">
				Editorial Guidelines
			</h1>
			<div className="relative max-w-3xl mx-auto">
				{/* Timeline vertical line */}
				<div className="absolute left-1/2 transform -translate-x-1/2 h-full w-2 bg-gradient-to-b from-[#162048] via-[#e3e7f7] to-[#162048] rounded-full z-0"></div>
				<ul className="space-y-16">
					{guidelines.map((item, idx) => {
						const isLeft = idx % 2 === 0;
						return (
							<li key={item.title} className="relative flex items-center">
								{/* Curvy connector */}
								<div
									className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0`}
								>
									<svg
										width="120"
										height="60"
										viewBox="0 0 120 60"
										fill="none"
									>
										<path
											d={
												isLeft
													? "M60,0 Q0,30 60,60"
													: "M60,0 Q120,30 60,60"
											}
											stroke="#162048"
											strokeWidth="3"
											fill="none"
										/>
									</svg>
								</div>
								{/* Timeline point */}
								<div
									className="z-10 flex flex-col items-center w-1/2"
									style={{ order: isLeft ? 1 : 2 }}
								>
									<div className="flex justify-end">
										<div className="w-12 h-12 rounded-full bg-[#162048] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg border-4 border-[#e3e7f7]">
											{idx + 1}
										</div>
									</div>
									<div
										className={`mt-4 ${
											isLeft ? "mr-8 text-right" : "ml-8 text-left"
										}`}
									>
										<h2 className="text-xl font-bold text-[#162048] mb-2">
											{item.title}
										</h2>
										<p className="text-base text-[#1a1a1a]">
											{item.description}
										</p>
									</div>
								</div>
								{/* Empty space for other side */}
								<div
									className="w-1/2"
									style={{ order: isLeft ? 2 : 1 }}
								></div>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
		<style>
{`
  @media (max-width: 768px) {
    /* Stack items vertically */
    .container ul li {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    /* Full width text */
    .container ul li > div {
      width: 100% !important;
      margin: 0 !important;
      text-align: left !important;
    }
    /* Reset margins for text blocks */
    .container ul li .mt-4 {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    /* Hide the vertical line */
    .container .absolute.left-1\\/2 {
      display: none !important;
    }
    /* Hide curvy SVG connectors */
    .container svg {
      display: none !important;
    }
    /* Center the number badge above text */
    .container .w-12 {
      margin-bottom: 0.5rem;
    }
  }
`}
</style>

	</div>
);

export default EditorialGuidelines;