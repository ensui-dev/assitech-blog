# AssiTech Documentation Index

Complete documentation for the AssiTech AI-powered blog platform.

## Quick Navigation

### 🚀 Getting Started

- **[Main README](../README.md)** - Project overview, features, and quick setup

### ☁️ Deployment Guides

**Local Development:**
- **[Local Deployment Guide](deployment/LOCAL_DEPLOYMENT.md)** - Docker Compose setup for local development

**AWS Production (CDK-based):**
- **[AWS Deployment Guide](deployment/AWS_DEPLOYMENT.md)** - Complete CDK deployment walkthrough
- **[Infrastructure README](../infra/README.md)** - Comprehensive infrastructure documentation

### 🏗️ Architecture & Design

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture, data flow, and design decisions

### 🔧 Component Documentation

- **[Backend README](../backend/README.md)** - Node.js backend API documentation
- **[Frontend README](../frontend/README.md)** - React frontend documentation

## Documentation Structure

```
AssiTech/
├── README.md                           # Main project documentation
│
├── docs/
│   ├── README.md                       # This file - documentation index
│   ├── ARCHITECTURE.md                 # System architecture
│   └── deployment/                     # Deployment guides (current)
│        ├── LOCAL_DEPLOYMENT.md        # Local Docker Compose guide
│        └── AWS_DEPLOYMENT.md          # Complete AWS CDK guide
│
├── infra/
│   └── README.md                       # Infrastructure documentation
│
├── backend/
│   └── README.md                       # Backend API docs
│
└── frontend/
    └── README.md                       # Frontend docs
```

## Common Workflows

### Local Development Setup

1. Follow [Local Deployment Guide](deployment/LOCAL_DEPLOYMENT.md)

### AWS Deployment

1. Follow [AWS Deployment Guide](deployment/AWS_DEPLOYMENT.md)
2. Review [Infrastructure README](../infra/README.md) for advanced configuration

## Key Documentation Features

### Deployment Documentation

All current deployment documentation uses **AWS CDK** (Infrastructure as Code):

- **5 CDK Stacks**: Network, ECR, CodeBuild, Database, Compute
- **Automated Setup**: One-command deployment
- **Production-Ready**: Security, backups, monitoring included

### Architecture Documentation

[ARCHITECTURE.md](ARCHITECTURE.md) covers:
- Component architecture
- Database schema
- API design
- Security measures
- Deployment architecture
- Scalability considerations

### Component Documentation

Each component has its own README with:
- Setup instructions
- API/Interface documentation
- Development guidelines
- Testing procedures

## Documentation Standards

All documentation follows these principles:

1. **Clear Structure** - Organized by purpose and audience
2. **Step-by-Step** - Instructions are sequential and complete
3. **Code Examples** - Practical examples for all procedures
4. **Troubleshooting** - Common issues and solutions included
5. **Up-to-Date** - Reflects current implementation (CDK-based)

## Getting Help

### Local Development Issues
- Check [Local Deployment Guide Troubleshooting](deployment/LOCAL_DEPLOYMENT.md#troubleshooting)

### AWS Deployment Issues
- Check [AWS Deployment Guide Troubleshooting](deployment/AWS_DEPLOYMENT.md#troubleshooting)
- See [Infrastructure README Troubleshooting](../infra/README.md#troubleshooting)

### Architecture Questions
- Review [ARCHITECTURE.md](ARCHITECTURE.md)
- Check component-specific READMEs

## Contributing to Documentation

When updating documentation:

1. **Keep it current** - Update when implementation changes
2. **Test instructions** - Verify all commands work
3. **Be specific** - Include exact commands and paths
4. **Add examples** - Show expected output
5. **Update index** - Keep this README in sync

## Version History

- **v1.0** (Current) - AWS CDK deployment with 5 stacks
