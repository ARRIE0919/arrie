import os
import re

def restore_back_button():
    folders = ['视频', '平面', '文章']
    
    for folder in folders:
        for root, dirs, files in os.walk(folder):
            for file in files:
                if file.endswith('.html'):
                    file_path = os.path.join(root, file)
                    
                    # 计算目录层级
                    relative_path = os.path.relpath(file_path, '.')
                    depth = relative_path.count(os.sep)
                    
                    # 根据层级设置返回路径
                    if depth == 1:
                        back_path = '../ARRIE.html#portfolio'
                    elif depth == 2:
                        back_path = '../../ARRIE.html#portfolio'
                    else:
                        back_path = '../ARRIE.html#portfolio'
                    
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 将直接链接改回 onclick 事件
                    old_button = f'<a href="{back_path}" class="btn btn-dark">返回作品集</a>'
                    new_button = '<a href="javascript:void(0)" onclick="goBackToPortfolio()" class="btn btn-dark">返回作品集</a>'
                    content = content.replace(old_button, new_button)
                    
                    # 添加或更新 goBackToPortfolio 函数
                    # 先删除旧函数（如果存在）
                    content = re.sub(
                        r'// 返回作品集页面\s*function goBackToPortfolio\(\) \{[^}]+\}',
                        '',
                        content,
                        flags=re.DOTALL
                    )
                    
                    # 在适当位置添加新函数
                    new_func = f'''
            
            // 返回作品集页面
            function goBackToPortfolio() {{
              window.close();
              setTimeout(function() {{
                window.location.href = '{back_path}';
              }}, 100);
            }}
            '''
                    
                    # 在 window.scrollTo(0, 0) 之前添加函数
                    content = content.replace(
                        '            window.scrollTo(0, 0);',
                        new_func + '            window.scrollTo(0, 0);'
                    )
                    
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                        
                    print(f"修复: {file_path}")
    
    print("所有详情页的返回按钮已恢复为关闭标签页模式！")

if __name__ == "__main__":
    restore_back_button()
