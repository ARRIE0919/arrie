# 视频压缩指南

## 步骤1：下载并安装FFmpeg

1. 访问 [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. 点击 "Windows" 部分的 "Windows builds from gyan.dev"
3. 下载 "ffmpeg-release-essentials.zip"
4. 解压到一个方便的位置，例如 `C:\ffmpeg`
5. 将 `C:\ffmpeg\bin` 添加到系统环境变量PATH中

## 步骤2：运行压缩脚本

### 压缩脚本
```python
import os
import subprocess

# 搜索作品集文件夹下的所有视频
video_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv']
video_paths = []

for root, dirs, files in os.walk('作品集'):
    for file in files:
        if any(file.lower().endswith(ext) for ext in video_extensions):
            video_paths.append(os.path.join(root, file))

print(f"找到 {len(video_paths)} 个视频文件")

# 压缩视频函数
def compress_video(input_path, max_width=1920, target_bitrate='2M'):
    try:
        # 获取文件名和目录
        dir_name = os.path.dirname(input_path)
        base_name = os.path.basename(input_path)
        name_without_ext = os.path.splitext(base_name)[0]
        output_ext = os.path.splitext(base_name)[1]
        output_path = os.path.join(dir_name, f"{name_without_ext}_compressed{output_ext}")
        
        print(f"\n处理: {input_path}")
        
        # 构建FFmpeg命令
        ffmpeg_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', f'scale={max_width}:-2',
            '-c:v', 'libx264',
            '-b:v', target_bitrate,
            '-preset', 'medium',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-y',
            output_path
        ]
        
        # 执行压缩命令
        print("开始压缩...")
        ffmpeg_result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        
        if ffmpeg_result.returncode != 0:
            print(f"压缩失败: {ffmpeg_result.stderr}")
            return False
        
        # 替换原始文件
        os.replace(output_path, input_path)
        
        # 获取压缩后的文件大小
        compressed_size = os.path.getsize(input_path)
        print(f"压缩后文件大小: {compressed_size / (1024 * 1024):.2f} MB")
        
        return True
    except Exception as e:
        print(f"处理失败: {e}")
        return False

# 处理所有视频
success_count = 0
fail_count = 0

for video_path in video_paths:
    if compress_video(video_path):
        success_count += 1
    else:
        fail_count += 1

print(f"\n处理完成！")
print(f"成功: {success_count} 个")
print(f"失败: {fail_count} 个")
```

### 运行方法
1. 将上述代码保存为 `compress_videos.py`
2. 打开命令提示符，切换到 `d:\Users\ARRIE\Desktop\ARRIE3` 目录
3. 运行 `python compress_videos.py`

## 压缩参数说明

- **max_width**: 视频最大宽度，默认1920（1080P）
- **target_bitrate**: 视频比特率，默认2M（2000kbps）
- **preset**: 压缩预设，medium平衡了压缩速度和质量
- **audio_bitrate**: 音频比特率，128k保证基本音频质量

## 预期效果

- 保持原始视频的长宽比
- 保持原始文件名不变
- 压缩后的视频大小适合网站使用
- 保证网站加载时的速率较快

## 替代方案

如果不想安装FFmpeg，可以使用以下在线工具：

1. [CloudConvert](https://cloudconvert.com/video-compressor)
2. [Online Video Compressor](https://www.onlinevideocompress.com/)
3. [Clipchamp](https://clipchamp.com/en/video-compressor/)

这些工具都支持批量压缩视频，操作简单，适合快速处理少量视频文件。