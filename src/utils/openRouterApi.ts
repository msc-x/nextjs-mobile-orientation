import { OpenAI } from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 定义进行流式响应处理的函数类型
export type StreamingHandler = (content: string, done: boolean) => void;

// 自定义错误类型
export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

// OpenRouter API配置
const openRouterConfig = {
  baseURL: 'https://openrouter.ai/api/v1',
  defaultModel: 'mistralai/mistral-7b-instruct:free', // 模型ID
};

// 验证API key格式是否正确
function validateApiKey(apiKey: string): boolean {
  // OpenRouter API key通常以sk-开头，但也可能有其他格式
  // 宽松的验证规则，只要长度合适且不含空格即可
  return apiKey.length >= 20 && !apiKey.includes(' ');
}

// 创建聊天完成函数
export async function createChatCompletion(
  apiKey: string,
  messages: ChatMessage[],
  streamingHandler: StreamingHandler
) {
  console.log('开始API调用，消息数量:', messages.length);
  
  // 验证API key
  if (!apiKey) {
    console.error('API Key为空');
    throw new Error('API Key不能为空。请输入有效的OpenRouter API Key。');
  }
  
  if (!validateApiKey(apiKey)) {
    console.error('API Key格式无效:', apiKey.substring(0, 4) + '...');
    throw new Error('API Key格式不正确。请确保您的API Key长度足够且不包含空格。标准格式通常为"sk-or-xxxx..."或"sk-xxxx..."。');
  }

  try {
    console.log('使用API Key (部分隐藏):', apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4));
    console.log('调用模型:', openRouterConfig.defaultModel);
    
    const openai = new OpenAI({
      apiKey,
      baseURL: openRouterConfig.baseURL,
      dangerouslyAllowBrowser: true, // 允许在浏览器中直接使用
    });

    // 发起流式请求
    const stream = await openai.chat.completions.create({
      messages,
      model: openRouterConfig.defaultModel,
      stream: true,
    }, {
      headers: {
        'HTTP-Referer': window.location.origin, // 添加来源
        'X-Title': 'AI Chat App', // 添加应用标题
      }
    });

    console.log('API连接成功，开始接收流式响应');
    let accumulatedContent = '';

    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      accumulatedContent += content;
      streamingHandler(accumulatedContent, false); // 未完成
    }

    // 流结束，标记完成
    console.log('流式响应完成，总共接收字符:', accumulatedContent.length);
    streamingHandler(accumulatedContent, true);
    return accumulatedContent;
  } catch (error: any) {
    console.error('API调用错误详情:', error);
    
    // 详细的错误处理
    if (typeof error === 'object' && error !== null) {
      console.log('错误类型:', error.constructor.name);
      console.log('错误状态码:', error.status || '未知');
      console.log('错误消息:', error.message || '未知错误');
      
      if (error.response) {
        console.log('响应数据:', error.response);
      }
    }
    
    // 特殊处理认证错误
    if (error.status === 401 || (error.message && error.message.includes('No auth credentials found'))) {
      throw new Error(
        'API Key认证失败。请确保您输入了正确的OpenRouter API Key，并且该Key具有足够的权限。您输入的密钥可能已过期或不正确。'
      );
    }
    
    // 特殊处理余额不足的错误
    if (error.status === 402 || (error.message && error.message.includes('Insufficient credits'))) {
      throw new InsufficientCreditsError(
        '账户余额不足。您需要在OpenRouter上充值才能继续使用。请访问 https://openrouter.ai/settings/credits 添加更多额度。'
      );
    }
    
    // 处理其他常见错误
    if (error.status === 404) {
      throw new Error('API端点或模型未找到。请检查您是否使用了正确的API地址和模型名称。');
    }
    
    if (error.status === 429) {
      throw new Error('请求频率过高。请稍后再试。');
    }
    
    if (error.status === 500 || error.status === 502 || error.status === 503) {
      throw new Error('OpenRouter服务器暂时不可用。请稍后再试。');
    }
    
    // 如果是网络错误
    if (error.message && error.message.includes('network')) {
      throw new Error('网络连接错误。请检查您的网络连接后重试。');
    }
    
    // 其他未知错误
    throw error;
  }
} 