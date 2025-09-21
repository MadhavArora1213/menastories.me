import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  article = null,
  author = null,
  publishedTime = null,
  modifiedTime = null,
  section = null,
  tags = [],
  canonical = null,
  noindex = false,
  structuredData = null
}) => {
  const siteName = 'Premium Magazine Website';
  const defaultImage = '/icons/icon-512x512.png';
  const siteUrl = 'https://your-domain.com';

  // Construct full title
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  // Construct full URL
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

  // Construct full image URL
  const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}${defaultImage}`;

  // Default description
  const defaultDescription = 'Premium digital magazine platform featuring exclusive articles on people, profiles, entertainment, lifestyle, regional news, and trending topics.';
  const metaDescription = description || defaultDescription;

  // Enhanced default keywords with long-tail keywords
  const defaultKeywords = 'magazine, digital magazine, articles, news, entertainment, lifestyle, people, profiles, regional news, trending topics, celebrity interviews, business leaders, technology news, cultural events, exclusive content, premium articles, latest news updates';
  const metaKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  // Generate structured data
  const generateStructuredData = () => {
    if (structuredData) return structuredData;

    const baseData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      'name': title || siteName,
      'description': metaDescription,
      'url': fullUrl,
      'image': fullImage,
      'publisher': {
        '@type': 'Organization',
        'name': siteName,
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl}/icons/icon-512x512.png`
        }
      }
    };

    if (type === 'article' && article) {
      baseData['@type'] = 'Article';
      baseData.headline = article.title || title;
      baseData.articleSection = section || article.category;
      baseData.keywords = tags.join(', ') || article.tags?.join(', ');
      if (author) {
        baseData.author = {
          '@type': 'Person',
          'name': author.name,
          'url': author.profileUrl
        };
      }
      if (publishedTime) baseData.datePublished = publishedTime;
      if (modifiedTime) baseData.dateModified = modifiedTime;
    }

    return baseData;
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content={author?.name || siteName} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && author && <meta property="article:author" content={author.name} />}
      {type === 'article' && section && <meta property="article:section" content={section} />}
      {type === 'article' && tags.length > 0 && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@yourmagazine" />
      {author && <meta name="twitter:creator" content={`@${author.twitter || 'yourmagazine'}`} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>

      {/* Preload critical resources if needed */}
      {image && <link rel="preload" as="image" href={fullImage} />}
    </Helmet>
  );
};

export default SEO;