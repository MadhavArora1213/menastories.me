import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, RefreshCw, ExternalLink, Users, Building2, MapPin, Award, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
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
      <div className="min-h-screen bg-black">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-6"></div>
          <p className="text-gray-300 text-lg">Loading list details...</p>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
        <title>{listData.title} | Forbes Middle East</title>
        <meta name="description" content={listData.description || listData.metaDescription} />
        {listData.featuredImage && <meta property="og:image" content={listData.featuredImage} />}
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-black text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <div className="flex-shrink-0">
                  <span className="text-2xl font-bold">Forbes</span>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">HOME</a>
                  <a href="/list" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">LISTS</a>
                  <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">NEWS</a>
                  <a href="#" className="text-white hover:text-gray-300 px-3 py-2 text-sm font-medium">COMPANIES</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                </div>
                <span className="text-sm">Forbes Lists</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-600 to-green-900 relative">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              {/* Top 5 Leadership Photos */}
              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {listData.entries?.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white mb-2 mx-auto">
                        <img
                          src={entry.image || '/api/placeholder/96/96'}
                          alt={entry.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/96/96';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom 5 Leadership Photos */}
              <div className="flex justify-center mb-12">
                <div className="grid grid-cols-5 gap-4">
                  {listData.entries?.slice(5, 10).map((entry, index) => (
                    <div key={entry.id} className="text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white mb-2 mx-auto">
                        <img
                          src={entry.image || '/api/placeholder/96/96'}
                          alt={entry.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/96/96';
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-xl font-bold">Forbes</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {listData.title?.replace('2025', '') || 'Sustainability Leaders'}
                </h1>
                <div className="text-2xl md:text-3xl font-light opacity-90">
                  2025
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction Text */}
          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-lg leading-relaxed text-gray-700 mb-8">
              In the Middle East, sustainability continues to move from commitment to action as governments and companies align with global climate goals and national visions. From expanding renewable energy capacity and reducing carbon emissions to advancing sustainable finance, circular economy initiatives, and adopting low-carbon manufacturing, the region is embedding sustainability in its long-term strategies. These efforts are reshaping industries and positioning the region as an active contributor to the global transition toward a more resilient future.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 mb-8">
              This year's Sustainability Leaders 2025 list highlights 126 executives driving sustainability and impact in the region's largest companies across 15 industries: banks, energy and utilities, food and agriculture, investment and holding companies, financial services, family businesses, healthcare, manufacturing and industrials, oil and gas, real estate and construction, renewable energy, telecom, transport and logistics, travel and tourism, and waste management.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              The U.A.E. is home to 67 entries, followed by Saudi Arabia with 23, and Egypt with 12. The list features CEOs, chairpersons, and chief sustainability officers.
            </p>
          </div>

          {/* Leadership Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {listData.entries?.slice(0, 10).map((entry, index) => (
                <div key={entry.id} className="text-center">
                  <div className="relative mb-4">
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={entry.image || '/api/placeholder/300/300'}
                        alt={entry.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/300';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{entry.name}</h3>
                  <p className="text-sm text-blue-600 mb-1">{entry.company}</p>
                  <p className="text-xs text-gray-500">{entry.designation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Entries List */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {listData.entries?.slice(10).map((entry, index) => (
                <div key={entry.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="w-full aspect-square bg-gray-100">
                      <img
                        src={entry.image || '/api/placeholder/300/300'}
                        alt={entry.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/300';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 11}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-gray-900 mb-1">{entry.name}</h3>
                    <p className="text-xs text-blue-600 mb-1">{entry.company}</p>
                    <p className="text-xs text-gray-500">{entry.designation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodology Section */}
          <div className="mb-16 bg-red-600 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Methodology</h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>For this list, we gathered information from questionnaires, sustainability or ESG reports, official disclosures, and recent news. The ranking was applied separately for each sector. Initiatives were horizontally compared and assessed while giving special weight to some sector-specific initiatives.</p>
              
              <p className="font-semibold">We considered:</p>
              <ul className="space-y-2 ml-6">
                <li>• Sustainability or ESG reporting and the degree of transparency and clarity in reporting.</li>
                <li>• Green/sustainable financing, especially weighted in the banking, financial services, and investments categories.</li>
                <li>• Trends in greenhouse gas emissions across scopes.</li>
                <li>• Waste handling, water, energy, and other resource consumption.</li>
                <li>• Reliance on or percentage change in renewable energy and energy-efficient technology.</li>
                <li>• The size of the company in relation to its climate impact using proportional analysis.</li>
                <li>• Sustainability-related initiatives in 2025 led by the leader.</li>
                <li>• Other roles that the leader has or has had.</li>
              </ul>
            </div>
          </div>

          {/* Related Lists */}
          {relatedLists.length > 0 && (
            <div className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-4">RELATED LISTS</h3>
              <div className="space-y-8">
                {relatedLists.map((relatedList) => (
                  <Link
                    key={relatedList.id}
                    to={`/lists/${relatedList.slug}`}
                    className="flex items-center gap-6 group hover:bg-gray-50 p-4 rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden">
                        <img
                          src={relatedList.featuredImage || '/api/placeholder/96/96'}
                          alt={relatedList.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/96/96';
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <p className="text-blue-600 text-sm font-semibold mb-1">Forbes Middle East</p>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {relatedList.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400">© 2025 Forbes</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default ListDetailPage;