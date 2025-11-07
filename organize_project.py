#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目文档整理和测试文件清理脚本
用途：整理 docs 文件夹中的文档，清理 test_ 开头的测试文件
"""

import os
import shutil
from pathlib import Path
from datetime import datetime
import json

class ProjectOrganizer:
    def __init__(self, workspace_path):
        self.workspace = Path(workspace_path)
        self.docs_path = self.workspace / 'docs'
        self.backup_path = self.workspace / 'backup'
        self.report = {
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'organized_files': [],
            'deleted_test_files': [],
            'moved_files': [],
            'errors': []
        }
    
    def create_backup(self):
        """创建备份文件夹"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_dir = self.backup_path / f'backup_{timestamp}'
        backup_dir.mkdir(parents=True, exist_ok=True)
        return backup_dir
    
    def organize_docs(self, move_files=False):
        """整理 docs 文件夹中的文档"""
        print("📁 开始整理文档...")
        
        if not self.docs_path.exists():
            print(f"❌ 文档文件夹不存在: {self.docs_path}")
            return
        
        # 定义文档分类规则（目录名 -> 关键词列表）
        category_mapping = {
            '01-核心文档': ['README', '项目交付', '功能清单', '验收清单', '项目完成总结', '项目文件树'],
            '02-快速启动指南': ['快速开始', '快速测试', '开发启动', '部署', '快速'],
            '03-修复报告': ['修复', 'debug', 'fix', '同步问题'],
            '04-功能开发报告': ['功能说明', '功能开发'],
            '05-修复报告': ['修复报告', '修复步骤', '修复总结'],
            '05-项目管理文档': ['小红书', 'MVP', '优化建议'],
            '06-开发者工具': ['测试', 'test'],
            '06-数据库脚本': ['数据库', 'MySQL', 'SQL'],
            '07-资源文件': [],
            '08-员工工作汇报': [],
            '09-项目经理工作汇报': [],
        }
        
        # AI相关文档特殊处理（可以放到功能开发报告）
        ai_keywords = ['AI', 'Supabase', '供应商配置', '提示词', '生成示例', '发送数据']
        
        # 激活系统相关文档（可以放到修复报告或功能开发）
        activation_keywords = ['激活码', '激活状态', '激活系统']
        
        # 优化报告相关
        optimization_keywords = ['优化', '改进', '浅色模式', '雷达图', '测评页面', '题库', '结果算法', '对比度']
        
        # 使用指南相关
        guide_keywords = ['使用指南', '使用手册', '集成完成']
        
        # 获取根目录下的所有 .md 和 .html 文件（不包括子目录）
        root_files = [f for f in self.docs_path.glob('*') if f.is_file() and (f.suffix == '.md' or f.suffix == '.html' or f.suffix == '.txt')]
        
        print(f"\n找到根目录下 {len(root_files)} 个需要整理的文件")
        
        # 统计现有文件夹
        existing_dirs = [d for d in self.docs_path.iterdir() if d.is_dir()]
        print(f"现有文件夹: {len(existing_dirs)} 个\n")
        
        # 分类文件
        categorized = {}
        for file in root_files:
            category = self._categorize_file(file, category_mapping, ai_keywords, activation_keywords, optimization_keywords, guide_keywords)
            if category not in categorized:
                categorized[category] = []
            categorized[category].append(file)
        
        # 显示分类结果
        print("📋 文档分类结果：\n")
        for category, files in sorted(categorized.items()):
            print(f"  📂 {category} ({len(files)} 个文件)")
            for f in files:
                print(f"     - {f.name}")
        
        # 移动文件
        if move_files:
            print("\n📦 开始移动文件...\n")
            for category, files in categorized.items():
                target_dir = self.docs_path / category
                target_dir.mkdir(exist_ok=True)
                
                for file in files:
                    try:
                        target_file = target_dir / file.name
                        if target_file.exists():
                            print(f"  ⚠️  跳过（已存在）: {file.name} -> {category}")
                            continue
                        
                        shutil.move(str(file), str(target_file))
                        self.report['moved_files'].append({
                            'file': file.name,
                            'from': 'docs/',
                            'to': f'docs/{category}/'
                        })
                        print(f"  ✅ 已移动: {file.name} -> {category}")
                    except Exception as e:
                        error_msg = f"移动 {file.name} 到 {category} 时出错: {str(e)}"
                        print(f"  ❌ {error_msg}")
                        self.report['errors'].append(error_msg)
            
            print(f"\n✅ 已移动 {sum(len(files) for files in categorized.values())} 个文件")
        else:
            print("\n⚠️  预览模式 - 不会移动文件")
            print("💡 如需移动文件，请运行: python organize_project.py --organize")
        
        self.report['organized_files'].append({
            'total_root_files': len(root_files),
            'existing_directories': len(existing_dirs),
            'categorized': {cat: len(files) for cat, files in categorized.items()}
        })
    
    def _categorize_file(self, file, category_mapping, ai_keywords, activation_keywords, optimization_keywords, guide_keywords):
        """根据文件名智能分类文档"""
        filename = file.name.lower()
        
        # AI相关文档
        if any(keyword.lower() in filename for keyword in ai_keywords):
            if 'supabase' in filename and ('部署' in filename or '快速' in filename):
                return '02-快速启动指南'
            return '04-功能开发报告'
        
        # 激活系统相关
        if any(keyword.lower() in filename for keyword in activation_keywords):
            if '修复' in filename or 'debug' in filename or '检查' in filename:
                return '03-修复报告'
            elif '测试' in filename or 'test' in filename:
                return '06-开发者工具'
            elif '使用指南' in filename:
                return '02-快速启动指南'
            elif '流程图' in filename or '逻辑' in filename:
                return '04-功能开发报告'
            return '03-修复报告'
        
        # 优化报告相关
        if any(keyword in filename for keyword in optimization_keywords):
            return '05-修复报告'
        
        # 使用指南相关
        if any(keyword in filename for keyword in guide_keywords):
            if '管理员' in filename:
                return '02-快速启动指南'
            return '04-功能开发报告'
        
        # 按照预定义的分类规则
        for category, keywords in category_mapping.items():
            if any(keyword.lower() in filename for keyword in keywords):
                return category
        
        # 特殊文件处理
        if 'test-' in filename or 'test_' in filename:
            return '06-开发者工具'
        
        if '小红书' in filename or 'mvp' in filename:
            return '05-项目管理文档'
        
        if '扣次数' in filename or '每日限制' in filename:
            return '03-修复报告'
        
        if '导航栏' in filename or '首页' in filename:
            return '04-功能开发报告'
        
        # 默认放到核心文档
        return '01-核心文档'
    
    def find_test_files(self):
        """查找所有测试文件"""
        print("\n🔍 查找测试文件...")
        
        test_patterns = ['test_*.js', 'test-*.js', 'test_*.ps1', 'test-*.html']
        test_files = []
        
        for pattern in test_patterns:
            files = list(self.workspace.glob(pattern))
            test_files.extend(files)
        
        # 也查找 backend 文件夹中的测试文件
        backend_path = self.workspace / 'backend'
        if backend_path.exists():
            for pattern in ['test_*.js', 'test-*.js']:
                files = list(backend_path.glob(pattern))
                test_files.extend(files)
        
        # 去重
        test_files = list(set(test_files))
        
        print(f"找到 {len(test_files)} 个测试文件:")
        for f in test_files:
            size_kb = f.stat().st_size / 1024
            print(f"  📄 {f.relative_to(self.workspace)} ({size_kb:.1f} KB)")
        
        return test_files
    
    def clean_test_files(self, delete=False):
        """清理测试文件"""
        test_files = self.find_test_files()
        
        if not test_files:
            print("\n✅ 没有找到需要清理的测试文件")
            return
        
        if delete:
            print("\n🗑️  开始清理测试文件...")
            backup_dir = self.create_backup()
            backup_test_dir = backup_dir / 'test_files'
            backup_test_dir.mkdir(exist_ok=True)
            
            for test_file in test_files:
                try:
                    # 备份到 backup 文件夹
                    relative_path = test_file.relative_to(self.workspace)
                    backup_file = backup_test_dir / relative_path.name
                    shutil.copy2(test_file, backup_file)
                    
                    # 删除原文件
                    test_file.unlink()
                    
                    self.report['deleted_test_files'].append({
                        'file': str(relative_path),
                        'size_kb': test_file.stat().st_size / 1024 if test_file.exists() else 0,
                        'backup': str(backup_file.relative_to(self.workspace))
                    })
                    print(f"  ✅ 已删除: {relative_path}")
                    
                except Exception as e:
                    error_msg = f"删除 {test_file} 时出错: {str(e)}"
                    print(f"  ❌ {error_msg}")
                    self.report['errors'].append(error_msg)
            
            print(f"\n✅ 已删除 {len(test_files)} 个测试文件")
            print(f"📦 备份位置: {backup_dir.relative_to(self.workspace)}")
        else:
            print("\n⚠️  预览模式 - 不会删除文件")
            print("💡 如需删除，请运行: python organize_project.py --delete")
    
    def generate_docs_index(self):
        """生成文档索引"""
        print("\n📋 生成文档索引...")
        
        index_content = f"""# 文档索引

> 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📁 文档目录结构

"""
        
        total_files = 0
        
        # 遍历 docs 文件夹
        if self.docs_path.exists():
            # 获取所有子目录并排序
            subdirs = sorted([d for d in self.docs_path.iterdir() if d.is_dir()])
            
            for subdir in subdirs:
                # 获取所有文件（不仅仅是.md）
                all_files = sorted([f for f in subdir.iterdir() if f.is_file()])
                file_count = len(all_files)
                total_files += file_count
                
                index_content += f"\n### 📂 {subdir.name} ({file_count} 个文件)\n\n"
                
                if file_count > 0:
                    for file in all_files:
                        rel_path = file.relative_to(self.docs_path)
                        # 根据文件类型添加不同的图标
                        if file.suffix == '.md':
                            icon = '📝'
                        elif file.suffix == '.html':
                            icon = '🌐'
                        elif file.suffix == '.txt':
                            icon = '📄'
                        elif file.suffix == '.sql':
                            icon = '🗄️'
                        else:
                            icon = '📎'
                        index_content += f"- {icon} [{file.name}](./{rel_path.as_posix()})\n"
                else:
                    index_content += "*（暂无文件）*\n"
            
            # 列出根目录的文档
            root_files = sorted([f for f in self.docs_path.glob('*') if f.is_file() and f.name != 'INDEX.md'])
            if root_files:
                index_content += f"\n### 📄 根目录文档 ({len(root_files)} 个文件)\n\n"
                for file in root_files:
                    if file.suffix == '.md':
                        icon = '📝'
                    elif file.suffix == '.html':
                        icon = '🌐'
                    else:
                        icon = '📎'
                    index_content += f"- {icon} [{file.name}](./{file.name})\n"
                total_files += len(root_files)
        
        # 添加统计信息
        index_content += f"\n---\n\n**📊 统计**: 共 {len(subdirs)} 个目录，{total_files} 个文件\n"
        
        # 保存索引文件
        index_file = self.docs_path / 'INDEX.md'
        index_file.write_text(index_content, encoding='utf-8')
        print(f"✅ 文档索引已生成: {index_file.relative_to(self.workspace)}")
        print(f"   共索引 {len(subdirs)} 个目录，{total_files} 个文件")
    
    def save_report(self):
        """保存整理报告"""
        report_file = self.workspace / f'organize_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.report, f, ensure_ascii=False, indent=2)
        print(f"\n📊 整理报告已保存: {report_file.name}")
    
    def run(self, delete_tests=False, organize_docs=False):
        """运行整理流程"""
        print("=" * 60)
        print("🚀 项目文档整理和测试文件清理工具")
        print("=" * 60)
        
        # 整理文档
        self.organize_docs(move_files=organize_docs)
        
        # 生成文档索引
        if organize_docs:
            self.generate_docs_index()
        
        # 清理测试文件
        if delete_tests or organize_docs:
            self.clean_test_files(delete=delete_tests)
        
        # 保存报告
        self.save_report()
        
        print("\n" + "=" * 60)
        print("✅ 整理完成!")
        print("=" * 60)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='项目文档整理和测试文件清理工具')
    parser.add_argument('--delete', action='store_true', help='删除测试文件（默认只预览）')
    parser.add_argument('--organize', action='store_true', help='整理文档并移动到对应目录（默认只预览）')
    parser.add_argument('--workspace', type=str, default='.', help='工作区路径（默认为当前目录）')
    
    args = parser.parse_args()
    
    workspace = Path(args.workspace).resolve()
    organizer = ProjectOrganizer(workspace)
    organizer.run(delete_tests=args.delete, organize_docs=args.organize)

if __name__ == '__main__':
    main()

