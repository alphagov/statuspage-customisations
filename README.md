# Statuspage customisations

Custom code for uses of statuspage.io on projects owned by the Government Digital Service.

## Local development

To run a local dev server, run `npm run dev`.
This will:
- fetch source markup from pages defined in the `pages`object in `server/config.mjs`
- modify markup to allow local customisations to be loaded when served
- save temporary templates to the `server` directory
- start up the `http` server

We use [Nodemon](https://nodemon.io/) to watch for changes to `.js, .css, .html` pages and reload the server.

If you want to add work on and new pages, they can be added to the `pages` object in `server/config.mjs`.

### Refresh templates

If you wish to fetch fresh content from remote to generate updated or new templates, you can run 

```bash
npm run refresh
```
Server will automatically restart and serve these.


## Testing

Tests for customisations are located in `tests` directory. We use [WebdriverIO](https://webdriver.io/) as a test runner with Jasmine framework.

To run the tests, if you don't already have the server already running, you can run

```bash
npm test
```
This will start-up the server, load the templates and then run the tests.

If you already have the server running and want to run the tests, you can run

```bash
npm run test:only
```

To run a single selected test when the server is running, you can run

```bash
npx wdio run ./tests/config.js --spec tests/home-page.spec.mjs
```

## Linting

JavaScript is linted against [Standard JS](https://standardjs.com).

```bash
npm run lint
```

Linting is run as well when tests are run.

## Deployment

Follow these steps to update the production code of your status page.

You should have the latest `main` checked out.

1. sign into statuspage.io
2. go to 'Customize page and emails'
3. click the 'Customize HTML & CSS' button
4. get the latest version of a file in your clipboard with the bash script below
5. paste it into the textbox for that file
6. repeat step 4 for the other file
7. check the commit SHA in the comment at the bottom with the HEAD of `main`
8. check your changes in the in-page iframe work as expected
9. if all ok, click the 'Publish changes' button

### Command to copy file to clipboard

Run this script to copy the file to your clipboard, with a SHA of the latest commit appended in a
CSS comment:

#### Custom CSS

```bash
echo "$(<custom.css)\n/* HEAD: $(git rev-parse HEAD) */" | pbcopy
```

#### Custom footer HTML

For example:

```bash
echo "$(<custom-footer.html)\n<script>\n$(<custom-footer.js)\n</script>\n<\!-- HEAD: $(git rev-parse HEAD) -->" | pbcopy
```

