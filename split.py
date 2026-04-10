import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Extract CSS
css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if css_match:
    css = css_match.group(1).strip()
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(css)
    content = content.replace(css_match.group(0), '<link rel="stylesheet" href="style.css">')

# Extract JS
js_match = re.search(r'<script>\s*(// Smooth scroll[^\0]*?)</script>', content, re.DOTALL)
if js_match:
    js = js_match.group(1).strip()
    with open("script.js", "w", encoding="utf-8") as f:
        f.write(js)
    content = content.replace(js_match.group(0), '<script src="script.js"></script>')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Split completed.")
