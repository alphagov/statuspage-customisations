# Statuspage customisations

Custom code for uses of statuspage.io on projects owned by the Government Digital Service.

- [Local development](#local-development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing to this repository](contributing-to-this-repository)

## Local development

### Set up

Add an `.env` file, copied from `.env.tmpl`, containing your team name and the URL of your
statuspage.

#### Environment variables

Your team name will be used to point the various commands at the folders for:
- your base `custom.scss` and `custom-footer.mjs` files
- the folder in `./dist` to output your CSS and JS files

The URL of your statuspage, used to get the source markup for your pages.

#### Configuring your statuspage CSS and JS

Make sure you add a folder to the `./src` matching your team name and put your own version of
`custom.scss` and `custom-footer.mjs` in it, only including the fixes you need.

### Running a dev server

You need to run the local dev server to:
- view your statuspage with your local CSS and JS
- run the testsuite

To run the local dev server, run

```bash
npm run dev
```

This will:
- fetch source markup from pages defined in the `pages`object in `server/config.mjs`
- modify markup to allow local customisations to be loaded when served
- save temporary templates to the `server` directory
- start up the `http` server

We use [Nodemon](https://nodemon.io/) to watch for changes to `.js, .css, .html` pages and reload the server.

If you want to add work on and new pages, they can be added to the `pages` object in `server/config.mjs`.

### Build the CSS, JS and HTML

To build the CSS and JS, run this command:

```bash
npm run build
```

To build only the CSS, run this command:

```bash
npm run build:css
```

To build only the JS, run this command:

```bash
npm run build:js
```

To build only the HTML, run this command:

```bash
npm run build:html
```

### Refresh templates

If you wish to fetch fresh content from your production statuspage, to generate updated or new templates, you can run

```bash
npm run refresh
```
Server will automatically restart and serve these.

## Testing

### Unit tests

Unit tests for customisations are located in `tests` directory. We use [WebdriverIO](https://webdriver.io/) as a test runner with Jasmine framework.

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

### Linting

JavaScript is linted against [Standard JS](https://standardjs.com).

SCSS is linted against the GDS variant of [stylelint](https://github.com/alphagov/stylelint-config-gds).

To lint your SCSS and JS, run this command:

```bash
npm run lint
```

To lint only your SCSS, run this command:

```bash
npm run lint:scss
```

To lint only your JS, run this command:

```bash
npm run lint:js
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
echo "$(<dist/$TEAM/custom.css)\n/* HEAD: $(git rev-parse HEAD) */" | pbcopy
```

#### Custom footer HTML

Make sure you source your `.env` file before running this command.

```bash
echo "$(<dist/$TEAM/custom-footer.html)\n<script>\n$(<dist/$TEAM/custom-footer.js)\n</script>\n<\!-- HEAD: $(git rev-parse HEAD) -->" | pbcopy
```

## Contributing to this repository

Please do contribute to this repository. Both new teams-specific code and changes to shared code are
welcome, as well as opinions and pull requests that suggest changes to the structure and syntax.

### Styleguide

Statuspage code, the environment our fixes have to work in, can change at any time. Because of this,
there are a few things any code changes made should consider.

#### Write JS and SCSS defensively

Always test for elements before operating on them and do the same for any assumptions about patterns
of DOM you manipulate. Your code should fail silently it the DOM has changed, which it often will.

For example, if you're moving an element before its preceding sibling, check
the sibling exists in that position first and return early if it isn't.

Try to keep any DOM checks inside your function. This will allow others to use it without thinking
about any assumptions it might make about DOM structure.

#### Use Web APIs to handle

Statuspage used React to update the page in places when this was written, but that could change.

Use web APIs like MutationObserver to monitor for DOM changes and don't write in any assumptions
about how the DOM is changed, or what framework might be in use.
these changes and operate on the resulting DOM without making assumptions on 

#### Document what issues your code fixes

Please include comments documenting which accessibility issues from [Anika's
spreadsheet](https://docs.google.com/spreadsheets/d/1sJItjnPB1ZVc8uS8H76KziAmfYtEji341KrAxfVizGg/edit?usp=sharing)
they fix, with as much detail as possible.

## Licence

Unless stated otherwise, the codebase is released under [the MIT License](LICENSE). This covers both the codebase and any sample code in the documentation.
