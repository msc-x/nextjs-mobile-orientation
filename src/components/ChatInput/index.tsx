import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  CircularProgress,
  Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  disabled 
}) => {
  const [message, setMessage] = useState('');
  const [focused, setFocused] = useState(false);
  const textFieldRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // 自动调整输入框高度
  useEffect(() => {
    if (textFieldRef.current) {
      const textArea = textFieldRef.current.querySelector('textarea');
      if (textArea) {
        textArea.style.height = 'auto';
        // 限制高度更严格，确保移动设备上不会太高
        textArea.style.height = `${Math.min(textArea.scrollHeight, 60)}px`;
        inputRef.current = textArea;
      }
    }
  }, [message]);

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

  return (
    <Box 
      sx={{ 
        width: '100%',
        p: { xs: 0.5, sm: 1 },
        backgroundColor: 'transparent',
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
        elevation={1}
        sx={{
          maxWidth: '100%',
          margin: '0 auto',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: disabled ? 'error.light' : focused ? 'primary.main' : 'divider',
        }}
        onClick={focusInput}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: { xs: 0.5, sm: 0.8 } }}>
          <TextField
            ref={textFieldRef}
            fullWidth
            multiline
            maxRows={2}
            placeholder={disabled ? "需要API Key..." : "发送消息..."}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading || disabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            InputProps={{
              sx: {
                borderRadius: 1.5,
                p: { xs: 0.5, sm: 0.7 },
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
            size="small"
            sx={{ 
              ml: 0.5,
              bgcolor: message.trim() && !disabled ? 'primary.main' : 'transparent',
              color: message.trim() && !disabled ? 'white' : 'inherit',
              padding: '6px',
              minWidth: '32px',
              minHeight: '32px',
              borderRadius: '50%',
            }}
          >
            {isLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInput; 