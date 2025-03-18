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

// 创建聊天完成函数
export async function createChatCompletion(
  apiKey: string,
  messages: ChatMessage[],
  streamingHandler: StreamingHandler
) {
  try {
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
    });

    let accumulatedContent = '';

    // 处理流式响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      accumulatedContent += content;
      streamingHandler(accumulatedContent, false); // 未完成
    }

    // 流结束，标记完成
    streamingHandler(accumulatedContent, true);
    return accumulatedContent;
  } catch (error: any) {
    console.error('Error during chat completion:', error);
    
    // 特殊处理余额不足的错误
    if (error.status === 402 || (error.message && error.message.includes('Insufficient credits'))) {
      throw new InsufficientCreditsError(
        '账户余额不足。您需要在OpenRouter上充值才能继续使用。请访问 https://openrouter.ai/settings/credits 添加更多额度。'
      );
    }
    
    throw error;
  }
} 