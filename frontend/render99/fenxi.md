import json
import os
import requests
from typing import List, Dict, Set
from time import sleep
from openai import OpenAI

# API 配置
REPORT_DIR = "D:/jinsansan/frontend/render99"  # 报告文件所在目录

# 初始化通义千问客户端
client = OpenAI(
    api_key="sk-5096ea47ca4c4b9ab8b8c54cbc25e3a2",  # 直接使用密钥
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1"
)

def call_qwen(prompt: str) -> str:
    """调用通义千问 API"""
    try:
        completion = client.chat.completions.create(
            model="qwen-max-latest",  # 使用最新的 max 模型
            messages=[
                {"role": "system", "content": "你是一个代码分析专家，请帮助分析代码问题。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1  # 保持低温度以获得稳定输出
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"调用通义千问 API 出错: {e}")
        return ""

def get_related_files(file_path: str) -> Set[str]:
    """查找与指定文件相关的文件"""
    related_files = set()
    
    try:
        # 构建完整的文件路径
        full_path = os.path.join(REPORT_DIR, '..', file_path)  # 往上一级到frontend目录
        full_path = os.path.normpath(full_path)  # 规范化路径
        
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 查找导入语句
        import re
        patterns = [
            r'import .* from [\'"]([^\'"]+)[\'"]',
            r'require\([\'"]([^\'"]+)[\'"]\)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                imported_path = match.group(1)
                if imported_path.startswith('@/'):
                    # 处理 @/ 别名
                    path = imported_path.replace('@/', 'src/')
                    full_import_path = os.path.join(REPORT_DIR, '..', path)
                    if os.path.exists(full_import_path):
                        related_files.add(full_import_path)
                elif imported_path.startswith('.'):
                    # 处理相对路径
                    base_dir = os.path.dirname(full_path)
                    abs_path = os.path.normpath(os.path.join(base_dir, imported_path))
                    if os.path.exists(abs_path):
                        related_files.add(abs_path)
                        
    except Exception as e:
        print(f"分析文件 {file_path} 关联关系时出错: {e}")
    
    return related_files

def analyze_duplicates(batch_size: int = 2):
    """分批分析重复代码"""
    print("\n开始分析代码重复...")
    
    jscpd_report = os.path.join(REPORT_DIR, 'jscpd-report.json')
    with open(jscpd_report, 'r', encoding='utf-8') as f:
        jscpd_data = json.load(f)
    
    results = []
    duplicates = jscpd_data.get('duplicates', [])
    total_duplicates = len(duplicates)
    
    for i in range(0, total_duplicates, batch_size):
        batch = duplicates[i:i + batch_size]
        print(f"\n分析第 {i+1}-{min(i+batch_size, total_duplicates)} 对重复文件")
        
        # 获取相关文件
        related_files = set()
        for dup in batch:
            # 从重复代码对象中正确提取文件路径
            first_file = dup.get("firstFile", {}).get("name", "")
            second_file = dup.get("secondFile", {}).get("name", "")
            
            if first_file:
                related_files.update(get_related_files(first_file))
            if second_file:
                related_files.update(get_related_files(second_file))
        
        prompt = f"""分析以下重复代码:

{json.dumps(batch, indent=2, ensure_ascii=False)}

相关文件:
{json.dumps(list(related_files), indent=2, ensure_ascii=False)}

请分析:
1. 重复代码的功能
2. 两个文件的用途
3. 是否可以合并
4. 修改会影响哪些文件
"""
        
        analysis = call_qwen(prompt)
        
        results.extend([{
            "files": [dup.get("firstFile", {}).get("name", ""), 
                     dup.get("secondFile", {}).get("name", "")],
            "duplicated_lines": dup.get("lines", []),
            "related_files": list(related_files),
            "analysis": analysis
        } for dup in batch])
        
        jscpd_result = os.path.join(REPORT_DIR, 'jscpd-qwen.json')
        with open(jscpd_result, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        sleep(1)
    
    print("代码重复分析完成")

def analyze_eslint_errors(batch_size: int = 3):
    """分批分析 ESLint 错误"""
    print("开始分析 ESLint 错误...")
    
    eslint_report = os.path.join(REPORT_DIR, 'eslint-report.json')
    with open(eslint_report, 'r', encoding='utf-8') as f:
        eslint_data = json.load(f)
    
    results = []
    issues = eslint_data.get('issues', [])
    total_issues = len(issues)
    
    for i in range(0, total_issues, batch_size):
        batch = issues[i:i + batch_size]
        print(f"\n分析第 {i+1}-{min(i+batch_size, total_issues)} 个问题")
        
        # 获取相关文件
        related_files = {}
        for issue in batch:
            file_path = issue["file"]
            related = get_related_files(file_path)
            if related:
                related_files[file_path] = list(related)
        
        prompt = f"""分析以下代码问题:

{json.dumps(batch, indent=2, ensure_ascii=False)}

相关文件:
{json.dumps(related_files, indent=2, ensure_ascii=False)}

请分析:
1. 错误位置和类型
2. 是否是未使用代码或导入
3. 建议如何修改
4. 可能影响的关联文件
"""
        
        analysis = call_qwen(prompt)
        
        results.extend([{
            "file": issue["file"],
            "errors": issue["errors"],
            "related_files": related_files.get(issue["file"], []),
            "analysis": analysis
        } for issue in batch])
        
        eslint_result = os.path.join(REPORT_DIR, 'eslint-qwen.json')
        with open(eslint_result, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        sleep(1)
    
    print("ESLint 错误分析完成")

def main():
    """主函数"""
    required_files = [
        os.path.join(REPORT_DIR, 'eslint-report.json'),
        os.path.join(REPORT_DIR, 'jscpd-report.json')
    ]
    for file in required_files:
        if not os.path.exists(file):
            print(f"错误: 找不到文件 {file}")
            return
    
    analyze_eslint_errors()
    analyze_duplicates()
    
    print("\n分析完成!")

if __name__ == "__main__":
    main()