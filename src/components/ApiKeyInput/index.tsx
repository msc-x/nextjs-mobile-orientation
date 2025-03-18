import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  Link,
  Tooltip,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { Key as KeyIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const exampleApiKey = "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";

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  const [open, setOpen] = useState(!apiKey);
  const [inputValue, setInputValue] = useState(apiKey);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleSave = () => {
    if (!inputValue.trim()) {
      setError('API Key不能为空');
      return;
    }
    
    setApiKey(inputValue.trim());
    setError(null);
    setOpen(false);
  };

  const handleOpen = () => {
    setInputValue(apiKey);
    setOpen(true);
    setError(null);
  };

  const handleCopyApiKey = () => {
    // 直接使用示例API Key，不尝试复制
    setInputValue(exampleApiKey);
    setCopySuccess(true);
    
    // 仅在非移动设备上尝试复制到剪贴板
    if (navigator.clipboard && !(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))) {
      navigator.clipboard.writeText(exampleApiKey)
        .catch(err => {
          console.error('无法复制API Key: ', err);
          setCopyError(true);
        });
    } else {
      // 在移动设备上，只设置输入值而不尝试复制
      console.log('在移动设备上不支持自动复制，已自动填入API Key');
    }
  };

  const handleSnackbarClose = () => {
    setCopySuccess(false);
    setCopyError(false);
  };

  return (
    <>
      {apiKey && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Button 
            id="change-api-key-btn"
            startIcon={<KeyIcon />} 
            onClick={handleOpen}
            variant="outlined"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            更改 API Key
          </Button>
        </Box>
      )}
      
      <Dialog open={open} onClose={() => apiKey && setOpen(false)}>
        <DialogTitle>设置 OpenRouter API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            您需要一个OpenRouter API Key才能使用聊天功能。
            {' '}
            <Link href="https://openrouter.ai/" target="_blank" rel="noopener">
              注册OpenRouter
            </Link>
            {' '}
            并获取您的API Key。
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="body2">可以使用此API Key测试:</Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: 'monospace', 
                  wordBreak: 'break-all',
                  mt: 0.5 
                }}
              >
                {exampleApiKey}
              </Typography>
              <Button
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopyApiKey}
                sx={{ mt: 1 }}
              >
                自动填入
              </Button>
            </Box>
          </Alert>
          
          <TextField
            autoFocus
            margin="dense"
            id="api-key"
            label="OpenRouter API Key"
            type="text" // 改为text以在移动设备上更容易看到
            fullWidth
            variant="outlined"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{
              '& input': {
                fontFamily: 'monospace', // 使用等宽字体使API key更易读
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          {apiKey && (
            <Button onClick={() => setOpen(false)}>取消</Button>
          )}
          <Button 
            onClick={handleSave} 
            variant="contained"
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="API Key已自动填入输入框"
      />
      
      <Snackbar
        open={copyError}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="无法复制到剪贴板，请手动复制"
      />
    </>
  );
};

export default ApiKeyInput; 