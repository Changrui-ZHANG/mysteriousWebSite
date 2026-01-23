
import re
import shlex

file_path = r'c:\Changrui\Code\mysteriousWebSite\server\src\main\resources\idioms.sql'

def parse_line(line):
    # Extract contents of VALUES (...)
    match = re.search(r"VALUES \((.*)\) ON CONFLICT", line)
    if not match:
        return None
    
    content = match.group(1)
    
    # Simple semantic parser
    # Iterate characters, toggle state on '
    # handle '' escape
    
    values = []
    current_value = []
    in_quote = False
    i = 0
    while i < len(content):
        char = content[i]
        
        if char == "'":
            if i + 1 < len(content) and content[i+1] == "'":
                # Escaped quote
                current_value.append("'")
                i += 1
            else:
                # Toggle quote
                in_quote = not in_quote
        elif char == "," and not in_quote:
            values.append("".join(current_value).strip())
            current_value = []
            i += 1
            continue
        else:
            current_value.append(char)
        
        i += 1
    
    values.append("".join(current_value).strip())
    return values

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

errors_found = False
for i, line in enumerate(lines):
    if not line.strip() or line.strip().startswith('--') or line.strip().startswith('SET'):
        continue
        
    vals = parse_line(line)
    if not vals:
        print(f"Line {i+1}: Could not parse VALUES clause.")
        errors_found = True
        continue
        
    if len(vals) != 6:
        print(f"Line {i+1}: Incorrect column count. Expected 6, got {len(vals)}.")
        print(f"Parsed: {vals}")
        errors_found = True
    
    # Check 6th value (level) format
    # It should be 'B1', 'B2', 'C1', 'C2' or 'A2' quoted
    level = vals[5]
    clean_level = level.replace("'", "").strip()
    if clean_level not in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
         print(f"Line {i+1}: Invalid level '{level}'")

if not errors_found:
    print("No structural errors found.")
