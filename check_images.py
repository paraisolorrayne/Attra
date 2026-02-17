import os
import re

base = os.path.dirname(os.path.abspath(__file__))

files = [
    "public/images/blog-old/2025/05/WhatsApp-Image-2025-04-28-at-16.31.16-2048x1536.jpeg",
    "public/images/blog-old/2025/03/IMG-20240820-WA0005-1024x768.jpg",
    "public/images/blog-old/2025/04/WhatsApp-Image-2025-04-23-at-14.33.06-1024x768.jpeg",
    "public/images/blog-old/2024/11/IMG-20240710-WA0181-1024x768.jpg",
    "public/images/blog-old/2025/05/WhatsApp-Image-2025-05-09-at-14.35.20-1024x768.jpeg",
    "public/images/blog-old/2025/05/WhatsApp-Image-2025-04-28-at-16.31.16-1024x768.jpeg",
    "public/images/blog-old/2025/05/WhatsApp-Image-2025-05-06-at-19.04.17-1024x576.jpeg",
    "public/images/blog-old/2025/03/WhatsApp-Image-2025-03-14-at-11.32.24-1024x768.jpeg",
    "public/images/blog-old/2025/03/IMG-20240820-WA0005.jpg",
    "public/images/blog-old/2024/10/IMG-20240930-WA0393-1024x768.jpg",
    "public/images/blog-old/2025/01/IMG-20241213-WA0103-1024x768.jpg",
]

print("=== Featured images for problematic posts ===")
missing_count = 0
exists_count = 0
for f in files:
    full = os.path.join(base, f)
    if os.path.isfile(full):
        exists_count += 1
        print(f"  EXISTS:  {os.path.basename(f)}")
    else:
        missing_count += 1
        print(f"  MISSING: {os.path.basename(f)}")

print(f"\nResult: {exists_count} exist, {missing_count} missing")

# Overall stats
blog_file = os.path.join(base, "src/lib/imported-blog-posts.ts")
with open(blog_file, "r") as fh:
    content = fh.read()

refs = set(re.findall(r'/images/blog-old/[^\s"\\,]+', content))
missing_refs = []
existing_refs = []
for ref in sorted(refs):
    full = os.path.join(base, "public" + ref)
    if os.path.isfile(full):
        existing_refs.append(ref)
    else:
        missing_refs.append(ref)

print(f"\n=== Overall blog image status ===")
print(f"Total unique image refs: {len(refs)}")
print(f"Existing on disk: {len(existing_refs)}")
print(f"Missing from disk: {len(missing_refs)}")

