# Development

## Init

```sh
pnpm i
pnpm --filter directus-ext build
```

## Run Development

### Backend

```sh
pnpm --filter directus dev
```

Run extension dev

```sh
pnpm --filter directus-ext dev
```

### Frontend

```sh
pnpm --filter app dev
```

## Apply

### Snapshot

```sh
docker compose -f docker-compose.dev.yaml exec directus npx directus schema snapshot ./schema/schema.yml
```

### Apply

```sh
docker compose -f docker-compose.dev.yaml exec directus npx directus schema apply ./schema/schema.yml
```
