import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Alert, Snackbar, Container, Paper, Button, Link, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import ChatMessage from '../ChatMessage';
import ChatInput from '../ChatInput';
import ApiKeyInput from '../ApiKeyInput';
import ChatSidebar from '../ChatSidebar';
import { ChatMessage as ChatMessageType, createChatCompletion, InsufficientCreditsError, availableModels } from '@/utils/openRouterApi';
import AddIcon from '@mui/icons-material/Add';

const ChatInterface: React.FC = () => {
  // 保存API Key
  const [apiKey, setApiKey] = useState<string>('');
  
  // 所选AI模型
  const [selectedModel, setSelectedModel] = useState<string>(availableModels[0].id);
  
  // 免费模型ID
  const FREE_MODEL_ID = 'mistralai/mistral-7b-instruct:free';
  
  // 模型权限对话框状态
  const [modelPermissionDialog, setModelPermissionDialog] = useState({
    open: false,
    attemptedModelId: '',
    attemptedModelName: ''
  });
  
  // 当前对话使用的模型
  const [currentChatModel, setCurrentChatModel] = useState<string>('');

  // 所有聊天使用的模型，格式为 {[chatId]: string}
  const [chatModels, setChatModels] = useState<{[key: string]: string}>({});
  
  // 消息列表 - 当前显示的消息
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  
  // 所有聊天的消息记录，格式为 {[chatId]: ChatMessageType[]}
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessageType[]}>({});
  
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
  
  // 系统消息 - 为了保持一致性，只需在每个新对话中添加一次
  const systemMessage: ChatMessageType = {
    role: 'system',
    content: '你是一个友好、知识渊博的AI助手，能够回答各种问题并提供帮助。请记住我们之前的对话，保持上下文连贯性。'
  };

  // 处理API Key变更
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    setCreditsError(false); // 重置余额错误状态
  };

  // 处理模型变更
  const handleModelChange = (event: SelectChangeEvent) => {
    const newModelId = event.target.value;
    
    // 如果选择了免费模型，直接设置
    if (newModelId === FREE_MODEL_ID) {
      setSelectedModel(newModelId);
      return;
    }
    
    // 尝试选择付费模型，显示提示对话框
    const selectedModelInfo = availableModels.find(model => model.id === newModelId);
    setModelPermissionDialog({
      open: true,
      attemptedModelId: newModelId,
      attemptedModelName: selectedModelInfo ? selectedModelInfo.name : newModelId
    });
  };

  // 关闭模型权限对话框
  const handleCloseModelDialog = () => {
    setModelPermissionDialog({
      open: false,
      attemptedModelId: '',
      attemptedModelName: ''
    });
  };

  // 处理选择聊天
  const handleSelectChat = (chatId: string) => {
    // 如果已经选择了当前聊天，不做任何操作
    if (chatId === currentChatId) return;
    
    console.log('选择聊天:', chatId);
    
    // 保存当前聊天的消息（如果有当前聊天ID）
    if (currentChatId && messages.length > 0) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: messages
      }));
    }
    
    // 设置新的当前聊天ID
    setCurrentChatId(chatId);
    
    // 加载所选聊天的消息
    const chatMsgs = chatMessages[chatId] || [];
    setMessages(chatMsgs);
    console.log(`加载聊天 ${chatId} 的消息，数量:`, chatMsgs.length);
    
    // 加载所选聊天的模型（但只显示，实际使用免费模型）
    const chatModel = chatModels[chatId] || FREE_MODEL_ID;
    setCurrentChatModel(chatModel);
    
    // 始终使用免费模型
    setSelectedModel(FREE_MODEL_ID);
    
    // 重置流式内容和错误状态
    setStreamingContent('');
    setIsStreaming(false);
    setIsLoading(false);
    setError(null);
    setCreditsError(false);
  };

  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    // 添加用户消息到列表
    const userMessage: ChatMessageType = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // 如果是新对话的第一条消息，创建新聊天并添加系统消息
    let messagesWithSystem = [...updatedMessages];
    if (!currentChatId) {
      // 生成新的聊天ID
      const newChatId = `chat-${chatHistory.length}`;
      
      // 截取前30个字符作为聊天标题
      const chatTitle = content.length > 30 ? content.substring(0, 27) + '...' : content;
      setChatHistory(prev => [...prev, chatTitle]);
      
      // 记录所使用的模型 - 始终使用免费模型
      setCurrentChatModel(FREE_MODEL_ID);
      setChatModels(prev => ({
        ...prev,
        [newChatId]: FREE_MODEL_ID
      }));
      
      // 设置为当前聊天
      setCurrentChatId(newChatId);
      
      // 在消息开头添加系统消息
      messagesWithSystem = [systemMessage, ...updatedMessages];
      
      // 保存消息到新的聊天
      setChatMessages(prev => ({
        ...prev,
        [newChatId]: messagesWithSystem
      }));
    } else {
      // 检查现有消息中是否已经有系统消息
      const hasSystemMessage = messages.some(msg => msg.role === 'system');
      
      // 如果没有系统消息，添加一个
      if (!hasSystemMessage && messages.length > 0) {
        messagesWithSystem = [systemMessage, ...updatedMessages];
      }
      
      // 始终使用免费模型
      setCurrentChatModel(FREE_MODEL_ID);
      setChatModels(prev => ({
        ...prev,
        [currentChatId]: FREE_MODEL_ID
      }));
      
      // 更新现有聊天的消息
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: messagesWithSystem
      }));
    }
    
    // 重置流式内容和状态
    setStreamingContent('');
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setCreditsError(false);

    try {
      // 确保发送给API的消息包含系统消息和完整历史
      const apiMessages = messagesWithSystem;
      console.log('发送给API的消息数量:', apiMessages.length);
      
      // 调用API进行流式响应 - 始终使用免费模型
      await createChatCompletion(
        apiKey,
        apiMessages,
        (content, done) => {
          setStreamingContent(content);
          if (done) {
            setIsStreaming(false);
            setIsLoading(false);
            // 响应完成后，添加助手消息到列表
            const newMessages: ChatMessageType[] = [
              ...messagesWithSystem, 
              { role: 'assistant', content }
            ];
            setMessages(newMessages);
            
            // 同时更新聊天历史中的消息
            if (currentChatId) {
              setChatMessages(prev => ({
                ...prev,
                [currentChatId]: newMessages
              }));
            }
          }
        },
        FREE_MODEL_ID // 始终使用免费模型ID
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
    // 如果当前有聊天且有消息，保存它
    if (currentChatId && messages.length > 0) {
      setChatMessages(prev => ({
        ...prev,
        [currentChatId]: messages
      }));
    }
    
    // 重置当前状态
    setMessages([]); // 清空消息，但不添加系统消息，等到用户发送第一条消息时再添加
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
    setChatMessages({});
    setChatModels({}); // 清空所有聊天模型记录
    handleNewChat();
  };

  // 删除单条聊天记录
  const handleDeleteChat = (chatId: string) => {
    // 找到要删除的聊天索引
    const index = parseInt(chatId.replace('chat-', ''));
    
    // 复制一份聊天历史记录和消息
    const newChatHistory = [...chatHistory];
    const newChatMessages = {...chatMessages};
    const newChatModels = {...chatModels};
    
    // 删除对应的聊天历史、消息和模型记录
    newChatHistory.splice(index, 1);
    delete newChatMessages[chatId];
    delete newChatModels[chatId];
    
    // 更新状态
    setChatHistory(newChatHistory);
    setChatMessages(newChatMessages);
    setChatModels(newChatModels);
    
    // 如果删除的是当前选中的聊天，则清空当前显示的消息
    if (currentChatId === chatId) {
      setMessages([]);
      setCurrentChatId(undefined);
      setCurrentChatModel(''); // 清空当前模型
    } else if (currentChatId) {
      // 如果当前聊天ID的索引大于被删除的聊天索引，需要更新当前聊天ID
      const currentIndex = parseInt(currentChatId.replace('chat-', ''));
      if (currentIndex > index) {
        const newCurrentChatId = `chat-${currentIndex - 1}`;
        setCurrentChatId(newCurrentChatId);
        setMessages(newChatMessages[newCurrentChatId] || []);
        setCurrentChatModel(newChatModels[newCurrentChatId] || ''); // 更新当前模型
      }
    }
  };

  // 消息列表更新时滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      // 使用更平滑的滚动效果，但确保滚动到正确位置
      messagesEndRef.current.scrollIntoView({ 
        behavior: messages.length > 1 ? 'smooth' : 'auto',
        block: 'end' // 确保滚动到底部
      });
    }
  }, [messages, streamingContent]);

  // 监听窗口大小变化，确保正确滚动
  useEffect(() => {
    const handleResize = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 在聚焦输入框时确保消息可见
  const handleInputFocus = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // 轻微延迟确保键盘已完全弹出
  };

  // 可选：从localStorage加载API Key
  /*
  useEffect(() => {
    const savedKey = localStorage.getItem('openrouter_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);
  */

  // 可选：从localStorage加载聊天历史和消息
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chat_history');
    const savedChatMessages = localStorage.getItem('chat_messages');
    const savedChatModels = localStorage.getItem('chat_models');
    
    if (savedChatHistory) {
      try {
        setChatHistory(JSON.parse(savedChatHistory));
      } catch (e) {
        console.error('加载聊天历史失败:', e);
      }
    }
    
    if (savedChatMessages) {
      try {
        setChatMessages(JSON.parse(savedChatMessages));
      } catch (e) {
        console.error('加载聊天消息失败:', e);
      }
    }
    
    if (savedChatModels) {
      try {
        setChatModels(JSON.parse(savedChatModels));
      } catch (e) {
        console.error('加载聊天模型失败:', e);
      }
    }
  }, []);

  // 保存聊天历史和消息到localStorage
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    }
    
    if (Object.keys(chatMessages).length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(chatMessages));
    }
    
    if (Object.keys(chatModels).length > 0) {
      localStorage.setItem('chat_models', JSON.stringify(chatModels));
    }
  }, [chatHistory, chatMessages, chatModels]);

  // 模型名称获取函数
  const getModelName = (modelId: string): string => {
    const model = availableModels.find(model => model.id === modelId);
    return model ? model.name : modelId;
  };

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
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
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
        {/* 模型权限对话框 */}
        <Dialog
          open={modelPermissionDialog.open}
          onClose={handleCloseModelDialog}
          aria-labelledby="model-permission-dialog-title"
        >
          <DialogTitle id="model-permission-dialog-title">
            无法使用付费模型
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              很抱歉，您没有足够的额度使用 <strong>{modelPermissionDialog.attemptedModelName}</strong> 模型。
              当前只能使用免费模型：<strong>{getModelName(FREE_MODEL_ID)}</strong>。
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModelDialog} color="primary" autoFocus>
              我知道了
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* 顶部模型选择区域 */}
        <Box 
          sx={{ 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            bgcolor: 'background.paper',
            zIndex: 5,
          }}
        >
          {currentChatId && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                display: { xs: 'block', sm: 'none' }
              }}
            >
              当前聊天
            </Typography>
          )}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: 180, 
              maxWidth: { xs: '65%', sm: 220 } 
            }}
          >
            <InputLabel id="model-select-label">AI 模型</InputLabel>
            <Select
              labelId="model-select-label"
              id="model-select"
              value={selectedModel}
              label="AI 模型"
              onChange={handleModelChange}
            >
              {availableModels.map((model) => (
                <MenuItem key={model.id} value={model.id} 
                  sx={model.id !== FREE_MODEL_ID ? {
                    '&::after': {
                      content: '"🔒"',
                      marginLeft: 1,
                      opacity: 0.6,
                    }
                  } : {
                    '&::after': {
                      content: '"✓ 免费"',
                      marginLeft: 1,
                      fontSize: '0.75rem',
                      color: 'success.main',
                    }
                  }}
                >
                  {model.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* 当前模型信息 - 增加付费模型提示 */}
        {messages.length > 0 && (
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              textAlign: 'center',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            <Typography variant="body2" color="text.secondary">
              当前对话使用模型: <strong>{getModelName(FREE_MODEL_ID)}</strong> (免费)
              {currentChatModel !== FREE_MODEL_ID && (
                <Typography component="span" variant="body2" color="warning.main" sx={{ ml: 1 }}>
                  (原选择: {getModelName(currentChatModel)})
                </Typography>
              )}
            </Typography>
          </Box>
        )}
        
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

              {/* 添加模型选择提示 */}
              {apiKey && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 3, 
                    textAlign: 'center',
                    maxWidth: '80%'
                  }}
                >
                  您可以在顶部下拉菜单中选择不同的AI模型。不同模型有不同的特点和能力。
                </Typography>
              )}

              {/* 移动设备提示信息 */}
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
                移动设备提示: 请点击"自动填入"按钮获取测试API Key。
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
              xs: '0', // 固定在底部
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
            minHeight: '100px', // 确保输入区域有最小高度
          }}
          className="input-area"
        >
          {/* 输入区域 */}
          <ChatInput 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            disabled={!apiKey || creditsError} 
            onFocus={handleInputFocus}
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