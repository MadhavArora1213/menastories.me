// User Activity Tracking Utility
import React from 'react';
export const userActivityTracker = {
  // Track article reading
  trackArticleRead: (userId, articleId, articleTitle, readTime = 0) => {
    try {
      // Update articles read count
      const currentCount = parseInt(localStorage.getItem(`user_${userId}_articles_read`) || '0');
      localStorage.setItem(`user_${userId}_articles_read`, currentCount + 1);

      // Update reading time
      const currentTime = parseInt(localStorage.getItem(`user_${userId}_reading_time`) || '0');
      localStorage.setItem(`user_${userId}_reading_time`, currentTime + readTime);

      // Update daily streak
      updateDailyStreak(userId);

      // Add to recent articles
      const recentArticles = JSON.parse(localStorage.getItem(`user_${userId}_recent_articles`) || '[]');
      const newArticle = {
        id: articleId,
        title: articleTitle,
        readDate: new Date().toISOString(),
        readTime: readTime
      };

      // Remove if already exists and add to beginning
      const filtered = recentArticles.filter(article => article.id !== articleId);
      filtered.unshift(newArticle);

      // Keep only last 10
      localStorage.setItem(`user_${userId}_recent_articles`, JSON.stringify(filtered.slice(0, 10)));

      // Update last active
      localStorage.setItem(`user_${userId}_last_active`, new Date().toISOString());

    } catch (error) {
      console.error('Error tracking article read:', error);
    }
  },

  // Track article save/unsave
  trackArticleSave: (userId, articleId, articleTitle, isSaving = true) => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem(`user_${userId}_saved_articles_list`) || '[]');
      const savedCount = parseInt(localStorage.getItem(`user_${userId}_saved_articles`) || '0');

      if (isSaving) {
        // Check if already saved
        if (!savedArticles.find(article => article.id === articleId)) {
          const newArticle = {
            id: articleId,
            title: articleTitle,
            savedDate: new Date().toISOString(),
            url: `/articles/${articleId}`
          };
          savedArticles.unshift(newArticle);
          localStorage.setItem(`user_${userId}_saved_articles_list`, JSON.stringify(savedArticles.slice(0, 50)));
          localStorage.setItem(`user_${userId}_saved_articles`, savedCount + 1);
        }
      } else {
        // Remove from saved
        const filtered = savedArticles.filter(article => article.id !== articleId);
        localStorage.setItem(`user_${userId}_saved_articles_list`, JSON.stringify(filtered));
        localStorage.setItem(`user_${userId}_saved_articles`, Math.max(0, savedCount - 1));
      }
    } catch (error) {
      console.error('Error tracking article save:', error);
    }
  },

  // Get user stats
  getUserStats: (userId) => {
    try {
      return {
        articlesRead: parseInt(localStorage.getItem(`user_${userId}_articles_read`) || '0'),
        dailyStreak: parseInt(localStorage.getItem(`user_${userId}_daily_streak`) || '0'),
        savedArticles: parseInt(localStorage.getItem(`user_${userId}_saved_articles`) || '0'),
        readingTime: parseInt(localStorage.getItem(`user_${userId}_reading_time`) || '0'),
        lastActive: localStorage.getItem(`user_${userId}_last_active`),
        recentArticles: JSON.parse(localStorage.getItem(`user_${userId}_recent_articles`) || '[]'),
        savedArticlesList: JSON.parse(localStorage.getItem(`user_${userId}_saved_articles_list`) || '[]')
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        articlesRead: 0,
        dailyStreak: 0,
        savedArticles: 0,
        readingTime: 0,
        lastActive: null,
        recentArticles: [],
        savedArticlesList: []
      };
    }
  },

  // Check if article is saved
  isArticleSaved: (userId, articleId) => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem(`user_${userId}_saved_articles_list`) || '[]');
      return savedArticles.some(article => article.id === articleId);
    } catch (error) {
      console.error('Error checking if article is saved:', error);
      return false;
    }
  }
};

// Helper function to update daily streak
function updateDailyStreak(userId) {
  try {
    const lastActive = localStorage.getItem(`user_${userId}_last_active`);
    const currentStreak = parseInt(localStorage.getItem(`user_${userId}_daily_streak`) || '0');

    if (!lastActive) {
      // First time reading
      localStorage.setItem(`user_${userId}_daily_streak`, '1');
      return;
    }

    const lastActiveDate = new Date(lastActive);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if last active was yesterday or today
    const lastActiveDay = lastActiveDate.toDateString();
    const todayString = today.toDateString();
    const yesterdayString = yesterday.toDateString();

    if (lastActiveDay === todayString) {
      // Already read today, don't change streak
      return;
    } else if (lastActiveDay === yesterdayString) {
      // Read yesterday, increment streak
      localStorage.setItem(`user_${userId}_daily_streak`, (currentStreak + 1).toString());
    } else {
      // Streak broken, reset to 1
      localStorage.setItem(`user_${userId}_daily_streak`, '1');
    }
  } catch (error) {
    console.error('Error updating daily streak:', error);
  }
}

// React hook for using user activity tracker
export const useUserActivity = (userId) => {
  const [stats, setStats] = React.useState({});

  React.useEffect(() => {
    if (userId) {
      const userStats = userActivityTracker.getUserStats(userId);
      setStats(userStats);
    }
  }, [userId]);

  const trackArticleRead = (articleId, articleTitle, readTime = 0) => {
    userActivityTracker.trackArticleRead(userId, articleId, articleTitle, readTime);
    // Update local state
    setStats(prev => ({
      ...prev,
      articlesRead: prev.articlesRead + 1,
      readingTime: prev.readingTime + readTime
    }));
  };

  const trackArticleSave = (articleId, articleTitle, isSaving = true) => {
    userActivityTracker.trackArticleSave(userId, articleId, articleTitle, isSaving);
    // Update local state
    setStats(prev => ({
      ...prev,
      savedArticles: isSaving ? prev.savedArticles + 1 : Math.max(0, prev.savedArticles - 1)
    }));
  };

  const isArticleSaved = (articleId) => {
    return userActivityTracker.isArticleSaved(userId, articleId);
  };

  return {
    stats,
    trackArticleRead,
    trackArticleSave,
    isArticleSaved,
    refreshStats: () => setStats(userActivityTracker.getUserStats(userId))
  };
};