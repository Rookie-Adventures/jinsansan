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
    
    try:
        jscpd_result = os.path.join(REPORT_DIR, 'jscpd-qwen.json')
        results = load_cached_results(jscpd_result)
        analyzed_pairs = {frozenset(result["files"]) for result in results}
        
        jscpd_report = os.path.join(REPORT_DIR, 'jscpd-report.json')
        with open(jscpd_report, 'r', encoding='utf-8') as f:
            jscpd_data = json.load(f)
        
        duplicates = jscpd_data.get('duplicates', [])
        total_duplicates = len(duplicates)
        
        for i in range(0, total_duplicates, batch_size):
            try:
                batch = duplicates[i:i + batch_size]
                print(f"\n分析第 {i+1}-{min(i+batch_size, total_duplicates)} 对重复文件")
                
                # 获取相关文件
                related_files = set()
                for dup in batch:
                    file_pair = frozenset([
                        dup.get("firstFile", {}).get("name", ""),
                        dup.get("secondFile", {}).get("name", "")
                    ])
                    if file_pair in analyzed_pairs:
                        continue
                        
                    # 从重复代码对象中正确提取文件路径
                    first_file = dup.get("firstFile", {}).get("name", "")
                    second_file = dup.get("secondFile", {}).get("name", "")
                    
                    if first_file:
                        related_files.update(get_related_files(first_file))
                    if second_file:
                        related_files.update(get_related_files(second_file))
                    
                    analyzed_pairs.add(file_pair)
                
                prompt = f"""分析以下重复代码:

{json.dumps(batch, indent=2, ensure_ascii=False)}

相关文件:
{json.dumps(list(related_files), indent=2, ensure_ascii=False)}

请分析:
1. 重复代码的功能（描述重复代码的主要功能和用途）
2. 两个文件的用途（文件的作用和上下文）
3. 是否可以合并（明确哪些重复代码可以合并，哪些不可）
4. 修改会影响哪些文件（分析代码修改对其他文件的潜在影响）
5. 如果重复代码有特殊用途（如测试覆盖），请注明这一点，避免误重构
"""
                
                analysis = call_qwen(prompt)
                
                results.extend([{
                    "files": [dup.get("firstFile", {}).get("name", ""), 
                             dup.get("secondFile", {}).get("name", "")],
                    "duplicated_lines": dup.get("lines", []),
                    "related_files": list(related_files),
                    "analysis": analysis
                } for dup in batch])
                
                # 保存结果
                try:
                    with open(jscpd_result, 'w', encoding='utf-8') as f:
                        json.dump(results, f, indent=2, ensure_ascii=False)
                except Exception as e:
                    print(f"保存结果失败: {e}")
                    
                sleep(1)
                
            except Exception as e:
                print(f"处理批次 {i+1}-{min(i+batch_size, total_duplicates)} 时出错: {e}")
                continue  # 继续处理下一批次
                
    except Exception as e:
        print(f"代码重复分析失败: {e}")
        return []
    
    print("代码重复分析完成")
    return results

def analyze_eslint_errors(batch_size: int = 3):
    """分批分析 ESLint 错误"""
    print("开始分析 ESLint 错误...")
    
    try:
        eslint_report = os.path.join(REPORT_DIR, 'eslint-report.json')
        with open(eslint_report, 'r', encoding='utf-8') as f:
            eslint_data = json.load(f)
        
        results = []
        issues = eslint_data.get('issues', [])
        total_issues = len(issues)
        
        for i in range(0, total_issues, batch_size):
            try:
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
5. 如果问题是某些特殊测试的需求，需特别注明
"""
                
                analysis = call_qwen(prompt)
                
                results.extend([{
                    "file": issue.get("file", ""),
                    "errors": issue.get("errors", []),
                    "related_files": related_files.get(issue.get("file", ""), []),
                    "analysis": analysis
                } for issue in batch])
                
                # 每个批次都保存一次结果
                eslint_result = os.path.join(REPORT_DIR, 'eslint-qwen.json')
                with open(eslint_result, 'w', encoding='utf-8') as f:
                    json.dump(results, f, indent=2, ensure_ascii=False)
                    
            except Exception as e:
                print(f"处理批次 {i+1}-{min(i+batch_size, total_issues)} 时出错: {e}")
                continue  # 继续处理下一批次
                
    except Exception as e:
        print(f"分析过程中出错: {e}")
        return []
        
    return results

def load_cached_results(result_file: str) -> list:
    """加载缓存的分析结果"""
    if os.path.exists(result_file):
        try:
            with open(result_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()  # 读取并去除空白
                if not content:  # 如果文件为空
                    return []
                return json.load(f)
        except Exception as e:
            print(f"读取缓存文件失败: {e}")
    return []

def main():
    """主函数"""
    try:
        required_files = [
            os.path.join(REPORT_DIR, 'eslint-report.json'),
            os.path.join(REPORT_DIR, 'jscpd-report.json')
        ]
        
        for file in required_files:
            if not os.path.exists(file):
                print(f"错误: 找不到文件 {file}")
                return
        
        # 分别处理每种分析，即使一个失败也不影响另一个
        try:
            print("\n开始 ESLint 错误分析...")
            eslint_results = analyze_eslint_errors()
        except Exception as e:
            print(f"ESLint 分析失败: {e}")
            
        try:
            print("\n开始代码重复分析...")
            jscpd_results = analyze_duplicates()
        except Exception as e:
            print(f"代码重复分析失败: {e}")
            
    except Exception as e:
        print(f"程序执行出错: {e}")
    finally:
        print("\n分析完成!")

if __name__ == "__main__":
    main()
