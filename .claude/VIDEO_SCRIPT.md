# AssiTech Demo Video Script (60-90 seconds)

## Introduction (10-15 seconds)

> "Hi, I'm [Your Name]. I built AssiTech, an AI-powered auto-generated blog platform for the technical challenge. Let me show you what I created."

---

## Live Demo (25-35 seconds)

**Show the live application at http://15.237.248.201**

> "Here's the live application running on AWS EC2. The homepage displays AI-generated tech articles with cover images from Unsplash."

**Click on an article to show detail view**

> "Each article has a full detail view with the complete AI-generated content. The system automatically generates one new article every day using node-cron."

**Show the Login button in header (optional)**

> "There's also an admin dashboard for managing content and triggering article generation on demand."

---

## Technical Decisions (20-30 seconds)

> "For the tech stack, I chose:"
>
> - **React with Vite** for a fast, modern frontend
> - **Node.js with Express** for the backend API
> - **PostgreSQL on AWS RDS** for reliable data persistence
> - **HuggingFace's free API** with Mistral model for AI generation - completely free
> - **AWS CDK** for Infrastructure as Code - this deploys the entire stack with a single command

> "The CI/CD pipeline uses **CodeBuild** to automatically build Docker images and push to ECR. The EC2 instance pulls the latest images when updated."

---

## What I'd Improve (10-15 seconds)

> "With more time, I would add:"
>
> - HTTPS with Let's Encrypt for security
> - Redis caching for better performance
> - A more sophisticated AI prompt system for higher quality articles
> - Full-text search functionality

---

## Closing (5 seconds)

> "Thank you for reviewing my submission. The code is fully documented on GitHub."

---

## Key Points to Highlight

1. **Working deployment** - Live on EC2 at http://15.237.248.201
2. **Daily automation** - Cron job generates articles automatically
3. **Infrastructure as Code** - AWS CDK for reproducible deployments
4. **Free tier optimized** - ~$0.80/month cost
5. **Clean architecture** - Separation of concerns, documented code
6. **Complete CI/CD** - GitHub → CodeBuild → ECR → EC2

## Demo Flow Checklist

- [ ] Show homepage with article list
- [ ] Click an article to show detail view
- [ ] Mention the Login button for admin access
- [ ] Briefly show code structure (optional)
- [ ] Explain key technical choices
- [ ] Mention improvements you'd make

## URLs for Demo

- **Live App**: http://15.237.248.201
- **API Health**: http://15.237.248.201:3000/health
- **GitHub Repo**: [Your GitHub URL]

## Tips

- Keep it under 2 minutes
- Speak clearly and at a moderate pace
- Show the working app first, then explain
- Be confident about your technical decisions
- Mention trade-offs you considered
