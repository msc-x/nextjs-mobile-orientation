import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled: boolean;
  onFocus?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled,
  onFocus
}) => {
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);
  const textFieldRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 自动调整输入框高度
  useEffect(() => {
    if (textFieldRef.current) {
      const textArea = textFieldRef.current.querySelector('textarea');
      if (textArea) {
        textArea.style.height = 'auto';
        // 限制高度更严格，确保移动设备上不会太高
        const maxHeight = isMobile ? 48 : 60;
        textArea.style.height = `${Math.min(textArea.scrollHeight, maxHeight)}px`;
        inputRef.current = textArea;
      }
    }
  }, [message, isMobile]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 手动聚焦输入框
  const focusInput = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  };

  // 处理聚焦事件
  const handleFocus = () => {
    setFocused(true);
    // 调用父组件传递的onFocus回调
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <Box 
      sx={{ 
        width: '100%',
        p: { xs: 0.5, sm: 1 },
        backgroundColor: 'transparent',
        mb: isMobile ? 'env(safe-area-inset-bottom, 8px)' : 0, // 增加iOS安全区域的底部边距
      }}
    >
      {/* 简化的禁用提示 */}
      {disabled && (
        <Box sx={{ textAlign: 'center', mb: 0.5 }}>
          <Typography variant="caption" color="error" align="center" sx={{ fontSize: '0.7rem' }}>
            {!isLoading ? "请先设置API Key" : "加载中..."}
          </Typography>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          maxWidth: '100%',
          margin: '0 auto',
          borderRadius: { xs: 1.5, sm: 2 },
          overflow: 'hidden',
          border: '1px solid',
          borderColor: disabled ? 'error.light' : focused ? 'primary.main' : 'divider',
          backgroundColor: theme.palette.background.paper,
        }}
        onClick={focusInput}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: { xs: 0.3, sm: 0.8 },
          minHeight: isMobile ? '48px' : '56px', // 设置最小高度确保按钮可点击区域足够
        }}>
          <TextField
            ref={textFieldRef}
            fullWidth
            multiline
            maxRows={isMobile ? 2 : 3}
            placeholder={disabled ? "需要API Key..." : "发送消息..."}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading || disabled}
            onFocus={handleFocus}
            onBlur={() => setFocused(false)}
            InputProps={{
              sx: {
                borderRadius: 1.5,
                p: { xs: 0.3, sm: 0.7 },
                '& fieldset': { border: 'none' },
                backgroundColor: 'background.paper',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
              }
            }}
          />
          
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={!message.trim() || isLoading || disabled}
            size={isMobile ? "small" : "medium"}
            sx={{ 
              ml: 0.5,
              mr: 0.2,
              bgcolor: message.trim() && !disabled ? 'primary.main' : 'transparent',
              color: message.trim() && !disabled ? 'white' : 'inherit',
              padding: isMobile ? '4px' : '6px',
              minWidth: isMobile ? '28px' : '32px',
              minHeight: isMobile ? '28px' : '32px',
              borderRadius: '50%',
            }}
          >
            {isLoading ? <CircularProgress size={isMobile ? 14 : 16} color="inherit" /> : <SendIcon fontSize={isMobile ? "small" : "medium"} />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInput; 