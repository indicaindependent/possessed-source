# POSSESSED

**Your friend is the furniture. Trust nothing.**

POSSESSED is a real-time, two-player game of supernatural hide-and-seek, built on Base44 for the Spooky Showdown game jam. One player hides inside the objects of a haunted house as the Ghost. The other follows clues and spends search charges as the Hunter. Then the roles reverse. Press Quick Match to be paired with another waiting player, or send a friend a private invite link.

- **Play it:** [possessed.base44.app](https://possessed.base44.app)
- **Showcase repository:** [indicaindependent/possessed](https://github.com/indicaindependent/possessed), with artwork, a how-to-play guide and a tour of the code.

This repository is the live source. The Base44 builder syncs to its `main` branch, so a change pushed here is reflected in the builder, and the builder's changes appear here.

## Run and test

```bash
npm ci
npx vitest@3 run
npm run build
```

- `npm ci` installs the locked dependencies.
- `npx vitest@3 run` runs the tests. Vitest is not a project dependency, and `vitest.config.js` maps the Actor runtime to a test mock.
- `npm run build` compiles the production frontend. It warns that `VITE_BASE44_APP_ID` is unset when built standalone. That confirms it compiles, not that it is deployed.
- `base44 dev` needs a linked Base44 app, so it will not run from a bare clone. See the [Base44 local development documentation](https://docs.base44.com/developers/backend/overview/local-dev/local-development-overview).

Never put a credential into a `VITE_` variable, because frontend build variables are public.

## License

MIT. See [LICENSE](LICENSE).
