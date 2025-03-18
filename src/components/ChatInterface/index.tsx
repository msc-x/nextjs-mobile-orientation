import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar, Container, Paper, Button, Link } from '@mui/material';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import ApiKeyInput from '../ApiKeyInput';
import ChatSidebar from '../ChatSidebar';
import { ChatMessage as ChatMessageType, createChatCompletion, InsufficientCreditsError } from '@/utils/openRouterApi';
import AddIcon from '@mui/icons-material/Add';

const ChatInterface: React.FC = () => {
  // 保存API Key
  const [apiKey, setApiKey] = useState<string>('');
  
  // 消息列表
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  
  // 当前正在流式生成的消息内容
  const [streamingContent, setStreamingContent] = useState<string>('');
  
  // 是否正在加载中
  const [isLoading, setIsLoading] = useState(false);
  
  // 是否在流式生成内容中
  const [isStreaming, setIsStreaming] = useState(false);
  
  // 错误消息
  const [error, setError] = useState<string | null>(null);
  
  // 用于滚动到底部的引用
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 聊天历史
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  
  // 当前聊天ID
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);

  // 余额不足错误
  const [creditsError, setCreditsError] = useState(false);
  
  // 处理API Key变更
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    setCreditsError(false); // 重置余额错误状态
  };

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    // 添加用户消息到列表
    const userMessage: ChatMessageType = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 如果是新对话的第一条消息，添加到聊天历史
    if (messages.length === 0) {
      // 截取前30个字符作为聊天标题
      const chatTitle = content.length > 30 ? content.substring(0, 27) + '...' : content;
      setChatHistory(prev => [...prev, chatTitle]);
    }
    
    // 重置流式内容和状态
    setStreamingContent('');
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setCreditsError(false);

    try {
      // 调用API进行流式响应
      await createChatCompletion(
        apiKey,
        updatedMessages,
        (content, done) => {
          setStreamingContent(content);
          if (done) {
            setIsStreaming(false);
            setIsLoading(false);
            // 响应完成后，添加助手消息到列表
            setMessages(prev => [
              ...prev, 
              { role: 'assistant', content }
            ]);
          }
        }
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setIsStreaming(false);
      setIsLoading(false);
      
      // 处理余额不足错误
      if (err instanceof InsufficientCreditsError) {
        setCreditsError(true);
        setError('OpenRouter账户余额不足，需要充值才能继续使用。');
      } else {
        setError(err instanceof Error ? err.message : '发送消息时出错，请重试');
      }
    }
  };

  // 开始新对话
  const handleNewChat = () => {
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setIsLoading(false);
    setError(null);
    setCreditsError(false);
    setCurrentChatId(undefined);
  };

  // 清除所有对话
  const handleClearConversations = () => {
    setChatHistory([]);
    handleNewChat();
  };

  // 消息列表更新时滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // 可选：从localStorage加载API Key
  /*
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);
  */

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="h-screen"
    >
      {/* 聊天侧边栏 */}
      <ChatSidebar 
        onStartNewChat={handleNewChat}
        currentChatId={currentChatId}
        chatHistory={chatHistory}
        onClearConversations={handleClearConversations}
      />
      
      {/* 主聊天区域 */}
      <Box 
        sx={{ 
          flexGrow: 1,
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
          position: 'relative', // 添加相对定位，作为绝对定位的参考
          width: '100%',
          maxWidth: '100%', // 确保不超出布局
          overflowX: 'hidden', // 强制禁止水平滚动
        }}
      >
        {/* 消息列表区 - 只有这里应该有滚动条，但我们隐藏了它 */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            overflowX: 'hidden', // 强制禁止水平滚动
            pb: { 
              xs: 'calc(10vh + 80px)', // 移动设备上底部内边距为 10vh + 额外空间
              sm: '100px' // 桌面端保持100px底部内边距
            },
            WebkitOverflowScrolling: 'touch',
            width: '100%', // 确保填充整个空间
            maxWidth: '100%', // 确保不超出父容器
          }}
          className="no-bounce"
        >
          {messages.length === 0 ? (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                p: 3,
              }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                ChatGPT
              </Typography>
              <Typography sx={{ mb: 4, color: 'text.secondary', textAlign: 'center' }}>
                这是一个基于OpenRouter API的ChatGPT克隆版本。<br />
                请输入您的API密钥来开始聊天。
              </Typography>
              
              <ApiKeyInput apiKey={apiKey} setApiKey={handleApiKeyChange} />
              
              {apiKey && (
                <Button 
                  variant="contained" 
                  onClick={() => handleSendMessage("你好，请简单介绍一下你自己。")}
                  disabled={!apiKey}
                  sx={{ mt: 2 }}
                >
                  开始新对话
                </Button>
              )}

              {/* 添加移动设备提示信息 */}
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  mt: 3, 
                  p: 1, 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  maxWidth: '100%',
                  display: { xs: 'block', md: 'none' }
                }}
              >
                移动设备提示: 如果无法使用键盘，请尝试点击"自动填入"按钮获取测试API Key。
              </Typography>
            </Box>
          ) : (
            <>
              {/* 聊天消息 */}
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  role={message.role as 'user' | 'assistant'} 
                  content={message.content} 
                />
              ))}
              
              {/* 流式响应消息 */}
              {isStreaming && streamingContent && (
                <ChatMessage 
                  role="assistant" 
                  content={streamingContent} 
                  isStreaming={true} 
                />
              )}
              
              {/* 余额不足提示 */}
              {creditsError && (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Alert 
                    severity="warning" 
                    sx={{ mb: 2, textAlign: 'left' }}
                  >
                    <Typography variant="body2" gutterBottom>
                      OpenRouter账户余额不足，需要充值才能继续使用。
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      component={Link}
                      href="https://openrouter.ai/settings/credits"
                      target="_blank"
                      sx={{ mt: 1 }}
                    >
                      前往充值
                    </Button>
                  </Alert>
                </Box>
              )}
              
              {/* 消息列表底部参考点，用于自动滚动 */}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

        {/* 输入区域和底部内容 - 修改定位，向上移动 */}
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: { 
              xs: 'calc(10vh)', // 移动设备上距离底部为屏幕高度的10%
              sm: '20px' // 桌面端保持20px距离
            },
            left: 0,
            right: 0,
            backgroundColor: 'background.default',
            zIndex: 10,
            boxShadow: '0px -1px 5px rgba(0,0,0,0.05)',
            width: '100%',
            borderRadius: { xs: 0, sm: '8px' }, // 移动设备上无圆角
            mx: { xs: 0, sm: 'auto' }, // 移动设备上不居中
            maxWidth: { xs: '100%', sm: 'calc(100% - 40px)', md: 'calc(100% - 60px)' }, // 移动设备上占满宽度
          }}
          className="input-area"
        >
          {/* 输入区域 */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            disabled={!apiKey || creditsError} 
          />

          {/* API Key提示 */}
          {!apiKey && (
            <Box sx={{ 
              textAlign: 'center', 
              mb: 1, 
              mt: -0.5, // 向上移动
              p: 1,
              bgcolor: 'warning.light',
              borderRadius: { xs: 0, sm: '0 0 8px 8px' }, // 移动设备上无圆角，桌面端保留底部圆角
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // 轻微阴影
            }}>
              <Typography variant="body2" color="warning.contrastText">
                请先设置API Key
              </Typography>
              <Button 
                size="small" 
                onClick={() => {
                  const event = new Event('click');
                  document.getElementById('change-api-key-btn')?.dispatchEvent(event);
                }}
                sx={{ 
                  mt: 0.5,
                  bgcolor: 'warning.dark',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                    opacity: 0.9,
                  }
                }}
              >
                设置API Key
              </Button>
            </Box>
          )}
        </Box>

        {/* 错误提示 */}
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ChatInterface; 