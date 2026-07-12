# Manager Questions for AI Analysis via MCP

Questions a user could ask an agentic AI tool on app data.

## Billable hours & productivity

1. How many billable hours did our team log this week compared to last week?
2. Who are the top 5 users by billable hours this month?
3. Which users logged fewer than 30 billable hours last week?
4. What's the average daily billable hours per user across the firm this quarter?
5. Show me a breakdown of billable hours by team for June.
6. Are there any users who haven't logged any time in the past 3 business days?
7. What's the trend in total billable hours over the last 6 months?
8. Which day of the week do we log the most billable hours?
9. Who logged time on the weekend this month?
10. What's the median entry length for Times — are people logging in big blocks or small increments?
11. Which users have unusually large single time entries (e.g., over 8 hours) this month?
12. Compare each user's billable hours this month to their own 6-month average — who is significantly above or below?

## Availability & the in/out board

13. Who is currently marked as in, and who is out right now?
14. What percentage of the team was marked available during core hours (9–17) last week?
15. Which users are most frequently marked out during business hours?
16. Show me User X's availability history for the past two weeks.
17. What time do people typically set themselves to "in" each morning — has that shifted recently?
18. How many total available hours did Team A show on the board last month?
19. Which days last month had the lowest overall availability?
20. Who changed their status most frequently yesterday — lots of in/out toggling?
21. Compare average daily availability between Team A and Team B this month.
22. Were there any days where fewer than 3 people on Team A were available?

## Clients

23. Which clients consumed the most billable hours this quarter?
24. What percentage of our total hours went to our top 3 clients this year?
25. Which clients have had no time logged against them in the past 60 days?
26. How have hours for Client X trended over the past 12 months?
27. Which team spends the most time on Client X?
28. List all clients that have active projects but less than 10 hours logged this month.
29. Which new clients (added in the last 90 days) are generating the most work?
30. Is our client workload concentrated or diversified — what does the distribution of hours across clients look like this year?
31. Who created Client X, and when exactly was it added to the system?
32. Which clients were created in the last 30 days, by whom, and on what dates?
33. Who has created the most new clients this year — who is bringing in new business?
34. Show me a monthly timeline of client creation over the past year — when did we onboard the most new clients?

## Projects

35. Which projects received the most hours this month?
36. Which projects have gone completely inactive (no time logged in 30+ days)?
37. How many hours in total have been logged on Project Y since it started?
38. Who has worked on Project Y, and how many hours has each person contributed?
39. Which projects have only one person working on them — where do we have key-person risk?
40. What's the average number of users contributing to each active project?
41. Compare hours logged on Project A vs Project B over the last quarter.
42. Which projects saw the biggest week-over-week increase in logged hours?
43. How is the workload for Client X distributed across their projects?
44. Which projects had time logged this week by users outside the team that usually works on them?
45. Who created Project Y, and when exactly was it set up?
46. Which projects were created in the last 30 days, by whom, and for which clients?
47. Are there projects that were created but have never had any time logged — who created them and how long ago?
48. How soon after a client is added do we typically create their first project — and who usually sets those up?

## Users & teams

49. Which teams exist in the organization, and how many members does each have?
50. Which teams does User X belong to?
51. List all members of Team A and flag anyone who is also on another team.
52. Which users belong to more than one team?
53. When was User X's account created, and who created it?
54. Which user accounts were added in the last 90 days, by whom, and on what dates?
55. Are there users who don't belong to any team?
56. How has each team's headcount changed over the past year?

## Cross-collection insights

57. Which users were marked as available for long stretches but logged few billable hours — where's the utilization gap?
58. What's each user's utilization rate (billable hours ÷ available hours on the board) this month?
59. Which team has the best utilization rate this quarter?
60. Did anyone log billable time on days they were marked out all day?
61. On days when availability was low firm-wide, did billable output drop proportionally?
62. Which users' logged hours don't line up with their status history this week — any anomalies I should review?
63. If Client X sends us a new urgent matter, which qualified users currently have the most availability and the lightest recent workload?
64. Which teams are overloaded (high hours per available person) and which have spare capacity right now?
65. Give me a Monday-morning summary: who's in today, what got logged last week, and any anomalies worth reviewing.
66. Prepare a month-end report for Client X: total hours, breakdown by project and by user, compared to the previous month.

## After-hours & late-night work

67. Has anyone been working late nights this month, billable time logged after 20:00? Who does it most, and is it a pattern or a one-off crunch?
68. Who was still marked as working on the in/out board after 20:00 this month and how often. Are the same people repeatedly staying late on the board?
69. For the people logging billable time late at night this month, does their in/out board history show them as working at those hours? Or is the work being billed while they were marked out. Or the reverse, on the board late but billing nothing?

## Planned time & scheduling

70. What's scheduled for next week. Who's overbooked and who has room to take on more?
71. Compare planned vs actual hours for last week. Whose plans slipped the most, and in which direction?

## Work mix, tags & unattributed time

72. What's the mix of work for Client X this year — drafting vs court time vs meetings — and is it shifting?
73. How many hours are sitting in red-tagged (write-off / do-not-bill) entries this month, and for which clients?
74. How much logged time this month isn't attached to any client or project, and who has the most unattributed hours?

## Data hygiene & anomalies

75. Who logs their time days after the fact instead of same-day — are timesheets being reconstructed from memory?
76. Does anyone have overlapping time entries this month — any double-billing risk?
77. Whose in/out board status hasn't changed in over a week, and is anyone marked out with a return time that has already passed?

## Vacation, coverage & workload balance

78. Who's on vacation right now and when is each person back — and how many vacation days has each person taken this year?
79. Which weekday is our business-hours coverage thinnest — should we stagger anything?
80. Is after-hours and weekend work concentrated in the same few people, and are they also the top-hours people overall — any burnout risk?
81. Our people are spread across timezones — when this week is everyone available at the same time for a firm meeting?

## Write operations (mutations via MCP)

82. Log 2 hours for me yesterday on Project Y re settlement negotiations.
83. Mark John as out sick today with a note, expected back Monday.
84. Create a new client X.

## Self-service

85. What did I work on last week? And did I forget to log any day?
