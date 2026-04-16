# Nebo Ignite - Backend Service

## Introduction

This is the Backend service for Nebo Ignite. The Backend service is responsible for handling all connection to the database, data manipulation, persistent storage, as well as providing a REST API for the Frontend service. The Backend is built using TypeScript as the programming language, Prisma for Migration management and ORM, Fastify for the REST Web Server, and PostgreSQL for the database.

## Setup

To set the project up in your local environment, first ensure you have Node.js >20 installed. The suggestion is to use a version manager such as [Node Version Manager](https://github.com/nvm-sh/nvm) (NVM). Once Node and NPM are installed locally, you need to install yarn (**"need"** comes from the fact the project was setup with yarn to begin with, and using something like NPM can cause conflicts in the yarn.lock file) using `npm install yarn -g` and then execute `yarn install` to install all local dependencies.

To setup the database, make sure you have PostgreSQL installed locally and accessible (note down the username, password, host, and port), either via Docker or local service install. Since Prisma uses the address of the database instead of local socket, the setup for Docker and local install are the same, as long as both are accessible at a given host, port, username and password. Once the database is running, you can optionally create the database or just let Prisma create it for you. Rename `.env.example` to `.env` and set the key-value pair `DATABASE_URL` to point to your local PostgreSQL Database install. Make sure you also add your own Gemini key to `GOOGLE_API_KEY`. Finally, run `yarn prisma migrate dev` to apply all migrations to the database.

Before running the server, make sure you seed the database, using `yarn seed`. That will automatically create records to allow you to start using the platform without any hassles. Once dependencies are installed and the database is setup, run `yarn dev` to start the local server. Navigate to `localhost:3030` to access the login page.

## Project Structure & Tips

The business logic for Nebo Ignite is located within `@/src` directory. Within it, you can find the `controllers` directory, which houses all controllers in the Backend, and `models` directory, which houses all model definitions. The `@/core` directory contains all custom code that allows the server to run, register all endpoints without the need for importing (custom implementation of the Fastify router), error handling, logging, and database initialization. There is no need to change the `@/core` source code unless you are specifically changing how the server behaves, and not the business logic. **Attention: The core directory should not have any business logic.**

## Controller Definition

To create a Controller, navigate to `@/src/controllers` and create a directory with the name of your controller (such as `@/src/controllers/Project` for a controller named "Project"). Within it, create an `index.ts` file and setup the Controller configuration:

```typescript
import { ControllerSettings } from "@/core/server/types";

const settings: ControllerSettings = {
  prefix: 'projects',
};

export default settings;
```

Notice that leaving the prefix empty will automatically use the plural lowercase of the Controller name (in the case of the Project controller, the prefix will be automatically be set to `projects`). Within the controller directory, create two folders: `queries` and `mutators`. You can now create endpoints within those folders. As a rule of thumb, name your endpoints (and their file) with the actual task they are accomplishing. If they create a Project, name it `createProject.ts`. Since this endpoint will **mutate** the Project model, it should go in the mutators folder, such as `src/controllers/Project/mutators/createProject.ts`. Below is an example of how to define an endpoint:

```typescript
import database from "@/core/database";
import { Endpoint } from "@/core/server/types";

type Body = {
  title: string;
  description: string
};

const createProject: Endpoint = async (req, res) => {
  const body = req.body as Body; // Get data from payload body

  // Create the project using Prisma
  const project = (...);
  return project;
};

// Endpoint settings
createUser.httpMethod = "POST"; // Method
createUser.path = "/"; // URL of the endpoint (controller prefix + path)

export default createProject;
```

Notice the full path of this endpoint will be POST `/projects/` (namely controller prefix + path). If the endpoint was `/abc`, then the full path to that endpoint would be `/projects/abc`. That's it, your endpoint will be automatically indexed when you save, no need to import that endpoint anywhere.

When handling errors, you can create a new error definition in `@/core/errors` that extends GenericError (see `@/core/errors/generic.ts`) or throw `GenericError`, such as `throw new GenericError("error message", 500)`. The error handler in `@/core/errors/index.ts` will automatically handle the error if it detects it is a GenericError. If you create a new class of Errors (such as `DatabaseNotFoundError`), make sure you add custom code for handling it in `@/core/errors/index.ts`.

## Model Definition

Prisma database schema is defined within `src/models/**`. The client instance for Prisma can be accessed by importing `@/core/database` into your application, as the default export of `@/core/database/index.ts` is the client instance:

```typescript
import database from '@/src/database';

database.user.create(...)
```

To create a new model, create a directory with the model name in `@/src/models` folder and write a `schema.prisma` file within it, such as `@/src/models/Example/schema.prisma`. Within the Prisma schema file, you can create your model such as:

```prisma
model Example {
  id   String @id @default(cuid())
  name String

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@map("examples")
}
```

Notice above we create a model called "Example" with database table name "examples" (see `@@map`). The id field is defined as a string and auto-populates with a random CUID on create. As a guideline, let's define Prisma models using pascal-case but use snake-case when mapping the table to the database.

To migrate your changes, run `yarn prisma migrate dev`, you will be asked for a name for your migration and Prisma should take care of the rest. Your model can now be accessed with `database.example.<operation>` across the codebase.

Check [Prisma Documentation](https://www.prisma.io) for more information.

## Middlewares

To add a middleware, define your middleware in `@/core/middlewares` (check the example `auth.ts` middleware there) and add it as a hook in the Fastify request lifecycle (`@/core/server/index.ts`). The code defined in the middleware can check the request arguments, add or remove them, do check ups and, once validated, you can call the `done` function to move on to the next step in the call chain. Check [Fastify Hooks](https://fastify.dev/docs/latest/Reference/Hooks/) for more information.
