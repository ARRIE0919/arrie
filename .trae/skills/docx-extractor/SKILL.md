---
name: "docx-extractor"
description: "Extracts text, tables, and images from Word documents and displays images in correct table positions. Invoke when user needs to extract content from .docx files and generate HTML with proper image placement."
---

# Word文档内容提取技能

## 概述

本技能用于从Word文档(.docx)中提取文字、表格和图片，并将图片正确显示在表格的相应位置，最终生成HTML文件。

## 核心原理

Word文档(.docx)实际上是一个ZIP压缩文件，包含多个XML文件和资源文件。直接解析XML比使用python-docx库更可靠，特别是处理复杂表格和图片时。

## 提取步骤

### 1. 使用zipfile打开Word文档

```python
import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile(docx_path, 'r') as zf:
    # 读取document.xml
    with zf.open('word/document.xml') as f:
        content = f.read().decode('utf-8')
        root = ET.fromstring(content)
```

### 2. 定义XML命名空间

```python
ns = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}
```

### 3. 提取段落文字

```python
paragraphs = body.findall('.//w:p', ns)
for para in paragraphs:
    texts = para.findall('.//w:t', ns)
    para_text = ''.join(t.text for t in texts if t.text)
```

### 4. 提取表格（关键步骤）

```python
tables = body.findall('.//w:tbl', ns)
for table in tables:
    rows = table.findall('.//w:tr', ns)
    for row in rows:
        cells = row.findall('.//w:tc', ns)
        for cell in cells:
            # 提取单元格文字
            texts = cell.findall('.//w:t', ns)
            cell_text = ''.join(t.text for t in texts if t.text)
            
            # 提取单元格中的图片（见步骤5）
            
            # 检查合并单元格
            grid_span = cell.find('.//w:gridSpan', ns)
            colspan = grid_span.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if grid_span else '1'
```

### 5. 提取表格中的图片（核心难点）

图片在Word XML中存储在`<w:drawing>`元素内，需要处理两种类型：inline和anchor。

```python
# 提取图片
drawing_elements = cell.findall('.//w:drawing', ns)
for drawing in drawing_elements:
    # 查找图片关系ID - 同时处理inline和anchor类型
    wp_ns = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
    inline = drawing.find('.//wp:inline', {'wp': wp_ns})
    anchor = drawing.find('.//wp:anchor', {'wp': wp_ns})
    
    # 确定使用哪个元素
    target_element = inline if inline is not None else anchor
    
    if target_element is not None:
        graphic = target_element.find('.//a:graphic', {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'})
        if graphic is not None:
            graphic_data = graphic.find('.//a:graphicData', {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'})
            if graphic_data is not None:
                pic = graphic_data.find('.//pic:pic', {'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture'})
                if pic is not None:
                    blip = pic.find('.//a:blip', {'a': 'http://schemas.openxmlformats.org/drawingml/2006/main'})
                    if blip is not None:
                        # 获取图片关系ID
                        rId = blip.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                        if rId:
                            # 从rels文件中获取图片路径
                            rels_path = 'word/_rels/document.xml.rels'
                            if rels_path in zf.namelist():
                                with zf.open(rels_path) as rels_file:
                                    rels_content = rels_file.read().decode('utf-8')
                                    rels_root = ET.fromstring(rels_content)
                                    rels_ns = {'r': 'http://schemas.openxmlformats.org/package/2006/relationships'}
                                    for rel in rels_root.findall('.//r:Relationship', rels_ns):
                                        if rel.get('Id') == rId:
                                            target = rel.get('Target')
                                            if target:
                                                # 提取图片文件名
                                                img_name = os.path.basename(target)
                                                img_path_in_doc = f'word/{target}'
                                                if img_path_in_doc in zf.namelist():
                                                    # 保存图片到本地
                                                    img_save_path = os.path.join(images_dir, f'{doc_file}_{img_name}')
                                                    with zf.open(img_path_in_doc) as img_file:
                                                        with open(img_save_path, 'wb') as f:
                                                            f.write(img_file.read())
                                                    # 添加图片到单元格内容
                                                    img_rel_path = f'images/{doc_file}_{img_name}'
                                                    cell_content += f'<img src="{img_rel_path}" style="max-width: 100%; height: auto;" />'
```

### 6. 处理合并单元格

```python
# 检查横向合并（colspan）
grid_span = cell.find('.//w:gridSpan', ns)
colspan = grid_span.get('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}val') if grid_span else '1'

# 检查纵向合并（rowspan）
# 需要在处理表格时跟踪合并状态
```

### 7. 生成HTML

```python
html_template = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <title>{title}</title>
    <!-- 引入CSS -->
</head>
<body>
    <!-- 页面结构 -->
    <div class="article-body">
        {content}
    </div>
</body>
</html>'''
```

## 关键注意事项

### 1. 图片提取的完整路径

```
word/document.xml
  └─ w:drawing
      ├─ wp:inline 或 wp:anchor
          └─ a:graphic
              └─ a:graphicData
                  └─ pic:pic
                      └─ a:blip (包含r:embed属性，即rId)

word/_rels/document.xml.rels
  └─ r:Relationship (Id匹配rId，Target指向图片路径)

word/media/image1.jpeg (实际图片文件)
```

### 2. 命名空间处理

- XML元素查找时必须使用完整命名空间URI
- 属性获取时也要注意命名空间前缀
- 关系文件(rels)使用不同的命名空间

### 3. 图片文件名处理

- 使用`{doc_file}_{img_name}`格式命名，避免不同文档间图片重名
- 图片路径使用相对路径`images/xxx`，便于HTML引用

### 4. 表格样式

- 使用`max-width: 100%; height: auto;`确保图片自适应
- 添加响应式表格容器`overflow-x: auto`
- 小屏幕使用`font-size: 11px; word-break: break-word;`

## 完整代码示例

见 `extract_company_tables.py` 文件，包含完整的提取逻辑。

## 常见问题

1. **图片不显示**：检查rels文件解析是否正确，确保rId匹配
2. **表格错位**：检查合并单元格(colspan/rowspan)处理
3. **文字丢失**：确保遍历所有`<w:t>`元素并合并文本
4. **命名空间错误**：使用完整的URI而不是前缀

## 使用流程

1. 准备Word文档文件夹
2. 运行提取脚本
3. 检查生成的HTML和图片
4. 根据需要调整表格样式
5. 验证所有图片正确显示在表格中
