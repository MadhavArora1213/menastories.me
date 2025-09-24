import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Building2, MapPin, Calendar, Award, Users, ExternalLink, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import listService from '../services/listService';

const ListEntryDetailPage = () => {
  const { listSlug, entrySlug } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listData, setListData] = useState(null);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [relatedLists, setRelatedLists] = useState([]);

  useEffect(() => {
    fetchEntryData();
  }, [listSlug, entrySlug]);

  const fetchEntryData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch the specific list
      const listResponse = await listService.getList(listSlug);
      if (listResponse.success && listResponse.data) {
        setListData(listResponse.data);

        // Find the current entry
        const entryIndex = listResponse.data.entries?.findIndex(
          entry => entry.slug === entrySlug || entry.id?.toString() === entrySlug
        );

        if (entryIndex !== -1) {
          setCurrentEntry(listResponse.data.entries[entryIndex]);
          setCurrentIndex(entryIndex);

          // Fetch related lists
          const relatedResponse = await listService.getAllLists({
            limit: 6,
            status: 'published',
            category: listResponse.data.category,
            year: listResponse.data.year
          });

          if (relatedResponse.success && relatedResponse.data && relatedResponse.data.lists) {
            const related = relatedResponse.data.lists
              .filter(list => list.id !== listResponse.data.id)
              .slice(0, 3);
            setRelatedLists(related);
          }
        } else {
          setError('Entry not found');
        }
      } else {
        setError('List not found');
      }
    } catch (err) {
      console.error('Error fetching entry data:', err);
      setError('Failed to load entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToEntry = (direction) => {
    if (!listData?.entries) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : listData.entries.length - 1;
    } else {
      newIndex = currentIndex < listData.entries.length - 1 ? currentIndex + 1 : 0;
    }

    const newEntry = listData.entries[newIndex];
    navigate(`/lists/${listSlug}/${newEntry.slug || newEntry.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mb-6"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="bg-red-50 rounded-full p-6 mb-6">
            <svg className="h-16 w-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link
              to={`/lists/${listSlug}`}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentEntry) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="bg-gray-50 rounded-full p-6 mb-6">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 text-lg text-center max-w-md mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to={`/lists/${listSlug}`}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentEntry.name} | {listData?.title} | Forbes Middle East</title>
        <meta name="description" content={`${currentEntry.name} - ${currentEntry.designation} at ${currentEntry.company}. Featured in ${listData?.title}`} />
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

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/list" className="text-gray-600 hover:text-gray-900">Lists</Link>
              <span className="text-gray-400">/</span>
              <Link to={`/lists/${listSlug}`} className="text-gray-600 hover:text-gray-900 truncate">
                {listData?.title?.replace('2025', '') || 'List'}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium truncate">{currentEntry.name}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Arrows */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => navigateToEntry('prev')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">PROFILE</div>
              <div className="text-2xl font-bold text-gray-900">{currentIndex + 1} of {listData?.entries?.length || 0}</div>
            </div>

            <button
              onClick={() => navigateToEntry('next')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg">
                  <span className="text-gray-500 text-6xl font-bold">
                    {currentEntry.name?.charAt(0) || '?'}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                        {currentIndex + 1}
                      </div>
                      <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-1">{currentEntry.name}</h1>
                        <p className="text-xl text-red-600 font-semibold">{currentEntry.company}</p>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{currentEntry.designation}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Company Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-semibold text-gray-900">{currentEntry.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Designation</p>
                      <p className="font-semibold text-gray-900">{currentEntry.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Established</p>
                      <p className="font-semibold text-gray-900">{currentEntry.established || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Headquarters</p>
                      <p className="font-semibold text-gray-900">{currentEntry.headquarters || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed mb-6">
                {currentEntry.description || `${currentEntry.name} is a distinguished leader in sustainability, serving as ${currentEntry.designation} at ${currentEntry.company}. Their commitment to environmental stewardship and sustainable business practices has earned them recognition in the Middle East's premier sustainability leadership list.`}
              </p>

              {currentEntry.achievements && (
                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">Key Achievements</h3>
                  <p className="text-green-800">{currentEntry.achievements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Back to List */}
          <div className="text-center">
            <Link
              to={`/lists/${listSlug}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {listData?.title?.replace('2025', '') || 'List'}
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-12 mt-16">
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

export default ListEntryDetailPage;