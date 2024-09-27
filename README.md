# crowd-ar-summary
Code repository for the experimental design setup for my Bachelor's Honors Project.

# Miscellaneous Notes
- Start writing the related work sections and the introduction

# Client TODO
- 

# Server TODO
- 

``mongoexport --collection=users "MONGO_CONNECTION_STRING" --type=csv --fields="prolificID,condition,articleID,article,preTask,task,postTask,completed,timedOut,returned,revokedConsent,initialSummary,llmSummary,finalSummary,queryHistory" > pilot_cond1_users.csv``