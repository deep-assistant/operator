# operator
The UI for efficient operations with humans and AIs.

This UI should look like a queue of infinite cards/windows/chats and so on.

The main goal is to optimize the decision making workflow.

For example it may be 100-1000 chats with real people in Telegram, VK, X. Or just as many chats with AIs or Claude Code/Codex etc.

No notificatios, no distractions, just the work.

User sees only one card at a time to focus. Once he does send a message or makes overwise the decision, this card goes to the and of the queue - or completely disappers (for example if no new answers are comming from humans in chats).

That way the desicion making process is streamlined (it actually a single stream or queue of desicions). And no additional cognitive resources are wasted on the context switching itself.

There should be TWO primary actions: DONE (reponse made to the human user, and the new window will be added to the queue only when new notification arrives) or NEXT (we can just move the task to the last place in the queue if it is not urgent, and we want to reprioritize).

It should be done in React.js, so it will be infinitely extendable.

Another possible way to use the UI is this image:

<img width="2732" height="2048" alt="IMG_3816" src="https://github.com/user-attachments/assets/08f3c3b4-a277-45c9-8d02-324e1d76ced8" />

So we need to have two UI options:
1. Card after card (for maximum focus)
2. List of cards to the left and card itself to the right.
