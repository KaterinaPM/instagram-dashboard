Instrucitons: Mock a chat conversation based on the user journey from DAY 0 ONLY. You can mock the conversation and the preview conversations from each goal. Add every text into a json file so I can edit later and make sure the code reads from the file and not hardcode any text in the code.

### User journey


**Day 0**
1. User downloads Manychat and sees a chat interface. The agent is asking for
    1. insert email (creates user)
    2. connects IG (account)
2. Agent sends loading messages where Manychat is scanning their IG bio and messages history while asking their goals
    1. labour screen → showing what we work on (getting posts, getting DMs, identifying the niche, etc.)
    2. Ask what is their goal -> Available options: Sell more, Grow your followers, Build my community
3. AI tell what it learned about the user: ie: DMs per week, number of followers, type of business...
4. AI then suggests 2 goals to start with, and confirms with the user
    1. ie: Do you want to start sending your course link to every new follower?
        1. Approve/Edit/Reject
    2. ie: Your recent post went viral! (Congrats!) Do you want to set up sending the *link* to everyone who comments?
    3. ie: You get lots of questions about your course. Do you want me to help you handle those? Reply based on the info we found (Answer FAQ) → Yes launches the “setup process” for that solution
        1. Show a parsing link process
        2. Approve/Edit/Reject
5. For each goal, AI will show a mock conversation of that intersaction and asks for user approval. 
6. After the 3 goals were discussed, AI suggests to stop the setup for today and let it go live. Recommend them to turn on notifications so the agent can update them tomorrow about how did it go.

**Day 1**

- Notification: You got X new followers from your DMs sent. Lets reply comments with links
1. User opens the page and sees new followers chars + a chat asking if they want to set up new skills or if they want to see other metrics
    1. See other metrics → Renders new charts
    2. Set up new skills → Lead qualification flow