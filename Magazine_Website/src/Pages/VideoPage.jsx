import React from 'react';
import { useParams } from 'react-router-dom';
import VideoArticleRenderer from '../Components/VideoArticleRenderer';

const VideoPage = () => {
  const { slug } = useParams();

  // The VideoArticleRenderer component handles all the data fetching and state management
  // We just need to render it with the slug from the URL params
  return <VideoArticleRenderer />;
};

export default VideoPage;