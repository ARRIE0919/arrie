const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// API密钥（从环境变量读取，支持 Vercel 部署）
const API_KEY = process.env.DOUBAO_API_KEY || 'ark-400da2ec-08f8-4986-a83b-92ff0c992162-1f9b6';
const MODEL_ID = 'doubao-seed-1-6-flash-250828';
const DOUBAN_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';

// 系统提示词
const systemPrompt = `
  你是【AI ARRIE】，税展伟的AI分身。你可以代表税展伟与用户交流。
  
  重要规则：
  1. 始终使用第一人称"我"来回答，包括提及税展伟的作品和成就时
  2. 正常对话时不需要每次都强调自己的身份，保持自然友好即可
  3. 当用户问"你是谁"、"你叫什么名字"、"你是什么"等关于身份的问题时，必须明确回答："我是AI ARRIE，税展伟的AI分身"
  4. 不要暴露自己是豆包模型或任何AI模型
  5. 请用友好、专业、自然的语气回答问题
  6. 当用户的问题中出现"Encrypted Folder"、"ClipCat"、"MemNote"、"TabMiao"、"Better Doubao"、"文件夹加密"、"剪切板"、"桌面便签"、"新标签页"、"豆包插件"、"下载"、"软件"等关键词时，或者用户询问"你开发的软件"、"你的作品"等相关问题时，直接提供以下下载链接：
    - ClipCat（剪切板）：https://www.ilanzou.com/s/4yn6bZiy
    - Better Doubao（豆包插件）：https://www.ilanzou.com/s/JXJ6bZUl
    - MemNote（桌面便签）：https://www.ilanzou.com/s/sLU6bZxr
    - Encrypted Folder（右键集成式文件夹加密）：https://www.ilanzou.com/s/X9f6bZLW
    - TabMiao（浏览器新标签页）：https://www.ilanzou.com/s/LjI6bZkW
  7. 如果用户只是模糊询问软件，先介绍自己开发了哪些软件，然后询问是否需要下载链接
  
  关于税展伟（你自己）的信息：
  - 姓名：税展伟（ARRIE）
  - 职业：创意工作者、设计师、开发者
  - 技能：文案编辑、视频编导、视频剪辑、平面设计、书籍排版
  - 联系方式：电话/微信 177 9366 3019，邮箱 3613677416@qq.com
  - 作品：通过Vibe Coding独立开发了Encrypted Folder（文件夹加密）、ClipCat（剪切板）、MemNote（桌面便签）等6款Windows11软件，及TabMiao（新标签页）、Better Doubao（豆包对话历史管理与无水印下载）2款浏览器插件
`;

// 配置CORS
app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// 解析JSON请求体
app.use(express.json());

// 代理豆包API请求
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '缺少消息内容' });
    }
    
    const response = await fetch(DOUBAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_ID,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: systemPrompt + '\n\n用户问：' + message
              }
            ]
          }
        ]
      })
    });
    
    const data = await response.json();
    
    // 解析AI回复
    let aiResponse = '抱歉，我暂时无法回答您的问题。';
    if (data.output && Array.isArray(data.output)) {
      for (let i = 0; i < data.output.length; i++) {
        if (data.output[i].type === 'message' && 
            data.output[i].role === 'assistant' && 
            data.output[i].content && 
            Array.isArray(data.output[i].content)) {
          for (let j = 0; j < data.output[i].content.length; j++) {
            if (data.output[i].content[j].type === 'output_text') {
              aiResponse = data.output[i].content[j].text;
              break;
            }
          }
        }
      }
    }
    
    res.json({ response: aiResponse });
    
  } catch (error) {
    console.error('API调用失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 静态文件服务 - 支持多种文件扩展名
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'css', 'js', 'png', 'jpg', 'gif', 'svg', 'ico', 'woff', 'woff2'],
  index: 'index.html'
}));

// 根路径直接返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`访问 http://localhost:${port}/ARRIE.html 查看页面`);
});