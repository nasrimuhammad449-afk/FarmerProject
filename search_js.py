import re

with open('tests/static/js/app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Total lines:", len(lines))

# Search for lines containing "admin" or "/api/admin"
for idx, line in enumerate(lines):
    if 'admin' in line.lower() or '/api/admin' in line:
        print(f"Line {idx+1}: {line.strip()[:100]}")
