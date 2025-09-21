import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VideoArticleManagement from './VideoArticleManagement';
import CreateVideoArticle from './CreateVideoArticle';
import EditVideoArticle from './EditVideoArticle';

const VideoArticleRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<VideoArticleManagement />} />
      <Route path="/create" element={<CreateVideoArticle />} />
      <Route path="/edit/:id" element={<EditVideoArticle />} />
    </Routes>
  );
};

export default VideoArticleRoutes;