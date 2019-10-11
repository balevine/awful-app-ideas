# Awful App Ideas

A Twitter bot that posts a new awful app idea every day. Or whenever.

Ideas are of the form:

An app that {does something} when somebody {does something else}.

The first action is pulled from the `consequences.yml` file. The second action is pulled from the `events.yml` file.

The text is placed on an image from the `images` directory.

The consequence, event, and image are all chosen randomly each time.

To trigger the post, we're using [cron-job.org](https://cron-job.org) set to hit the endpoint every day at 8:00pm CEST.

The endpoint for the app is:

```
https://awful-app-ideas.glitch.me/post-a-new-idea-G53x6P5g
```
