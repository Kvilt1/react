import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndexData, IndexUser, IndexGroup } from '@/types';
import { getConversationStats } from '@/lib/api';
import { Search, MessageCircle, Users, Calendar } from 'lucide-react';

interface ConversationItem {
  id: string;
  name: string;
  type: 'dm' | 'group';
  avatar: string | null;
  subtitle: string;
  totalMessages: number;
  totalMedia: number;
  firstMessage: string | null;
  lastMessage: string | null;
  activeDays: number;
  isLoading: boolean;
}

interface ConversationSelectorProps {
  indexData: IndexData;
  onClose: () => void;
}

export default function ConversationSelector({
  indexData,
  onClose,
}: ConversationSelectorProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buildConversationList = async () => {
      setLoading(true);

      const conversationItems: ConversationItem[] = [];

      // Add individual conversations (DMs)
      for (const user of indexData.users) {
        const conversationId = user.username;

        const item: ConversationItem = {
          id: conversationId,
          name: user.display_name === 'NOT FOUND IN FRIENDS LIST'
            ? user.username
            : user.display_name || user.username,
          type: 'dm',
          avatar: user.bitmoji || null,
          subtitle: user.username,
          totalMessages: 0,
          totalMedia: 0,
          firstMessage: null,
          lastMessage: null,
          activeDays: 0,
          isLoading: true,
        };

        conversationItems.push(item);

        // Load stats for this conversation
        getConversationStats(conversationId, indexData)
          .then(stats => {
            setConversations(prevConversations =>
              prevConversations.map(conv =>
                conv.id === conversationId
                  ? { ...conv, ...stats, isLoading: false }
                  : conv
              )
            );
          })
          .catch(error => {
            console.error(`Failed to load stats for ${conversationId}:`, error);
            setConversations(prevConversations =>
              prevConversations.map(conv =>
                conv.id === conversationId
                  ? { ...conv, isLoading: false }
                  : conv
              )
            );
          });
      }

      // Add group conversations
      for (const group of indexData.groups) {
        const conversationId = group.group_id;

        const item: ConversationItem = {
          id: conversationId,
          name: group.name,
          type: 'group',
          avatar: null, // Groups don't have avatars
          subtitle: `${group.members.length} members`,
          totalMessages: 0,
          totalMedia: 0,
          firstMessage: null,
          lastMessage: null,
          activeDays: 0,
          isLoading: true,
        };

        conversationItems.push(item);

        // Load stats for this group
        getConversationStats(conversationId, indexData)
          .then(stats => {
            setConversations(prevConversations =>
              prevConversations.map(conv =>
                conv.id === conversationId
                  ? { ...conv, ...stats, isLoading: false }
                  : conv
              )
            );
          })
          .catch(error => {
            console.error(`Failed to load stats for ${conversationId}:`, error);
            setConversations(prevConversations =>
              prevConversations.map(conv =>
                conv.id === conversationId
                  ? { ...conv, isLoading: false }
                  : conv
              )
            );
          });
      }

      setConversations(conversationItems);
      setLoading(false);
    };

    buildConversationList();
  }, [indexData]);

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter(conv =>
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(conv => conv.totalMessages > 0) // Only show conversations with activity
    .sort((a, b) => b.totalMessages - a.totalMessages); // Sort by message count descending

  const handleConversationSelect = (conversationId: string) => {
    navigate(`/conversation/${conversationId}`);
    onClose();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-secondary border border-border rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-accent">Focus on Conversation</h2>
            <p className="text-text-secondary mt-1">Select a conversation to view its complete history</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-hover-bg rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-text-secondary">Loading conversations...</div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-text-secondary">
                {searchQuery ? 'No conversations match your search' : 'No conversations found with activity'}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className="p-4 bg-bg-tertiary border border-border rounded-lg hover:border-accent hover:bg-hover-bg transition-all text-left group"
                  disabled={conversation.isLoading}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="w-12 h-12 rounded-full bg-bg-primary flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        {conversation.type === 'group' ? (
                          <Users className="w-6 h-6 text-accent" />
                        ) : (
                          <span className="text-accent text-lg font-semibold">
                            {conversation.name[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Name and subtitle */}
                    <div className="flex-1 min-w-0">
                      <div className="text-text-primary font-semibold truncate group-hover:text-accent transition-colors">
                        {conversation.name}
                      </div>
                      <div className="text-text-tertiary text-sm truncate">
                        {conversation.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  {conversation.isLoading ? (
                    <div className="text-text-tertiary text-sm">Loading stats...</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-text-secondary text-sm">
                          <MessageCircle className="w-4 h-4" />
                          <span>{conversation.totalMessages.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-secondary text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{conversation.activeDays} days</span>
                        </div>
                      </div>

                      {conversation.firstMessage && conversation.lastMessage && (
                        <div className="text-text-tertiary text-xs">
                          {formatDate(conversation.firstMessage)} - {formatDate(conversation.lastMessage)}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border text-center">
          <div className="text-text-tertiary text-sm">
            Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} with activity
          </div>
        </div>
      </div>
    </div>
  );
}