#!/usr/bin/env python3

# Read the file and find the exact location
with open('src/components/ClientDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the subscription content section (line 20695 from grep)
count = 0
for i, line in enumerate(lines):
    if "activeTab === 'subscription'" in line and 'activeTab === \'properties\'' not in line:
        count += 1
        if count == 2:  # Get the second occurrence
            print(f"Found subscription content at line {i+1}")
            # Print surrounding lines
            for j in range(max(0, i-2), min(len(lines), i+25)):
                print(f"{j+1}: {repr(lines[j][:100])}")
            break

