with open('.gitignore', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line not in new_lines or line.strip() == '':
        new_lines.append(line)

with open('.gitignore', 'w') as f:
    f.writelines(new_lines)
