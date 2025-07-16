# Twenty CRM - Project Overview

Twenty is the #1 Open-Source CRM built with modern technologies and designed to be a fresh alternative to expensive, locked-in CRM solutions.

## Product Vision
- **Open-source alternative** to expensive CRMs like Salesforce
- **Modern UX** inspired by tools like Notion, Airtable, and Linear
- **Community-driven** development with plugin ecosystem
- **Self-hostable** with cloud options

## Core Features
- Customizable objects and fields
- Multiple view types (table, kanban, calendar)
- Workflow automation with triggers and actions
- Email integration and calendar sync
- Custom roles and permissions
- File management and attachments

## Tech Stack
- **Frontend**: React 18, TypeScript, Recoil, Emotion, Vite
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, GraphQL
- **Monorepo**: Nx workspace with Yarn 4
- **Testing**: Jest, Playwright, Storybook
- **Build**: SWC, Vite, TypeScript 5.3

## Architecture Principles
- Monorepo structure with clear package boundaries
- GraphQL API with REST fallbacks
- Event-driven architecture with BullMQ
- Microservice-ready modular design
- Type-safe development with strict TypeScript

## Development Workflow
- Feature branches with PR reviews
- Automated testing (unit, integration, e2e)
- Storybook for component development
- Continuous deployment with Docker
- Code quality with ESLint, Prettier, and Danger