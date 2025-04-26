'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Container, Grid } from '@mui/material';
import { 
  draggable,
  dropTargetForElements,
  monitorForElements
} from '@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/combine';
import styles from './styles.module.css';

interface Task {
  id: string;
  content: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface DragSourceData {
  type: string;
  taskId: string;
}

const KanbanPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', content: '学习Next.js', status: 'todo' },
    { id: '2', content: '实现拖拽功能', status: 'todo' },
    { id: '3', content: '优化移动端体验', status: 'inProgress' },
    { id: '4', content: '完成AI聊天功能', status: 'done' },
    { id: '5', content: '编写文档', status: 'inProgress' },
  ]);

  const columns = {
    todo: {
      title: '待办',
      tasks: tasks.filter(task => task.status === 'todo'),
    },
    inProgress: {
      title: '进行中',
      tasks: tasks.filter(task => task.status === 'inProgress'),
    },
    done: {
      title: '已完成',
      tasks: tasks.filter(task => task.status === 'done'),
    },
  };

  // Function to handle task movement
  const moveTask = (taskId: string, newStatus: 'todo' | 'inProgress' | 'done') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      content: `新任务 ${Math.floor(Math.random() * 100)}`,
      status: 'todo',
    };
    setTasks([...tasks, newTask]);
  };

  // Setup drag and drop once component mounts
  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Set up drop targets (columns)
    Object.keys(columns).forEach(columnId => {
      const column = document.getElementById(`column-${columnId}`);
      if (!column) return;

      // Add the dropTarget class
      column.classList.add(styles.dropTarget);

      const cleanup = dropTargetForElements({
        element: column,
        canDrop: ({ source }: { source: { data: DragSourceData } }) => {
          // Only allow dropping of tasks
          return source.data.type === 'task';
        },
        onDragEnter: () => {
          column.classList.add(styles.canDrop);
        },
        onDragLeave: () => {
          column.classList.remove(styles.canDrop);
        },
        onDrop: ({ source }: { source: { data: DragSourceData } }) => {
          column.classList.remove(styles.canDrop);
          if (source.data.type === 'task') {
            moveTask(source.data.taskId, columnId as any);
          }
        },
      });
      
      cleanupFunctions.push(cleanup);
    });

    // Set up draggable tasks
    tasks.forEach(task => {
      const taskElement = document.getElementById(`task-${task.id}`);
      if (!taskElement) return;

      // Add draggable class
      taskElement.classList.add(styles.draggable);

      const cleanup = draggable({
        element: taskElement,
        getData: () => ({
          type: 'task',
          taskId: task.id,
        }),
      });
      
      cleanupFunctions.push(cleanup);
    });

    // Add monitor for styling during drag
    const cleanupMonitor = monitorForElements({
      onDragStart: ({ source }: { source: { element: HTMLElement } }) => {
        const element = source.element;
        element.classList.add(styles.dragging);
      },
      onDrop: ({ source }: { source: { element: HTMLElement } }) => {
        const element = source.element;
        element.classList.remove(styles.dragging);
      },
    });
    
    cleanupFunctions.push(cleanupMonitor);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [tasks]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          看板任务拖拽示例
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={addNewTask}
        >
          添加任务
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Object.entries(columns).map(([id, column]) => (
          <Grid item xs={12} md={4} key={id}>
            <Paper
              id={`column-${id}`}
              className={styles.taskColumn}
              sx={{
                height: '100%',
                bgcolor: id === 'todo' ? '#f5f5f5' : id === 'inProgress' ? '#e3f2fd' : '#e8f5e9',
              }}
            >
              <Typography variant="h6" component="h2" className={styles.columnTitle}>
                {column.title} ({column.tasks.length})
              </Typography>
              
              <Box sx={{ flexGrow: 1 }}>
                {column.tasks.map(task => (
                  <Paper
                    id={`task-${task.id}`}
                    key={task.id}
                    className={styles.taskCard}
                    elevation={1}
                  >
                    {task.content}
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          提示: 拖动任务卡片到不同的列以更改其状态。此示例使用了Atlassian的pragmatic-drag-and-drop库。
        </Typography>
      </Box>
    </Container>
  );
};

export default KanbanPage; 