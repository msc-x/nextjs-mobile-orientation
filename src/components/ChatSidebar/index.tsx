import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Typography, 
  Divider,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface ChatSidebarProps {
  onStartNewChat: () => void;
  currentChatId?: string;
  chatHistory: string[];
  onClearConversations: () => void;
  onSelectChat?: (chatId: string) => void;
  onDeleteChat?: (chatId: string) => void; // 添加删除单个聊天的回调函数
}

const drawerWidth = 260;

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onStartNewChat,
  currentChatId,
  chatHistory,
  onClearConversations,
  onSelectChat,
  onDeleteChat
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // 处理选择聊天的函数
  const handleSelectChat = (id: string) => {
    console.log('Selected chat:', id);
    // 在移动设备上，选择聊天后自动关闭侧边栏
    if (isMobile) {
      setOpen(false);
    }
  };

  // 处理删除单个聊天的函数
  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // 阻止事件冒泡，防止触发选择聊天
    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  // 侧边栏内容
  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%', // 确保整个抽屉内容占满高度
      boxSizing: 'border-box', // 使用border-box盒模型
    }}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          flexShrink: 0, // 防止标题区域被压缩
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          ChatGPT
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ px: 2, pb: 2, flexShrink: 0 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={<AddIcon />} 
          onClick={() => {
            onStartNewChat();
            // 在移动设备上，创建新对话后自动关闭侧边栏
            if (isMobile) {
              setOpen(false);
            }
          }}
          sx={{ 
            borderColor: 'rgba(255,255,255,0.2)', 
            color: 'white', 
            textTransform: 'none',
            justifyContent: 'flex-start',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.4)',
            }
          }}
        >
          新对话
        </Button>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
      
      <List sx={{ 
        flex: 1, 
        overflow: 'auto', 
        py: 0,
        minHeight: 0, // 修复Flex容器中的滚动问题
      }}>
        {chatHistory.length > 0 ? (
          chatHistory.map((title, index) => (
            <ListItem 
              key={index} 
              disablePadding 
              secondaryAction={
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={(e) => handleDeleteChat(e, `chat-${index}`)}
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      color: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              }
              sx={{ 
                pr: 6, // 为删除按钮留出空间
              }}
            >
              <ListItemButton 
                selected={currentChatId === `chat-${index}`}
                onClick={() => handleSelectChat(`chat-${index}`)}
                sx={{ 
                  py: 1.5, 
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <ChatBubbleOutlineIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={title} 
                  primaryTypographyProps={{ 
                    noWrap: true, 
                    fontSize: 14
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Box sx={{ p: 2, color: 'text.secondary', fontSize: 14 }}>
            没有聊天记录
          </Box>
        )}
      </List>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
      
      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Button 
          fullWidth 
          variant="text" 
          startIcon={<DeleteOutlineIcon />} 
          onClick={onClearConversations}
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            textTransform: 'none',
            justifyContent: 'flex-start',
            fontSize: 14,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.05)',
            }
          }}
        >
          清空对话
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* 移动设备上的菜单按钮 - 恢复之前的样式 */}
      {isMobile && !open && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed', 
            top: 8, 
            left: 8, 
            zIndex: 1100,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
            },
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {/* 桌面端的收起/展开按钮 */}
      {!isMobile && (
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 12,
            left: open ? drawerWidth - 28 : 12,
            zIndex: 1200,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '50%',
            width: 28,
            height: 28,
            transition: theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '&:hover': {
              bgcolor: 'action.hover',
            },
            display: { xs: 'none', md: 'flex' },
          }}
        >
          {open ? <ChevronLeftIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
        </IconButton>
      )}
      
      {/* 侧边栏抽屉 - 移动设备上使用temporary模式 */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // 提高移动设备上的性能
        }}
        sx={{
          display: isMobile && !open ? 'none' : 'block',
          width: isMobile ? 0 : (open ? drawerWidth : 0),
          flexShrink: 0,
          height: '100%', // 确保占满高度
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#202123', // ChatGPT侧边栏的深色背景
            color: 'white',
            height: '100%', // 确保Paper组件占满高度
            overflowY: 'hidden', // 防止整个drawer出现滚动条
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
          '& .MuiDrawer-docked': {
            // 解决docked模式下占用空间的问题
            width: isMobile ? 0 : (open ? drawerWidth : 0),
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default ChatSidebar; 