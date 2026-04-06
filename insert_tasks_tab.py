#!/usr/bin/env python3

# Read the file
with open('src/components/ClientDashboard.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with SubscriptionPlan and locate the closing )}
target_found = False
for i, line in enumerate(lines):
    if 'SubscriptionPlan userId' in line:
        # Found it, now find the closing )} after this
        for j in range(i, min(i+10, len(lines))):
            if ')}' in lines[j] and lines[j].strip() == ')}':
                # This is likely our closing line
                # Now insert tasks tab code after this blank line
                insert_pos = j + 2  # +1 for the line itself, +1 for the blank line
                
                # Create the tasks code lines
                tasks_lines = [
                    '          {/* Tasks Tab */}\n',
                    "          {activeTab === 'tasks' && <TaskDashboard />}\n",
                    '\n'
                ]
                
                # Insert the lines
                for k, task_line in enumerate(tasks_lines):
                    lines.insert(insert_pos + k, task_line)
                
                target_found = True
                print(f"Inserted tasks tab after line {j+1}")
                break
        
        if target_found:
            break

if target_found:
    # Write the file back
    with open('src/components/ClientDashboard.jsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("File updated successfully")
else:
    print("ERROR: Could not find insertion point")
