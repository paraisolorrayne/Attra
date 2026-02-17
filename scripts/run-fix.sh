#!/bin/bash
cd "$(dirname "$0")/.."

echo "=== Step 1: Run fix-missing-blog-images ==="
node scripts/fix-missing-blog-images.mjs 2>&1

echo ""
echo "=== Step 2: Count files after fix ==="
echo "Files in public/images/blog-old:"
find public/images/blog-old -type f 2>/dev/null | wc -l

echo ""
echo "=== Step 3: Check remaining WP URLs ==="
grep -c 'attraveiculos.com.br/wp-content/uploads' src/lib/imported-blog-posts.ts 2>/dev/null || echo "0"

echo ""
echo "=== Step 4: Check local refs count ==="
grep -c '/images/blog-old/' src/lib/imported-blog-posts.ts

echo ""
echo "=== DONE ==="

