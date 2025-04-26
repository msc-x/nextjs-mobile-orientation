'use client';

import React from 'react';
import { Box, Typography, List, ListItem, Paper, Container, Grid } from '@mui/material';
import Link from 'next/link';

interface DemoItem {
  title: string;
  description: string;
  path: string;
}

const demos: DemoItem[] = [
  {
    title: '看板任务拖拽',
    description: '一个简单的看板应用，可以在不同列之间拖拽任务卡片。基于Atlassian的pragmatic-drag-and-drop库实现。',
    path: '/drag-and-drop/kanban'
  },
  // 未来可以添加更多示例
  {
    title: '排序列表（即将推出）',
    description: '一个可以重新排序的列表示例，展示了基本的垂直排序功能。',
    path: '#'
  },
  {
    title: '多列表拖拽（即将推出）',
    description: '在多个列表之间拖拽元素，展示更复杂的拖拽场景。',
    path: '#'
  }
];

export default function DragAndDropIndexPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          拖拽功能示例
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          这个页面展示了基于Atlassian pragmatic-drag-and-drop库的各种拖拽交互示例。
          该库提供了强大而灵活的拖拽功能，适用于各种场景。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {demos.map((demo, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
              elevation={1}
            >
              <Typography variant="h6" component="h2" gutterBottom>
                {demo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {demo.description}
              </Typography>
              <Box>
                {demo.path !== '#' ? (
                  <Link href={demo.path} style={{ textDecoration: 'none' }}>
                    <Typography 
                      color="primary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 500
                      }}
                    >
                      查看示例
                      <span style={{ marginLeft: '4px' }}>→</span>
                    </Typography>
                  </Link>
                ) : (
                  <Typography color="text.disabled">即将推出</Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          关于 Atlassian Pragmatic Drag and Drop
        </Typography>
        <Typography variant="body2" color="text.secondary">
          这是一个灵活、高性能的拖拽库，可以用于构建各种复杂的拖拽交互。
          它是由Atlassian团队开发的，被用于Trello、Jira等产品中。
          您可以在<Link href="https://atlassian.design/components/pragmatic-drag-and-drop/" target="_blank" style={{ color: 'inherit' }}>Atlassian设计系统</Link>中了解更多。
        </Typography>
      </Box>
    </Container>
  );
} 