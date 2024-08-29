# crowd-ar-summary
Code repository for the experimental design setup for my Bachelor's Honors Project.

# Miscellaneous Notes
- Ensure that the Qualtrics includes labels under the 1/7 scales.

# Client TODO
- Valid Completion Code
- Revoked Consent Completion Code
- Timed Out Completion Code (+ functionality)
- Add a global timer that will time out the user after 30 minutes.
- Make sure that loading for llm summary occurs on the second page.

# Server TODO
- Ensure for all conditions that the article is randomly selected from ``client/data/selected_articles.csv``. Make sure ``articleID`` is propogated to the backend (so we know what reference summary to use). 


# External Service TODO
- Unfortunately, the LLM's response times are quite slow. We need to ensure that the response times are reasonable.
- Ensure the cluster is scalable for 60 users? (maybe 5 is okay)