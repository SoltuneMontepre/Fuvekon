[![fuvekon CD](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml/badge.svg?branch=main)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/cd.yaml) [![fuvekon CI](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml/badge.svg)](https://github.com/SoltuneMontepre/Fuvekon/actions/workflows/ci.yaml)

## Overview

This document expands the basic steps to get the fuvekon running locally. Each step below preserves the original items and adds brief explanations and copy-paste commands where applicable.

## Environment setup

### Requirements

- Node 18 | >= 24.3 [[Download here]](https://nodejs.org/en/download)

### Steps:

#### 1. Install dependencies

```bash
npm i
```

#### 2. Create environment variables:

Clone `.env.example` to `.env` using the following command:

Unix/macOS:

```bash
cp .env.example .env
```

Windows (PowerShell):

```pwsh
Copy-Item .env.example .env
```

Windows (CMD):

```cmd
copy .env.example .env
```

#### 3. Start the development server

```bash
npm run dev
```

#### 4. Start coding!

Congratulations — onboarding complete.

---

### Development Flow

#### 1. Create a feature branch

```bash
   git checkout -b feat/short-description
```

#### 2. Commit using the repository's commit convention and push:

```bash
   git add .
```

```bash
   git commit -m "feat(module): short description"
```

```bash
   git push --set-upstream origin feat/short-description
```

#### 3. Open a PR linking the relevant issue and follow the repo's review checklist.
