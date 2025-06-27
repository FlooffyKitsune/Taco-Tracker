#!/bin/bash
echo "🌮 Building Taco Tracker..."
npm run build 2>&1 | tee build.log
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Check build.log for details."
    cat build.log
fi
