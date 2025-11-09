import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableDates, loadIndexData } from '@/lib/dataLoader';
import { fetchDayData } from '@/lib/api';
import { IndexData } from '@/types';
import { Calendar, MessageCircle, Image, Video, Music, Users, FileText, TrendingUp, Target } from 'lucide-react';
import ConversationSelector from '@/components/ConversationSelector';

interface DashboardStats {
  totalDays: number;
  totalConversations: number;
  totalMessages: number;
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
  totalAudio: number;
  dateRange: {
    start: string;
    end: string;
  };
  mostActiveDate: {
    date: string;
    messageCount: number;
  } | null;
}

interface DayActivity {
  date: string;
  messageCount: number;
  conversationCount: number;
  hasData: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [dayActivities, setDayActivities] = useState<DayActivity[]>([]);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [showConversationSelector, setShowConversationSelector] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load index data
        const index = await loadIndexData();
        setIndexData(index);

        // Get available dates
        const dates = await getAvailableDates();
        setAvailableDates(dates);

        if (dates.length === 0) {
          setLoading(false);
          return;
        }

        // Sort dates
        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

        // Calculate aggregate stats
        let totalConversations = new Set<string>();
        let totalMessages = 0;
        let totalImages = 0;
        let totalVideos = 0;
        let totalAudio = 0;
        let mostActiveDate: { date: string; messageCount: number } | null = null;
        const activities: DayActivity[] = [];

        // Load data for each date to calculate stats
        for (const date of sortedDates) {
          const dateStr = date.toISOString().split('T')[0];
          try {
            const dayData = await fetchDayData(dateStr, index);

            const messageCount = dayData.stats.messageCount;
            const conversationCount = dayData.conversations.length;

            activities.push({
              date: dateStr,
              messageCount,
              conversationCount,
              hasData: true,
            });

            totalMessages += messageCount;

            // Track unique conversations
            dayData.conversations.forEach(conv => {
              totalConversations.add(conv.id);

              // Count media types
              conv.messages.forEach(msg => {
                if (msg.media_locations && msg.media_locations.length > 0) {
                  if (msg.media_type === 'IMAGE' || msg.media_type === 'STICKER') {
                    totalImages += msg.media_locations.length;
                  } else if (msg.media_type === 'VIDEO') {
                    totalVideos += msg.media_locations.length;
                  } else if (msg.media_type === 'NOTE') {
                    totalAudio += msg.media_locations.length;
                  }
                }
              });
            });

            // Track most active date
            if (!mostActiveDate || messageCount > mostActiveDate.messageCount) {
              mostActiveDate = { date: dateStr, messageCount };
            }
          } catch (error) {
            console.error(`Failed to load data for ${dateStr}:`, error);
            activities.push({
              date: dateStr,
              messageCount: 0,
              conversationCount: 0,
              hasData: false,
            });
          }
        }

        setDayActivities(activities);

        const calculatedStats: DashboardStats = {
          totalDays: dates.length,
          totalConversations: totalConversations.size,
          totalMessages,
          totalMedia: totalImages + totalVideos + totalAudio,
          totalImages,
          totalVideos,
          totalAudio,
          dateRange: {
            start: sortedDates[0].toISOString().split('T')[0],
            end: sortedDates[sortedDates.length - 1].toISOString().split('T')[0],
          },
          mostActiveDate,
        };

        setStats(calculatedStats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="text-2xl text-accent mb-4">Loading Archive...</div>
          <div className="text-text-secondary">Analyzing your Snapchat data</div>
        </div>
      </div>
    );
  }

  if (!stats || availableDates.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">📸</div>
          <h1 className="text-2xl text-text-primary mb-4">No Snapchat Archive Found</h1>
          <p className="text-text-secondary mb-6">
            To use this viewer, place your Snapchat data export in the public folder.
          </p>
          <div className="text-left bg-bg-secondary p-4 rounded-lg">
            <p className="text-sm text-text-secondary mb-2">Your export should contain:</p>
            <ul className="text-sm text-text-tertiary space-y-1">
              <li>• An <code className="text-accent">index.json</code> file</li>
              <li>• A <code className="text-accent">days/</code> folder with daily data</li>
              <li>• A <code className="text-accent">bitmoji/</code> folder (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="bg-bg-secondary border-b border-border px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-accent mb-2">Snapchat Archive Dashboard</h1>
          <p className="text-text-secondary">
            {indexData?.account_owner ? `Archive for ${indexData.account_owner}` : 'Your personal Snapchat history'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Days */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="text-accent" size={24} />
              <span className="text-xs text-text-tertiary">DAYS</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.totalDays}</div>
            <div className="text-sm text-text-secondary">
              {formatDate(stats.dateRange.start)} - {formatDate(stats.dateRange.end)}
            </div>
          </div>

          {/* Total Conversations */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-accent" size={24} />
              <span className="text-xs text-text-tertiary">CONVERSATIONS</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">{stats.totalConversations}</div>
            <div className="text-sm text-text-secondary">Unique conversations</div>
          </div>

          {/* Total Messages */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="text-accent" size={24} />
              <span className="text-xs text-text-tertiary">MESSAGES</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {stats.totalMessages.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">Total messages sent & received</div>
          </div>

          {/* Total Media */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border hover:border-accent transition-colors">
            <div className="flex items-center justify-between mb-4">
              <FileText className="text-accent" size={24} />
              <span className="text-xs text-text-tertiary">MEDIA</span>
            </div>
            <div className="text-3xl font-bold text-text-primary mb-1">
              {stats.totalMedia.toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">
              {stats.totalImages} images • {stats.totalVideos} videos • {stats.totalAudio} audio
            </div>
          </div>
        </div>

        {/* Most Active Date */}
        {stats.mostActiveDate && (
          <div className="bg-bg-secondary rounded-lg p-6 border border-border mb-8">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="text-accent" size={24} />
              <h2 className="text-xl font-semibold text-text-primary">Most Active Day</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg text-text-primary">
                  {new Date(stats.mostActiveDate.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-sm text-text-secondary">
                  {stats.mostActiveDate.messageCount.toLocaleString()} messages
                </div>
              </div>
              <button
                onClick={() => navigate(`/day/${stats.mostActiveDate!.date}`)}
                className="px-4 py-2 bg-accent text-bg-primary rounded-lg hover:bg-accent/90 transition-colors"
              >
                View Day
              </button>
            </div>
          </div>
        )}

        {/* Calendar/Date Grid */}
        <div className="bg-bg-secondary rounded-lg p-6 border border-border">
          <h2 className="text-xl font-semibold text-text-primary mb-6">Available Dates</h2>
          <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-2">
            {dayActivities.map((activity) => (
              <button
                key={activity.date}
                onClick={() => navigate(`/day/${activity.date}`)}
                className={`
                  relative p-2 rounded text-center transition-all
                  ${activity.hasData
                    ? 'bg-bg-tertiary hover:bg-accent hover:text-bg-primary cursor-pointer'
                    : 'bg-bg-tertiary/30 cursor-not-allowed opacity-50'
                  }
                `}
                disabled={!activity.hasData}
                title={`${activity.date}: ${activity.messageCount} messages, ${activity.conversationCount} conversations`}
              >
                <div className="text-xs font-medium">
                  {new Date(activity.date).getDate()}
                </div>
                <div className="text-[10px] opacity-70">
                  {new Date(activity.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                {activity.messageCount > 0 && (
                  <div
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-accent rounded-full"
                    style={{
                      opacity: Math.min(activity.messageCount / 100, 1),
                      transform: `translateX(-50%) scale(${Math.min(activity.messageCount / 50, 2)})`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Focus on Conversation Section */}
        <div className="mt-8 bg-bg-secondary rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-accent" size={24} />
            <h2 className="text-xl font-semibold text-text-primary">Focus on Conversation</h2>
          </div>
          <p className="text-text-secondary mb-6">
            Follow a specific conversation across all dates. View the complete history with a participant or group,
            with navigation tailored to when that conversation was active.
          </p>
          <button
            onClick={() => setShowConversationSelector(true)}
            className="px-6 py-3 bg-accent text-bg-primary rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Select Conversation to Focus
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => navigate(`/day/${stats.dateRange.start}`)}
            className="px-6 py-3 bg-bg-secondary text-text-primary border border-border rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            Go to First Day
          </button>
          <button
            onClick={() => navigate(`/day/${stats.dateRange.end}`)}
            className="px-6 py-3 bg-bg-secondary text-text-primary border border-border rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            Go to Last Day
          </button>
        </div>
      </div>

      {/* Conversation Selector Modal */}
      {showConversationSelector && indexData && (
        <ConversationSelector
          indexData={indexData}
          onClose={() => setShowConversationSelector(false)}
        />
      )}
    </div>
  );
}