import React, { useEffect, useState, useCallback } from 'react';
import './TelegramNewsPage.css';

interface TelegramMessage {
    id: number;
    chatId: number;
    chatTitle: string;
    messageId: number;
    text: string;
    senderName: string;
    senderUsername: string;
    receivedAt: string;
    messageDate: string;
}

interface TelegramChannel {
    id: number;
    channelName: string;
    description?: string;
    active: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

const TelegramNewsPage: React.FC = () => {
    const [messages, setMessages] = useState<TelegramMessage[]>([]);
    const [channels, setChannels] = useState<TelegramChannel[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [newChannelInput, setNewChannelInput] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    const fetchMessages = useCallback(async (pageNum: number) => {
        try {
            setLoading(true);
            // Add timestamp to prevent caching
            const response = await fetch(`/api/telegram/messages?page=${pageNum}&size=20&_t=${new Date().getTime()}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data: PageResponse<TelegramMessage> = await response.json();
            setMessages(data.content);
            setTotalPages(data.totalPages);
            setPage(data.number);
            setLoading(false);
            setIsRefreshing(false);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await fetch('/api/telegram/channels');
            if (response.ok) {
                const data = await response.json();
                setChannels(data);
            }
        } catch (err) {
            console.error('Error fetching channels:', err);
        }
    };

    useEffect(() => {
        fetchMessages(0);
        fetchChannels();
    }, [fetchMessages]);

    // Auto refresh every minute
    useEffect(() => {
        const timer = setInterval(() => {
            // Refresh current page
            fetchMessages(page);
        }, 60000);

        return () => clearInterval(timer);
    }, [fetchMessages, page]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchMessages(newPage);
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        fetchMessages(0); // Refresh goes to first page usually
        fetchChannels();
    };

    const handleAddChannel = async () => {
        if (!newChannelInput.trim()) return;
        
        try {
            const response = await fetch(`/api/telegram/channels?channelName=${encodeURIComponent(newChannelInput.trim())}`, {
                method: 'POST'
            });
            if (response.ok) {
                setNewChannelInput('');
                fetchChannels();
                // Optionally refresh messages if scraping happens immediately, but usually it takes time.
                alert('频道添加成功，后台将开始抓取消息 (OKX公告请直接输入 "OKX公告")');
            } else {
                alert('添加失败');
            }
        } catch (err) {
            console.error('Error adding channel:', err);
            alert('添加失败');
        }
    };

    const handleRemoveChannel = async (channelName: string) => {
        if (!window.confirm(`确定要删除频道 "${channelName}" 吗?`)) return;

        try {
            const response = await fetch(`/api/telegram/channels?channelName=${encodeURIComponent(channelName)}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchChannels();
            }
        } catch (err) {
            console.error('Error removing channel:', err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOkxChannel = (title: string) => {
        return title && (title.toLowerCase().includes('okx') || title.includes('欧易'));
    };

    const cleanMessageText = (html: string) => {
        if (!html) return '';
        // Remove "原文链接" and the link following it, including preceding line breaks
        let cleaned = html.replace(/(<br\s*\/?>\s*)*原文链接：<a[^>]*>.*?<\/a>/gi, '');
        // Replace all remaining <br> tags with spaces to compact the text
        cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
        // Remove excessive spaces that might have been created
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        return cleaned;
    };

    return (
        <div className="telegram-news-page">
            <div className="news-header">
                <div className="header-left">
                    <h1>实时币圈资讯</h1>
                    <button 
                        className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
                        onClick={handleManualRefresh}
                        title="手动刷新"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                            <path d="M23 4v6h-6"></path>
                            <path d="M1 20v-6h6"></path>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                        </svg>
                    </button>
                </div>
                
                <div className="channel-management">
                    <div className="add-channel">
                        <input 
                            type="text" 
                            placeholder="输入频道ID (如 jinse2017)" 
                            value={newChannelInput}
                            onChange={(e) => setNewChannelInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddChannel()}
                        />
                        <button onClick={handleAddChannel}>添加频道</button>
                    </div>
                </div>
            </div>

            <div className="active-channels">
                <span className="label">已订阅:</span>
                {channels.map(ch => (
                    <span key={ch.id} className="channel-tag">
                        {ch.channelName}
                        <button className="remove-btn" onClick={() => handleRemoveChannel(ch.channelName)}>×</button>
                    </span>
                ))}
            </div>
            
            {loading && messages.length === 0 ? (
                <div className="loading">正在加载消息...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <>
                    <div className="messages-list-view">
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                暂无消息。请添加频道开始订阅。
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="message-row">
                                    <div className="row-meta">
                                        <span className={`channel-badge ${isOkxChannel(msg.chatTitle) ? 'okx' : ''}`}>
                                            {msg.chatTitle}
                                        </span>
                                        <span className="time-badge">
                                            {formatDate(msg.receivedAt)}
                                        </span>
                                    </div>
                                    <div className="row-content">
                                        <div 
                                            className="message-text"
                                            dangerouslySetInnerHTML={{ __html: cleanMessageText(msg.text) }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                disabled={page === 0} 
                                onClick={() => handlePageChange(page - 1)}
                            >
                                上一页
                            </button>
                            <span className="page-info">
                                第 {page + 1} / {totalPages} 页
                            </span>
                            <button 
                                disabled={page >= totalPages - 1} 
                                onClick={() => handlePageChange(page + 1)}
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TelegramNewsPage;
