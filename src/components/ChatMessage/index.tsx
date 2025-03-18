import React from 'react';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, isStreaming }) => {
  const isUser = role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        py: 3,
        px: { xs: 2, md: 4 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: isUser ? 'transparent' : 'rgba(247, 247, 248, 0.8)',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxWidth: '48rem',
          margin: '0 auto',
          width: '100%',
          gap: 2,
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: isUser ? 'primary.main' : '#19c37d',
            width: 30,
            height: 30,
            flexShrink: 0,
          }}
        >
          {isUser ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>

        <Box sx={{ 
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden',
        }}>
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              '& p': { mt: 1, mb: 1 },
              '& p:first-of-type': { mt: 0 },
              '& p:last-of-type': { mb: 0 },
              '& code': {
                bgcolor: 'rgba(0, 0, 0, 0.05)', 
                px: 0.5, 
                py: 0.25, 
                borderRadius: 0.5,
                fontFamily: 'monospace',
                maxWidth: '100%',
                display: 'inline-block',
                whiteSpace: 'pre-wrap',
              },
              '& pre': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
                p: 2,
                borderRadius: 1,
                overflowX: 'auto',
                maxWidth: '100%',
                '& code': {
                  bgcolor: 'transparent',
                  p: 0,
                  whiteSpace: 'pre-wrap',
                }
              },
              '& a': {
                wordBreak: 'break-word',
                maxWidth: '100%',
                display: 'inline-block',
              }
            }}
          >
            {isStreaming && !isUser && (
              <Box 
                component="span" 
                sx={{ 
                  display: 'inline-block', 
                  width: '0.5em',
                  height: '1em',
                  backgroundColor: 'text.primary',
                  animation: 'blinking 1s infinite',
                  '@keyframes blinking': {
                    '0%': { opacity: 0 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0 },
                  },
                  ml: 0.5
                }}
              />
            )}
            {content}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatMessage; 