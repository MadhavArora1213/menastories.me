import React from 'react';
import HeroSlider from '../Components/HeroSlider';
import BreakingNewsTicker from '../Components/BreakingNewsTicker';
import FeaturedGrid from '../Components/FeaturedGrid';
import NewsContent from '../Components/NewsContent';
import CategoryArticles from '../Components/CategoryArticles';
import SuggestedReads from '../Components/SuggestedReads';
import SEO from '../Components/SEO';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Home"
        description="Welcome to Premium Magazine Website - your ultimate destination for the latest articles, entertainment news, lifestyle content, and regional stories. Discover exclusive interviews, trending topics, and in-depth coverage."
        keywords="home, magazine, latest news, entertainment, lifestyle, regional content, trending topics, exclusive articles"
        url="/"
        type="website"
      />
      <BreakingNewsTicker />

      {/* Hero Slider with Top Stories */}
      <HeroSlider />

      {/* Featured Articles Grid */}
      <FeaturedGrid />

      {/* Latest News Content Section */}
      <NewsContent />

      {/* Category Articles with Headings and Video Articles */}
      {/* <CategoryArticles /> */}

      {/* Suggested Reads Algorithm */}
      <SuggestedReads />
    </div>
  );
};

export default HomePage;
