import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { DatePickerWithRange } from '../../components/ui/date-picker';
import { Badge } from '../../components/ui/badge';
import { RefreshCw, TrendingUp, Users, Eye, Clock, Download, Wifi, WifiOff } from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    fetchAnalyticsData();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [dateRange]);

  // WebSocket connection functions
  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Analytics WebSocket connected');
        setIsRealtimeConnected(true);
        reconnectAttempts.current = 0;

        // Subscribe to analytics channels
        wsRef.current.send(JSON.stringify({
          type: 'subscribe',
          channels: ['realtime', 'website', 'engagement']
        }));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeUpdate(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Analytics WebSocket disconnected');
        setIsRealtimeConnected(false);
        attemptReconnect();
      };

      wsRef.current.onerror = (error) => {
        console.error('Analytics WebSocket error:', error);
        setIsRealtimeConnected(false);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      attemptReconnect();
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsRealtimeConnected(false);
  };

  const attemptReconnect = () => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    reconnectAttempts.current++;
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, delay);
  };

  const handleRealtimeUpdate = (data) => {
    setLastUpdate(new Date());

    switch (data.type) {
      case 'initial_data':
        setDashboardData(prevData => ({
          ...prevData,
          realtime: data.data.realtime
        }));
        break;

      case 'data_update':
        setDashboardData(prevData => ({
          ...prevData,
          [data.dataType]: {
            ...prevData[data.dataType],
            ...data.data,
            lastUpdated: new Date()
          }
        }));
        break;

      case 'realtime_update':
        setDashboardData(prevData => ({
          ...prevData,
          realtime: {
            ...prevData.realtime,
            ...data.data
          }
        }));
        break;

      default:
        console.log('Unknown realtime update type:', data.type);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'json') => {
    try {
      const response = await fetch(`/api/analytics/report?format=${format}&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_report.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
        <Button onClick={fetchAnalyticsData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const { overview, traffic, engagement, content, realtime } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your website performance</p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              {isRealtimeConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {isRealtimeConnected ? 'Real-time connected' : 'Real-time disconnected'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-sm text-gray-500">
                Last update: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => exportReport('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportReport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(overview.avgSessionDuration / 60)}m {Math.round(overview.avgSessionDuration % 60)}s
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalEngagementScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={Object.entries(traffic.devices).map(([device, count]) => ({ device, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="device" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(engagement).map(([type, count]) => ({ type, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{content.articles?.totalViews || 0}</div>
                  <div className="text-sm text-gray-600">Article Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{content.videos?.totalViews || 0}</div>
                  <div className="text-sm text-gray-600">Video Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{content.events?.totalInteractions || 0}</div>
                  <div className="text-sm text-gray-600">Event Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{content.flipbooks?.totalInteractions || 0}</div>
                  <div className="text-sm text-gray-600">Flipbook Interactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{content.downloads?.totalInteractions || 0}</div>
                  <div className="text-sm text-gray-600">Download Interactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(traffic.devices).map(([device, count]) => ({ name: device, value: count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(traffic.devices).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {traffic.geography.slice(0, 10).map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{country.country || 'Unknown'}</span>
                      </div>
                      <span className="text-sm text-gray-600">{country.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {traffic.referrers.slice(0, 10).map((referrer, index) => (
                  <div key={referrer.domain} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{referrer.domain || 'Direct'}</span>
                    </div>
                    <span className="text-sm text-gray-600">{referrer.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Types */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Types</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(engagement).map(([type, count]) => ({ type, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Interactions</span>
                    <span className="font-bold">{overview.totalInteractions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unique Users</span>
                    <span className="font-bold">{overview.uniqueUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Engagement Score</span>
                    <span className="font-bold">{overview.avgEngagementScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Rate</span>
                    <span className="font-bold">
                      {overview.totalSessions > 0
                        ? ((overview.totalInteractions / overview.totalSessions) * 100).toFixed(2)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Articles', views: content.articles?.totalViews || 0, engagement: content.articles?.totalEngagement || 0 },
                      { name: 'Videos', views: content.videos?.totalViews || 0, engagement: content.videos?.totalEngagement || 0 },
                      { name: 'Events', views: content.events?.totalInteractions || 0, engagement: 0 },
                      { name: 'Flipbooks', views: content.flipbooks?.totalInteractions || 0, engagement: 0 },
                      { name: 'Downloads', views: content.downloads?.totalInteractions || 0, engagement: 0 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" name="Views/Interactions" />
                    <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Articles</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Views: {content.articles?.totalViews?.toLocaleString() || 0}</div>
                      <div>Avg Reading Time: {Math.round((content.articles?.avgReadingTime || 0) / 60)}m</div>
                      <div>Engagement: {content.articles?.totalEngagement?.toLocaleString() || 0}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Videos</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Views: {content.videos?.totalViews?.toLocaleString() || 0}</div>
                      <div>Avg Watch Time: {Math.round((content.videos?.avgWatchTime || 0) / 60)}m</div>
                      <div>Engagement: {content.videos?.totalEngagement?.toLocaleString() || 0}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <p className="text-sm text-gray-600">Currently online</p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {dashboardData?.realtime?.activeUsers || 0}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Real-time user count
                </p>
              </CardContent>
            </Card>

            {/* Real-time Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <p className="text-sm text-gray-600">Last 5 minutes</p>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(dashboardData?.realtime?.recentEvents?.length || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Events tracked
                </p>
              </CardContent>
            </Card>

            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle>Connection Status</CardTitle>
                <p className="text-sm text-gray-600">WebSocket status</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {isRealtimeConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {isRealtimeConnected ? 'Receiving live updates' : 'Attempting to reconnect...'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Website Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Website Activity</CardTitle>
                <p className="text-sm text-gray-600">Last 5 minutes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.realtime?.website && Object.entries(dashboardData.realtime.website).map(([eventType, count]) => (
                    <div key={eventType} className="flex justify-between items-center">
                      <span className="capitalize">{eventType.replace('_', ' ')}</span>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {(!dashboardData?.realtime?.website || Object.keys(dashboardData.realtime.website).length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      No recent website activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Engagement</CardTitle>
                <p className="text-sm text-gray-600">Last 5 minutes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.realtime?.engagement && Object.entries(dashboardData.realtime.engagement).map(([eventType, count]) => (
                    <div key={eventType} className="flex justify-between items-center">
                      <span className="capitalize">{eventType.replace('_', ' ')}</span>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                  {(!dashboardData?.realtime?.engagement || Object.keys(dashboardData.realtime.engagement).length === 0) && (
                    <div className="text-center text-gray-500 py-4">
                      No recent engagement activity
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events Feed</CardTitle>
              <p className="text-sm text-gray-600">Live event stream</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {dashboardData?.realtime?.recentEvents && dashboardData.realtime.recentEvents.length > 0 ? (
                  dashboardData.realtime.recentEvents.slice(0, 10).map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <span className="font-medium capitalize">{event.type?.replace('_', ' ') || 'Unknown'}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {event.sessionId ? `Session: ${event.sessionId.substring(0, 8)}...` : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp || Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                      📊
                    </div>
                    <p>No recent events</p>
                    <p className="text-sm">Events will appear here as they happen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Updates Indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isRealtimeConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isRealtimeConnected
                    ? 'Live data updates every 30 seconds'
                    : 'Attempting to reconnect...'}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;