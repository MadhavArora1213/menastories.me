import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram, FaGlobe, FaEnvelope, FaCalendar } from 'react-icons/fa';

const AuthorByline = ({ author, publishedAt, showBio = false, variant = 'default', className = '' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSocialIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="w-4 h-4" />;
      case 'linkedin':
        return <FaLinkedin className="w-4 h-4" />;
      case 'facebook':
        return <FaFacebook className="w-4 h-4" />;
      case 'instagram':
        return <FaInstagram className="w-4 h-4" />;
      case 'website':
        return <FaGlobe className="w-4 h-4" />;
      case 'email':
        return <FaEnvelope className="w-4 h-4" />;
      default:
        return <FaGlobe className="w-4 h-4" />;
    }
  };

  const renderSocialLinks = () => {
    if (!author.socialLinks) return null;
    
    return (
      <div className="flex items-center gap-3">
        {Object.entries(author.socialLinks).map(([platform, url]) => {
          if (!url) return null;
          
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              title={`${author.name} on ${platform}`}
            >
              {getSocialIcon(platform)}
            </a>
          );
        })}
      </div>
    );
  };

  const renderDefaultByline = () => (
    <div className={`flex items-center gap-4 py-4 border-b border-gray-200 mb-8 ${className}`}>
      <div className="flex-shrink-0">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-lg">
              {author.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">Written by</span>
          <Link
            to={`/authors/${author.id}`}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {author.name}
          </Link>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <FaCalendar className="w-3 h-3" />
            <span>{formatDate(publishedAt)}</span>
          </div>
          
          {author.role && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {author.role}
            </span>
          )}
        </div>
        
        {author.socialLinks && (
          <div className="mt-2">
            {renderSocialLinks()}
          </div>
        )}
      </div>
    </div>
  );

  const renderCompactByline = () => (
    <div className={`flex items-center gap-3 ${className}`}>
      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
      
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">By</span>
        <Link
          to={`/authors/${author.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {author.name}
        </Link>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{formatDate(publishedAt)}</span>
      </div>
      
      {author.socialLinks && (
        <div className="ml-auto">
          {renderSocialLinks()}
        </div>
      )}
    </div>
  );

  const renderCardByline = () => (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium text-xl">
                {author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link
              to={`/authors/${author.id}`}
              className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors"
            >
              {author.name}
            </Link>
            {author.verified && (
              <span className="text-blue-500 text-sm">✓</span>
            )}
          </div>
          
          {author.role && (
            <p className="text-sm text-gray-600 mb-2">{author.role}</p>
          )}
          
          {showBio && author.bio && (
            <p className="text-gray-600 text-sm mb-3 leading-relaxed">
              {author.bio}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <FaCalendar className="w-3 h-3" />
              <span>Published {formatDate(publishedAt)}</span>
            </div>
            
            {author.socialLinks && renderSocialLinks()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInlineByline = () => (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {author.avatar && (
        <img
          src={author.avatar}
          alt={author.name}
          className="w-6 h-6 rounded-full object-cover"
        />
      )}
      <span className="text-sm text-gray-600">
        By{' '}
        <Link
          to={`/authors/${author.id}`}
          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
        >
          {author.name}
        </Link>
      </span>
    </div>
  );

  const renderMinimalByline = () => (
    <div className={`text-sm text-gray-600 ${className}`}>
      <Link
        to={`/authors/${author.id}`}
        className="font-medium hover:text-blue-600 transition-colors"
      >
        {author.name}
      </Link>
      <span className="mx-2">•</span>
      <span>{formatDate(publishedAt)}</span>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompactByline();
    case 'card':
      return renderCardByline();
    case 'inline':
      return renderInlineByline();
    case 'minimal':
      return renderMinimalByline();
    default:
      return renderDefaultByline();
  }
};

export default AuthorByline;