<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

A load balancer proxy for Claude and Claude Code that distributes requests across multiple OAuth accounts to avoid rate limiting.

## Important: After making code changes

Always run:
- `bun run lint` - Fix linting issues  
- `bun run typecheck` - Check for type errors
- `bun run format` - Format code

## Commands

### Running the server
- `bun start` - Start the load balancer (port 8080)

### Managing accounts
- `ccflare --add-account <name>` - Add a new account
- `ccflare --list` - List all accounts
- `ccflare --remove <name>` - Remove an account

### Maintenance
- `ccflare --reset-stats` - Reset usage statistics
- `ccflare --clear-history` - Clear request history