#!/bin/bash

# Logo Creator 启动脚本
cd "$(dirname "$0")"

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "🚀 启动 Logo Creator..."
npm run electron:dev

