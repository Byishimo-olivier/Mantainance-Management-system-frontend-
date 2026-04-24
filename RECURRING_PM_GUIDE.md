# Recurring PM (Preventive Maintenance) Scheduling Guide

## Overview

Your maintenance system now supports **automatic recurring preventive maintenance** scheduling. This means you can create a PM once, set it to repeat (daily, weekly, or monthly), and the system will automatically generate new PM instances and work orders on the schedule you specify.

## Quick Start

### Step 1: Create a New PM

1. Go to **Client Dashboard** → **PM Tab**
2. Click **Create PM**
3. Fill in the work order details:
   - **Title**: e.g., "HVAC Filter Replacement"
   - **Description**: Details about the maintenance
   - **Priority**: High, Medium, Low, Urgent
   - **Category**: HVAC, Electrical, Plumbing, etc.
   - **Duration**: Estimated hours to complete

### Step 2: Configure the Schedule

1. Click **"Add Schedule"**
2. Select **"Calendar"** option
3. In the calendar schedule dialog, scroll down to **"Recurring Schedule"**
4. Choose your recurrence type:

## Recurrence Types

### Daily Recurrence
**Best for**: Daily maintenance tasks

- **Every**: Set to 1 for every day, or more for every N days
- **Time**: When to create the work order (e.g., 8:00 AM)
- **Repeats**: How long it continues (see "When does recurrence end?")

**Example**: Every 1 day at 9:00 AM

### Weekly Recurrence
**Best for**: Regular maintenance on specific days (e.g., every Monday & Thursday)

1. Select **"Weekly"** from recurrence type
2. Check the boxes for days you want maintenance:
   - ☐ Sunday
   - ☐ Monday
   - ☐ Tuesday
   - ☐ Wednesday
   - ☐ Thursday
   - ☐ Friday
   - ☐ Saturday
3. Set the **Time** (e.g., 10:00 AM)
4. Set when recurrence ends

**Example**: Every Monday, Wednesday, Friday at 10:00 AM

### Monthly Recurrence
**Best for**: Monthly inspections or maintenance

1. Select **"Monthly"** from recurrence type
2. Choose the **Day of Month** (1-31)
   - Day 15: Recurs on the 15th of each month
   - Day 1: Recurs on the 1st of each month
3. Set the **Time**
4. Set when recurrence ends

**Example**: Every 15th of the month at 2:00 PM

## When Does Recurrence End?

You have three options for when the recurring PM should stop:

### 1. Never (Infinite)
The PM will repeat indefinitely. Choose this if it's an ongoing maintenance task.

### 2. On a Specific Date
The PM will repeat until a specified date. Choose this for seasonal or project-specific maintenance.

**Example**: Daily PM until December 31, 2026

### 3. After a Number of Occurrences
The PM will repeat for a set number of times. Choose this if you know exactly how many times it should occur.

**Example**: Repeat 12 times (one year of monthly maintenance)

## Assigning and Adding Assets

After setting the recurrence:

1. **Assets & Locations**: Select which equipment/assets this PM applies to
   - **Asset**: The equipment being maintained
   - **Location**: Where the asset is located
   - **Assigned To**: Which technician handles this PM
   - **Timezone**: Local timezone for scheduling

2. Click **"Create PM"** to save

## How It Works Behind the Scenes

### Automatic Work Order Generation

Once you create a recurring PM:

1. **System checks every 5 minutes** for any PMs that are due
2. **When a PM is due**, the system automatically:
   - Creates a PM instance record
   - Generates a work order for that instance
   - Calculates the next due date
   - Updates the schedule

3. **Technicians see the work order** in their queue, ready to be assigned/completed

### Example Timeline

Let's say you create a daily PM at 9:00 AM:

| Date | Time | Action |
|------|------|--------|
| Jan 1 | 8:55 AM | PM created |
| Jan 1 | 9:05 AM | Work Order #1 auto-generated |
| Jan 2 | 9:05 AM | Work Order #2 auto-generated |
| Jan 3 | 9:05 AM | Work Order #3 auto-generated |
| ... | ... | ... (continues based on recurrence end condition) |

## Example Scenarios

### Scenario 1: Daily HVAC Filter Check
- **Recurrence**: Daily
- **Time**: 8:00 AM
- **Ends**: Never (ongoing maintenance)
- **Result**: Work order created every day at 8:00 AM

### Scenario 2: Weekly Equipment Inspection
- **Recurrence**: Weekly
- **Days**: Monday, Wednesday, Friday
- **Time**: 10:00 AM
- **Ends**: After 52 occurrences (one year)
- **Result**: Work order created 3 times/week for one year

### Scenario 3: Monthly Safety Audit
- **Recurrence**: Monthly
- **Day**: 15th of month
- **Time**: 2:00 PM
- **Ends**: On December 31, 2026
- **Result**: Work order created on the 15th of each month until end date

## Viewing Recurring PMs

In the PM Tab, you'll see:

- **Recurrence indicator**: Shows "Every day", "Every week on Mon/Wed/Fri", etc.
- **Next Due Date**: When the next work order will be generated
- **Status**: Pending, Overdue, Completed
- **Assignee**: Who it's assigned to

## Editing a Recurring PM

To edit a recurring PM:

1. Find it in the PM list
2. Click **"Edit"** or click the PM name
3. Modify work order details and/or schedule
4. **Note**: Only future occurrences are affected; past work orders remain unchanged
5. Click **"Save Changes"**

## Pausing or Stopping a Recurring PM

### Option 1: Stop the Recurrence
1. Edit the recurring PM
2. Change recurrence end date to today or a past date
3. Save

### Option 2: Mark as Completed
1. Edit the recurring PM
2. Change status to "Completed"
3. Save
4. No new work orders will be generated

## Best Practices

✅ **DO**
- Use meaningful titles (e.g., "Daily Safety Walk", not just "PM")
- Set realistic time windows (e.g., don't set 15 PMs at 9:00 AM)
- Assign to specific technicians for predictable scheduling
- Review recurrence settings before saving
- Use "ends on date" for seasonal maintenance

❌ **DON'T**
- Create duplicate recurring PMs for the same task
- Set very frequent recurring PMs (e.g., hourly) without testing
- Forget to set an end date if it's temporary
- Leave "Assigned To" blank for critical maintenance

## Troubleshooting

### Work orders aren't being created
1. Check if the PM status is "Completed"
2. Verify the recurrence hasn't ended
3. Check the next due date is in the past (system creates next hour)
4. Try refreshing your browser

### Wrong time showing for created work orders
1. Check your timezone setting in the PM
2. Verify the server time is correct
3. Contact support if timing is consistently off

### Can't edit a past work order
This is expected - you can only edit the recurring PM schedule. Past work orders are immutable records.

## Support

For issues or questions:
- Check the PM schedule's recurrence display for clarity
- Contact your system administrator
- Check the PM's edit dialog to review all recurrence settings

## Advanced: Managing Recurring PMs

### View All Recurring PMs
Go to PM Tab and filter by "Recurring" or look for the recurrence indicators.

### Monitor Upcoming Work Orders
Check the "Next Due" date to see when the next work order will be generated.

### Generate Manual Instances
Administrators can manually generate future instances using the API:
```
POST /api/maintenance-schedules/{scheduleId}/generate-instances
```

---

**Last Updated**: April 2026

For more technical details, see the implementation guide or contact your administrator.
