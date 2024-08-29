# crowd-ar-summary
Code repository for the experimental design setup for my Bachelor's Honors Project.

# Miscellaneous Notes
- Add error handling everywhere!

# Client TODO
- Timed Out Completion Code (+ functionality)
- Add a global timer that will time out the user after 30 minutes.
- Propogate LLM summaries for condition 1 properly.
- Replace calls to LLM on frontend with calls to the server.

# Server TODO
- Ensure that the server keeps track of the articles that have been given to users. (For reruns if people back out)

# External Service TODO
- Parallelize the LLM calls to Ollama.
- Create FastAPI/Flask server to expose the LLM API to the internet.