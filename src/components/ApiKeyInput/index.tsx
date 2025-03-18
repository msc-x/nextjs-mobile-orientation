import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Divider,
  Paper,
  useMediaQuery,
  useTheme,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { Key as KeyIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { QRCodeSVG } from 'qrcode.react';

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const exampleApiKey = "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";

// 验证API key格式是否正确
function validateApiKey(apiKey: string): boolean {
  // 基本验证：至少20个字符，不含空格
  return apiKey.length >= 20 && !apiKey.includes(' ');
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey }) => {
  const [open, setOpen] = useState(!apiKey);
  const [inputValue, setInputValue] = useState(apiKey);
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [ipAddress, setIpAddress] = useState<string>('');
  const [useLocalIp, setUseLocalIp] = useState<boolean>(true);
  const [editingIp, setEditingIp] = useState<boolean>(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 验证API Key
  useEffect(() => {
    if (inputValue) {
      setIsValidKey(validateApiKey(inputValue));
    } else {
      setIsValidKey(null);
    }
  }, [inputValue]);

  // 在组件挂载时获取当前URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateQrUrl();

      // 尝试从localStorage加载上次使用的IP地址
      const savedIp = localStorage.getItem('localNetworkIp');
      if (savedIp) {
        setIpAddress(savedIp);
      }
    }
  }, []);

  // 更新二维码URL
  const updateQrUrl = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const port = window.location.port;
      
      let url;
      if (useLocalIp && ipAddress) {
        // 使用用户设置的IP地址
        url = `http://${ipAddress}${port ? ':' + port : ''}${path}`;
      } else {
        // 使用当前域名
        url = window.location.origin + path;
      }
      setCurrentUrl(url);
    }
  };

  // 当IP地址或useLocalIp变化时更新URL
  useEffect(() => {
    updateQrUrl();
  }, [ipAddress, useLocalIp]);

  // 保存IP地址
  const saveIpAddress = (ip: string) => {
    setIpAddress(ip);
    localStorage.setItem('localNetworkIp', ip);
    setEditingIp(false);
  };

  const handleSave = () => {
    if (!inputValue.trim()) {
      setError('API Key不能为空');
      return;
    }
    
    if (!validateApiKey(inputValue.trim())) {
      setError('API Key格式不正确。请确保长度足够且不包含空格。');
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

  // 格式化API Key以提高可读性
  const formatApiKey = (key: string): string => {
    if (!key) return '';
    
    // 显示前几位和后几位，中间用省略号代替
    if (key.length > 20) {
      return `${key.substring(0, 10)}...${key.substring(key.length - 10)}`;
    }
    
    return key;
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
            error={!!error || (isValidKey === false && inputValue.length > 0)}
            helperText={error || (isValidKey === false && inputValue.length > 0 ? "API Key格式可能不正确" : "")}
            InputProps={{
              sx: {
                fontFamily: 'monospace', // 使用等宽字体使API key更易读
              },
              endAdornment: (
                <InputAdornment position="end">
                  {inputValue && (
                    isValidKey ? 
                    <CheckCircleIcon color="success" fontSize="small" /> : 
                    <ErrorIcon color="error" fontSize="small" />
                  )}
                </InputAdornment>
              ),
            }}
          />

          {!isMobile && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SmartphoneIcon fontSize="small" sx={{ mr: 1 }} />
                  扫描二维码在手机上访问
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={useLocalIp}
                        onChange={(e) => setUseLocalIp(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="caption">
                        使用本地网络IP
                      </Typography>
                    }
                  />
                  
                  {useLocalIp && (
                    <Box sx={{ mt: 1 }}>
                      {editingIp ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          label="本地网络IP"
                          value={ipAddress}
                          onChange={(e) => setIpAddress(e.target.value)}
                          placeholder="例如: 192.168.1.9"
                          onBlur={() => saveIpAddress(ipAddress)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              saveIpAddress(ipAddress);
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Button 
                                  size="small" 
                                  onClick={() => saveIpAddress(ipAddress)}
                                >
                                  保存
                                </Button>
                              </InputAdornment>
                            ),
                          }}
                          autoFocus
                          sx={{ minWidth: '220px' }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" sx={{ mr: 1 }}>
                            IP: {ipAddress || '未设置'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setEditingIp(true)}
                            sx={{ p: 0.5 }}
                          >
                            <EditIcon fontSize="inherit" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
                
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    display: 'inline-block',
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {currentUrl && (
                    <QRCodeSVG 
                      value={currentUrl} 
                      size={150} 
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"L"}
                      includeMargin={false}
                    />
                  )}
                </Paper>
                
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    fontSize: '0.7rem'
                  }}
                >
                  {useLocalIp 
                    ? "使用手机扫描二维码，确保手机与电脑在同一网络中" 
                    : "使用手机扫描上方二维码打开聊天界面"}
                </Typography>
                
                <Typography 
                  variant="caption" 
                  color="primary"
                  sx={{ 
                    display: 'block', 
                    mt: 0.5,
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {currentUrl}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {apiKey && (
            <Button onClick={() => setOpen(false)}>取消</Button>
          )}
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!isValidKey && inputValue.length > 0}
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