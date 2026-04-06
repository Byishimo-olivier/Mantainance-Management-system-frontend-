#!/usr/bin/env python3
import re

# Read the file
with open('src/components/ClientDashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Use a simpler, more direct approach - find the subscription closing pattern
# Find: "          )}" followed by blank lines and then start of properties pattern
pattern = r'(\{activeTab === \'subscription\'.*?\}\))\s+(\{/\*.*?Properties)'

replacement = r'''\1

          {/* Tasks Tab */}
          {activeTab === 'tasks' && <TaskDashboard />}

          \2'''

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write the file back
with open('src/components/ClientDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

if "{activeTab === 'tasks' && <TaskDashboard />}" in content:
    print("Tasks tab added successfully")
else:
    print("ERROR: Tasks tab was not added")

