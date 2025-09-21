import React from 'react';
import { Helmet } from 'react-helmet-async';

const StructuredData = ({ type, data }) => {
  const generateStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org'
    };

    switch (type) {
      case 'article':
        return {
          ...baseData,
          '@type': 'Article',
          'headline': data.title,
          'description': data.excerpt || data.description,
          'image': data.featuredImage,
          'datePublished': data.publishedAt || data.createdAt,
          'dateModified': data.updatedAt || data.modifiedAt,
          'author': {
            '@type': 'Person',
            'name': data.author?.name,
            'url': data.author?.profileUrl
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Premium Magazine Website',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://your-domain.com/icons/icon-512x512.png'
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://your-domain.com/articles/${data.slug}`
          },
          'articleSection': data.category?.name,
          'keywords': data.tags?.join(', ')
        };

      case 'event':
        return {
          ...baseData,
          '@type': 'Event',
          'name': data.title,
          'description': data.description,
          'image': data.featuredImage || data.image,
          'startDate': data.startDate,
          'endDate': data.endDate,
          'location': {
            '@type': data.venue ? 'Place' : 'VirtualLocation',
            ...(data.venue && {
              'name': data.venue.name,
              'address': {
                '@type': 'PostalAddress',
                'streetAddress': data.venue.address,
                'addressLocality': data.venue.city,
                'addressRegion': data.venue.state,
                'postalCode': data.venue.zipCode,
                'addressCountry': data.venue.country
              }
            })
          },
          'organizer': {
            '@type': 'Organization',
            'name': data.organizer?.name || 'Magazine Website',
            'url': data.organizer?.website
          },
          'offers': {
            '@type': 'Offer',
            'price': data.price || '0',
            'priceCurrency': data.currency || 'USD',
            'availability': data.registrationOpen ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            'url': data.registrationLink || data.website
          },
          'eventStatus': data.status === 'published' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCancelled',
          'eventAttendanceMode': data.isVirtual ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode'
        };

      case 'video':
        return {
          ...baseData,
          '@type': 'VideoObject',
          'name': data.title,
          'description': data.description || data.excerpt,
          'thumbnailUrl': data.thumbnailUrl,
          'uploadDate': data.createdAt,
          'duration': data.duration,
          'contentUrl': data.videoUrl,
          'embedUrl': data.embedUrl,
          'interactionStatistic': {
            '@type': 'InteractionCounter',
            'interactionType': 'https://schema.org/WatchAction',
            'userInteractionCount': data.viewCount || 0
          },
          'author': {
            '@type': 'Person',
            'name': data.author?.name,
            'url': data.author?.profileUrl
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Premium Magazine Website',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://your-domain.com/icons/icon-512x512.png'
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://your-domain.com/videos/${data.slug}`
          },
          'keywords': data.tags?.join(', ')
        };

      case 'organization':
        return {
          ...baseData,
          '@type': 'Organization',
          'name': 'Premium Magazine Website',
          'url': 'https://your-domain.com',
          'logo': 'https://your-domain.com/icons/icon-512x512.png',
          'description': 'Leading digital magazine platform delivering premium content on entertainment, lifestyle, business, and regional news',
          'foundingDate': '2024',
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'AE',
            'addressRegion': 'Dubai'
          },
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+971-XX-XXXXXXX',
            'contactType': 'customer service',
            'availableLanguage': 'English'
          },
          'sameAs': [
            'https://facebook.com/yourmagazine',
            'https://twitter.com/yourmagazine',
            'https://instagram.com/yourmagazine',
            'https://linkedin.com/company/yourmagazine'
          ]
        };

      case 'breadcrumb':
        return {
          ...baseData,
          '@type': 'BreadcrumbList',
          'itemListElement': data.map((crumb, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': crumb.name,
            'item': `https://your-domain.com${crumb.url}`
          }))
        };

      case 'faq':
        return {
          ...baseData,
          '@type': 'FAQPage',
          'mainEntity': data.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': faq.answer
            }
          }))
        };

      case 'howto':
        return {
          ...baseData,
          '@type': 'HowTo',
          'name': data.title,
          'description': data.description,
          'step': data.steps?.map((step, index) => ({
            '@type': 'HowToStep',
            'position': index + 1,
            'name': step.title,
            'text': step.description,
            'image': step.image
          }))
        };

      case 'media_kit':
        return {
          ...baseData,
          '@type': 'CreativeWork',
          'name': data.title,
          'description': data.description,
          'image': data.featuredImage,
          'dateModified': data.lastModified,
          'publisher': {
            '@type': 'Organization',
            'name': data.publisher
          },
          'encodingFormat': data.fileFormat,
          'fileSize': data.fileSize,
          'downloadUrl': data.downloadUrl,
          'about': {
            '@type': 'Thing',
            'name': 'Advertising and Brand Partnership Resources'
          },
          'keywords': 'media kit, advertising, brand guidelines, marketing resources'
        };

      case 'document':
        return {
          ...baseData,
          '@type': 'DigitalDocument',
          'name': data.title,
          'description': data.description,
          'image': data.featuredImage,
          'dateModified': data.lastModified,
          'publisher': {
            '@type': 'Organization',
            'name': data.publisher
          },
          'encodingFormat': data.fileFormat,
          'fileSize': data.fileSize,
          'downloadUrl': data.downloadUrl,
          'keywords': data.keywords?.join(', ')
        };

      case 'downloads_page':
        return {
          ...baseData,
          '@type': 'WebPage',
          'name': data.title,
          'description': data.description,
          'image': data.featuredImage,
          'dateModified': data.lastUpdated,
          'mainEntity': {
            '@type': 'ItemList',
            'numberOfItems': data.availableFiles,
            'name': 'Available Downloads'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Magazine Website'
          },
          'about': data.categories?.map(cat => ({
            '@type': 'Thing',
            'name': cat
          }))
        };

      case 'download':
        return {
          ...baseData,
          '@type': 'DigitalDocument',
          'name': data.title,
          'description': data.description,
          'image': data.featuredImage,
          'dateModified': data.lastModified,
          'publisher': {
            '@type': 'Organization',
            'name': 'Magazine Website'
          },
          'encodingFormat': data.fileFormat,
          'fileSize': data.fileSize,
          'downloadUrl': data.downloadUrl,
          'interactionStatistic': {
            '@type': 'InteractionCounter',
            'interactionType': 'https://schema.org/DownloadAction',
            'userInteractionCount': data.downloadCount
          },
          'about': {
            '@type': 'Thing',
            'name': data.category
          },
          'keywords': data.keywords?.join(', ')
        };

      default:
        return null;
    }
  };

  const structuredData = generateStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;