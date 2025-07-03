#!/bin/bash

# Git提交脚本 - PDF布局修改

echo "检查Git状态..."
git status

echo "添加修改的文件..."
git add client/src/lib/gridRenderer.ts
git add PDF布局修改记录.md

echo "提交修改..."
git commit -m "feat: 优化PDF布局 - 去掉班级字段，姓名日期两端对齐

- 移除PDF导出中的班级字段
- 调整姓名和日期为两端对齐布局
- 将信息行位置调整到更接近格子线条
- 为用户提供更多填写空间
- 保持所有格子类型和模式的兼容性

修改文件:
- client/src/lib/gridRenderer.ts: 更新renderHeader函数
- PDF布局修改记录.md: 添加详细修改记录"

echo "推送到GitHub..."
git push origin main

echo "提交完成！"