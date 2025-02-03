# AdStream_AI

Built with [Wasp](https://wasp-lang.dev), based on the [Open Saas](https://opensaas.sh) template.

## Development

### Running locally

 - Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.
To run your new app, follow the instructions below:
    cd AdStream

  1. Position into app's root directory:
    cd app

  2. Run the development database (and leave it running):
    wasp db start

  3. Open new terminal window (or tab) in that same dir and continue in it.

  4. Apply initial database migrations:
    wasp db migrate-dev

  5. Create initial dot env file from the template:
    cp .env.server.example .env.server
    cp .env.client.example .env.client

  6. Last step: run the app!
    wasp start
### Running locally
 - Make sure you have the `.env.client` and `.env.server` files with correct dev values in the root of the project.
 - Run the database with `wasp start db` and leave it running.
 - Run `wasp start` and leave it running.
 - [OPTIONAL]: If this is the first time starting the app, or you've just made changes to your entities/prisma schema, also run `wasp db migrate-dev`.

