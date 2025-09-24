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
        <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              {/* Top 5 Leadership Photos */}
              <div className="flex justify-center mb-8">
                <div className="grid grid-cols-5 gap-4">
                  {listData.entries?.slice(0, 5).map((entry, index) => (
                    <div key={entry.id || index} className="text-center group">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white mb-2 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {entry.name?.charAt(0) || index + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom 5 Leadership Photos */}
              <div className="flex justify-center mb-12">
                <div className="grid grid-cols-5 gap-4">
                  {listData.entries?.slice(5, 10).map((entry, index) => (
                    <div key={entry.id || index} className="text-center group">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white mb-2 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {entry.name?.charAt(0) || index + 6}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Title Section */}
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl font-bold">Forbes</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                  {listData.title?.replace('2025', '') || 'Sustainability Leaders'}
                </h1>
                <div className="text-2xl md:text-3xl font-light opacity-90 mb-6">
                  2025
                </div>
                <div className="flex items-center justify-center gap-2 text-sm opacity-75">
                  <div className="w-8 h-px bg-white/50"></div>
                  <span>MIDDLE EAST</span>
                  <div className="w-8 h-px bg-white/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Introduction Text */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">About This List</h2>
              </div>

              <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                <p>
                  In the Middle East, sustainability continues to move from commitment to action as governments and companies align with global climate goals and national visions. From expanding renewable energy capacity and reducing carbon emissions to advancing sustainable finance, circular economy initiatives, and adopting low-carbon manufacturing, the region is embedding sustainability in its long-term strategies. These efforts are reshaping industries and positioning the region as an active contributor to the global transition toward a more resilient future.
                </p>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <p className="font-semibold text-green-900 mb-2">This year's highlights:</p>
                  <p className="text-green-800">
                    This year's Sustainability Leaders 2025 list highlights 126 executives driving sustainability and impact in the region's largest companies across 15 industries: banks, energy and utilities, food and agriculture, investment and holding companies, financial services, family businesses, healthcare, manufacturing and industrials, oil and gas, real estate and construction, renewable energy, telecom, transport and logistics, travel and tourism, and waste management.
                  </p>
                </div>

                <p>
                  The U.A.E. is home to 67 entries, followed by Saudi Arabia with 23, and Egypt with 12. The list features CEOs, chairpersons, and chief sustainability officers.
                </p>
              </div>
            </div>
          </div>

          {/* Leadership Grid */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Top Leadership</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {listData.entries?.slice(0, 10).map((entry, index) => (
                  <div key={entry.id || index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="relative mb-4">
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                        <span className="text-gray-600 text-3xl font-bold">
                          {entry.name?.charAt(0) || index + 1}
                        </span>
                      </div>
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{entry.name}</h3>
                    <p className="text-sm text-blue-600 mb-1 font-medium">{entry.company}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">{entry.designation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Complete Entries List */}
          <div className="mb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Complete List</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {listData.entries?.slice(10).map((entry, index) => (
                  <div key={entry.id || index} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 group">
                    <div className="relative">
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 text-2xl font-bold">
                          {entry.name?.charAt(0) || index + 11}
                        </span>
                      </div>
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg">
                        {index + 11}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{entry.name}</h3>
                      <p className="text-sm text-blue-600 mb-2 font-medium">{entry.company}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{entry.designation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Methodology Section */}
          <div className="mb-16 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-8 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Methodology</h2>
            </div>
            <div className="space-y-6 text-lg leading-relaxed text-gray-700">
              <p className="text-lg leading-relaxed">
                For this list, we gathered information from questionnaires, sustainability or ESG reports, official disclosures, and recent news. The ranking was applied separately for each sector. Initiatives were horizontally compared and assessed while giving special weight to some sector-specific initiatives.
              </p>

              <div className="bg-white p-6 rounded-lg border-l-4 border-blue-600">
                <p className="font-semibold text-gray-900 mb-4">We considered:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sustainability or ESG reporting and the degree of transparency and clarity in reporting.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Green/sustainable financing, especially weighted in the banking, financial services, and investments categories.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Trends in greenhouse gas emissions across scopes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Waste handling, water, energy, and other resource consumption.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Reliance on or percentage change in renewable energy and energy-efficient technology.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>The size of the company in relation to its climate impact using proportional analysis.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sustainability-related initiatives in 2025 led by the leader.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Other roles that the leader has or has had.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </main>

        {/* Related Lists */}
        {relatedLists.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl font-bold">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Related Lists</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedLists.map((relatedList) => (
                    <Link
                      key={relatedList.id}
                      to={`/lists/${relatedList.slug}`}
                      className="group bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-white text-xs font-bold">
                              {relatedList.title?.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-purple-600 text-xs font-semibold mb-2 uppercase tracking-wide">Forbes Middle East</p>
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors leading-tight">
                            {relatedList.title}
                          </h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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