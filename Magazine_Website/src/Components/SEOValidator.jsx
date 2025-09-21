import React, { useState, useEffect } from 'react';

const SEOValidator = () => {
  const [seoScore, setSeoScore] = useState(0);
  const [issues, setIssues] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    validateSEO();
  }, []);

  const validateSEO = () => {
    const issues = [];
    const recommendations = [];
    let score = 100;

    // Check title
    const title = document.title;
    if (!title) {
      issues.push('Missing page title');
      score -= 20;
    } else if (title.length < 30) {
      recommendations.push('Title is too short (should be 30-60 characters)');
      score -= 5;
    } else if (title.length > 60) {
      recommendations.push('Title is too long (should be 30-60 characters)');
      score -= 5;
    }

    // Check meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc || !metaDesc.content) {
      issues.push('Missing meta description');
      score -= 15;
    } else if (metaDesc.content.length < 120) {
      recommendations.push('Meta description is too short (should be 120-160 characters)');
      score -= 5;
    } else if (metaDesc.content.length > 160) {
      recommendations.push('Meta description is too long (should be 120-160 characters)');
      score -= 5;
    }

    // Check Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');

    if (!ogTitle) {
      issues.push('Missing Open Graph title');
      score -= 5;
    }
    if (!ogDesc) {
      issues.push('Missing Open Graph description');
      score -= 5;
    }
    if (!ogImage) {
      issues.push('Missing Open Graph image');
      score -= 5;
    }

    // Check Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    if (!twitterTitle) {
      recommendations.push('Missing Twitter Card title');
      score -= 3;
    }
    if (!twitterDesc) {
      recommendations.push('Missing Twitter Card description');
      score -= 3;
    }
    if (!twitterImage) {
      recommendations.push('Missing Twitter Card image');
      score -= 3;
    }

    // Check structured data
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      issues.push('Missing structured data (JSON-LD)');
      score -= 15;
    }

    // Check canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      recommendations.push('Missing canonical URL');
      score -= 5;
    }

    // Check robots meta
    const robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      recommendations.push('Missing robots meta tag');
      score -= 3;
    }

    // Check images for alt text
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      recommendations.push(`${imagesWithoutAlt.length} images missing alt text`);
      score -= Math.min(imagesWithoutAlt.length * 2, 10);
    }

    // Check heading structure
    const h1Tags = document.querySelectorAll('h1');
    if (h1Tags.length === 0) {
      issues.push('Missing H1 tag');
      score -= 10;
    } else if (h1Tags.length > 1) {
      recommendations.push('Multiple H1 tags found (should have only one)');
      score -= 5;
    }

    setSeoScore(Math.max(0, score));
    setIssues(issues);
    setRecommendations(recommendations);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="seo-validator bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">SEO Validation Results</h2>

      {/* SEO Score */}
      <div className={`p-4 rounded-lg mb-6 ${getScoreBg(seoScore)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">SEO Score</h3>
            <p className="text-sm text-gray-600">Overall SEO health of this page</p>
          </div>
          <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>
            {seoScore}/100
          </div>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Critical Issues</h3>
          <ul className="space-y-2">
            {issues.map((issue, index) => (
              <li key={index} className="flex items-center text-red-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-600 mb-3">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-center text-yellow-700">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Validation Checklist */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">SEO Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.title ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Page Title</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.querySelector('meta[name="description"]') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Meta Description</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.querySelector('meta[property="og:title"]') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Open Graph Tags</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.querySelector('meta[name="twitter:title"]') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Twitter Cards</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.querySelector('script[type="application/ld+json"]') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Structured Data</span>
          </div>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${document.querySelector('link[rel="canonical"]') ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">Canonical URL</span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={validateSEO}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Re-validate SEO
        </button>
      </div>
    </div>
  );
};

export default SEOValidator;