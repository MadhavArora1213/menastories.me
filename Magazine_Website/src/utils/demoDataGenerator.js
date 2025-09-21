// Demo Data Generator for User Activity Tracking
import { userActivityTracker } from './userActivityTracker';

export const generateDemoData = (userId) => {
  // Sample articles data
  const sampleArticles = [
    { id: '1', title: 'The Future of Technology in 2025', readTime: 5 },
    { id: '2', title: 'Climate Change Solutions', readTime: 8 },
    { id: '3', title: 'Healthy Living Tips', readTime: 3 },
    { id: '4', title: 'Business Innovation Strategies', readTime: 6 },
    { id: '5', title: 'Travel Destinations Guide', readTime: 4 },
    { id: '6', title: 'Cooking Masterclass', readTime: 7 },
    { id: '7', title: 'Fitness and Wellness', readTime: 5 },
    { id: '8', title: 'Digital Marketing Trends', readTime: 6 }
  ];

  // Generate reading history
  const readingHistory = sampleArticles.slice(0, 5);
  readingHistory.forEach((article, index) => {
    const daysAgo = Math.floor(Math.random() * 7);
    const readDate = new Date();
    readDate.setDate(readDate.getDate() - daysAgo);

    // Override the trackArticleRead to use custom date
    const currentStats = userActivityTracker.getUserStats(userId);
    const newArticle = {
      id: article.id,
      title: article.title,
      readDate: readDate.toISOString(),
      readTime: article.readTime
    };

    const recentArticles = JSON.parse(localStorage.getItem(`user_${userId}_recent_articles`) || '[]');
    recentArticles.unshift(newArticle);
    localStorage.setItem(`user_${userId}_recent_articles`, JSON.stringify(recentArticles.slice(0, 10)));

    // Update stats
    const newCount = currentStats.articlesRead + 1;
    const newTime = currentStats.readingTime + article.readTime;
    localStorage.setItem(`user_${userId}_articles_read`, newCount.toString());
    localStorage.setItem(`user_${userId}_reading_time`, newTime.toString());
  });

  // Generate saved articles
  const savedArticles = sampleArticles.slice(2, 6);
  savedArticles.forEach((article, index) => {
    const savedDate = new Date();
    savedDate.setDate(savedDate.getDate() - Math.floor(Math.random() * 10));

    const newArticle = {
      id: article.id,
      title: article.title,
      savedDate: savedDate.toISOString(),
      url: `/articles/${article.id}`
    };

    const savedList = JSON.parse(localStorage.getItem(`user_${userId}_saved_articles_list`) || '[]');
    savedList.unshift(newArticle);
    localStorage.setItem(`user_${userId}_saved_articles_list`, JSON.stringify(savedList.slice(0, 50)));

    const savedCount = parseInt(localStorage.getItem(`user_${userId}_saved_articles`) || '0');
    localStorage.setItem(`user_${userId}_saved_articles`, (savedCount + 1).toString());
  });

  // Set a good daily streak
  localStorage.setItem(`user_${userId}_daily_streak`, '5');

  // Set last active
  localStorage.setItem(`user_${userId}_last_active`, new Date().toISOString());

  console.log('Demo data generated for user:', userId);
};

// Function to check if demo data exists
export const hasDemoData = (userId) => {
  const articlesRead = parseInt(localStorage.getItem(`user_${userId}_articles_read`) || '0');
  return articlesRead > 0;
};

// Function to clear demo data
export const clearDemoData = (userId) => {
  localStorage.removeItem(`user_${userId}_articles_read`);
  localStorage.removeItem(`user_${userId}_daily_streak`);
  localStorage.removeItem(`user_${userId}_saved_articles`);
  localStorage.removeItem(`user_${userId}_reading_time`);
  localStorage.removeItem(`user_${userId}_last_active`);
  localStorage.removeItem(`user_${userId}_recent_articles`);
  localStorage.removeItem(`user_${userId}_saved_articles_list`);
  console.log('Demo data cleared for user:', userId);
};