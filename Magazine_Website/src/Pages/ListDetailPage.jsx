import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, RefreshCw, ExternalLink, Users, Building2, MapPin, Award } from 'lucide-react';
import listService from '../services/listService';

const ListDetailPage = () => {
  const { slug } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listData, setListData] = useState(null);
  const [relatedLists, setRelatedLists] = useState([]);

  useEffect(() => {
    fetchListData();
  }, [slug]);

  const fetchListData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the specific list
      const listResponse = await listService.getList(slug);
      if (listResponse.success && listResponse.data) {
        setListData(listResponse.data);

        // Fetch related lists based on category and year
        const relatedResponse = await listService.getAllLists({
          limit: 6,
          status: 'published',
          category: listResponse.data.category,
          year: listResponse.data.year
        });

        if (relatedResponse.success && relatedResponse.data && relatedResponse.data.lists) {
          // Filter out the current list and get related ones
          const related = relatedResponse.data.lists
            .filter(list => list.id !== listResponse.data.id)
            .slice(0, 3);
          setRelatedLists(related);
        }
      } else {
        setError('List not found');
      }
    } catch (err) {
      console.error('Error fetching list data:', err);
      setError('Failed to load list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchListData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mb-6"></div>
          <p className="text-gray-600 text-lg">Loading list details...</p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="bg-red-50 rounded-full p-6 mb-6">
            <AlertCircle className="h-16 w-16 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading List</h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              to="/list"
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="bg-gray-50 rounded-full p-6 mb-6">
            <AlertCircle className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">List Not Found</h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-6">
            The list you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/list"
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Lists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{listData.title} | Magazine</title>
        <meta name="description" content={listData.description || listData.metaDescription} />
        {listData.featuredImage && <meta property="og:image" content={listData.featuredImage} />}
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/list" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mr-6">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Lists
                </Link>
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold text-black">MAGAZINE</span>
                </div>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">HOME</a>
                <a href="/list" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium border-b-2 border-black">LISTS</a>
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">NEWS</a>
                <a href="#" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">COMPANIES</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 mt-8">
            <span>Magazine</span>
            <span>/</span>
            <Link to="/list" className="hover:text-gray-700">Lists</Link>
            <span>/</span>
            <span className="text-gray-900">{listData.title}</span>
          </div>

          {/* Featured Header */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-8">
                {/* Portrait Grid */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {listData.entries?.slice(0, 5).map((entry, index) => (
                      <div key={entry.id} className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                        {entry.image ? (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/64/64';
                            }}
                          />
                        ) : (
                          <img src="/api/placeholder/64/64" alt={entry.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {listData.entries?.length < 5 && Array.from({ length: 5 - (listData.entries?.length || 0) }).map((_, index) => (
                      <div key={`placeholder-${index}`} className="w-16 h-16 rounded-full overflow-hidden border-3 border-white bg-gray-300"></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {listData.entries?.slice(5, 10).map((entry, index) => (
                      <div key={entry.id} className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
                        {entry.image ? (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/64/64';
                            }}
                          />
                        ) : (
                          <img src="/api/placeholder/64/64" alt={entry.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {listData.entries?.length < 10 && Array.from({ length: 10 - (listData.entries?.length || 0) }).map((_, index) => (
                      <div key={`placeholder-bottom-${index}`} className="w-16 h-16 rounded-full overflow-hidden border-3 border-white bg-gray-300"></div>
                    ))}
                  </div>
                </div>

                {/* Title Section */}
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <div className="text-right mb-8">
                    <div className="flex items-center justify-end gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-white text-xl font-bold">Magazine</span>
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                    </div>

                    <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight">
                      {listData.title.toUpperCase()}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* List Description */}
          <div className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{listData.title}</h2>
                {listData.description && (
                  <div className="prose prose-lg max-w-none text-gray-700 mb-6">
                    <p>{listData.description}</p>
                  </div>
                )}

                {/* List Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{listData.entries?.length || 0}</div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{listData.year}</div>
                    <div className="text-sm text-gray-600">Year</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <Building2 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{listData.category}</div>
                    <div className="text-sm text-gray-600">Category</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">Global</div>
                    <div className="text-sm text-gray-600">Scope</div>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="lg:col-span-1">
                {listData.featuredImage && (
                  <div className="sticky top-8">
                    <img
                      src={listData.featuredImage}
                      alt={listData.title}
                      className="w-full rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                    {listData.imageCaption && (
                      <p className="text-sm text-gray-600 mt-2 italic">{listData.imageCaption}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Complete List</h3>
            <div className="space-y-6">
              {listData.entries?.map((entry, index) => (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-6">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {entry.rank || index + 1}
                      </div>
                    </div>

                    {/* Entry Image */}
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                        {entry.image ? (
                          <img
                            src={entry.image}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/80/80';
                            }}
                          />
                        ) : (
                          <img src="/api/placeholder/80/80" alt={entry.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>

                    {/* Entry Details */}
                    <div className="flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{entry.name}</h4>
                      {entry.designation && (
                        <p className="text-lg text-blue-600 mb-1">{entry.designation}</p>
                      )}
                      {entry.company && (
                        <p className="text-lg text-gray-700 mb-2">{entry.company}</p>
                      )}
                      {entry.residence && (
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {entry.residence}
                        </p>
                      )}
                      {entry.description && (
                        <p className="text-gray-600 leading-relaxed">{entry.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology Section */}
          {listData.methodology && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Methodology</h3>
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="prose prose-lg max-w-none text-gray-700">
                  <div dangerouslySetInnerHTML={{ __html: listData.methodology }} />
                </div>
              </div>
            </div>
          )}

          {/* Related Lists */}
          {relatedLists.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Lists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedLists.map((relatedList) => (
                  <Link
                    key={relatedList.id}
                    to={`/lists/${relatedList.slug}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 relative">
                        <img
                          src={relatedList.featuredImage || '/api/placeholder/400/300'}
                          alt={relatedList.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/400/300';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Title Overlay */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-white text-sm font-bold uppercase tracking-wide">
                            {relatedList.title.replace(/\d{4}/g, '').trim()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {relatedList.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {relatedList.category}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {relatedList.entries?.length || 0} entries
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-2xl font-bold mb-4">MAGAZINE</h3>
                <p className="text-gray-400 leading-relaxed max-w-md">
                  The definitive source for business news, financial insights, and leadership intelligence.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">SECTIONS</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/list" className="hover:text-white transition-colors">Lists</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">News</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Companies</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Leaders</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-4">COMPANY</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="/terms-and-conditions" className="hover:text-white transition-colors">Terms</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 mt-8">
              <p className="text-gray-400 text-center">
                © 2024 Magazine. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListDetailPage;