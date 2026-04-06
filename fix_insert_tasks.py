#!/usr/bin/env python3

# Read the file
with open('src/components/ClientDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the subscription section and its closing line
# We're looking for the pattern: {activeTab === 'subscription' && (
# with structure: ... )} at line close matching the outer level
sub_start = None
for i, line in enumerate(lines):
    if "{activeTab === 'subscription' && (" in line and "userData" not in line:
        # Check if this is around line 20695 (our target area, not the earlier section)
        if i  > 20000:
            sub_start = i
            break

if sub_start is not None:
    print(f"Found subscription start at line {sub_start + 1}")
    
    # Now find its closing )} - count braces
    brace_count = 0
    for j in range(sub_start, len(lines)):
        brace_count += lines[j].count('{') - lines[j].count('}')
        if brace_count == 0 and j > sub_start:
            # This line closes the subscription section
            print(f"Found subscription end at line {j + 1}")
            
            # Insert after this line
            insert_pos = j + 1
            
            # Find the next blank line if present
            if insert_pos < len(lines) and lines[insert_pos].strip() == '':
                insert_pos += 1
            
            # Create the tasks code
            tasks_lines = [
                '\n',
                '          {/* Tasks Tab */}\n',
                "          {activeTab === 'tasks' && <TaskDashboard />}\n"
            ]
            
            # Insert
            for k, task_line in enumerate(tasks_lines):
                lines.insert(insert_pos + k, task_line)
            
            print(f"Inserted tasks code at line {insert_pos + 1}")
            break
    
    # Write back
    with open('src/components/ClientDashboard.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File updated successfully")
else:
    print("ERROR: Could not find subscription section in content area")
