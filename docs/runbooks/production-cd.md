# CD de produção — GHCR → servidor Docker Compose

## O que a pipeline faz

O workflow `CD · Production` só dispara quando o workflow `CI` termina com sucesso em `main`. Ele baixa exatamente o commit aprovado, cria duas imagens imutáveis no GitHub Container Registry, e publica as tags `sha-<commit-completo>`.

O Buildx usa dois caches complementares por serviço:

- cache `gha`, veloz para builds seguintes no GitHub Actions;
- cache `registry`, persistido no GHCR e recuperável mesmo em runners novos.

No servidor, o deploy faz `pull` apenas das camadas alteradas, executa a migração antes de subir a nova aplicação, aguarda os healthchecks e restaura as imagens anteriores se a inicialização das aplicações falhar. Migrations não são revertidas automaticamente: elas precisam seguir o padrão expand/contract.

## Bloqueadores que precisam ser corrigidos no backend

O repositório atual não possui os arquivos de bootstrap do Rails nem um lockfile de dependências. A imagem de API falha de propósito até que estes arquivos existam e estejam versionados:

```text
backend/Gemfile.lock
backend/config/boot.rb
backend/config/environment.rb
backend/config.ru
backend/bin/rails
backend/Rakefile
```

Isso evita publicar uma API sem boot reproduzível. Depois de restaurar o projeto Rails, gere e versione o lockfile Linux:

```bash
cd backend
bundle lock --add-platform x86_64-linux
bundle install
git add Gemfile.lock
```

## Segredos e variáveis do GitHub

Crie o Environment `production` no repositório e ative required reviewers. Cadastre nele:

| Tipo | Nome | Valor |
| --- | --- | --- |
| Variable | `NEXT_PUBLIC_API_URL` | URL pública da API, por exemplo `https://api.seudominio.com/api/v1` |
| Variable | `NEXT_PUBLIC_APP_URL` | URL pública do frontend, por exemplo `https://seudominio.com` |
| Secret | `DEPLOY_HOST` | IP ou hostname do servidor |
| Secret | `DEPLOY_USER` | Usuário SSH; prefira `deploy` em vez de `root` |
| Secret | `DEPLOY_SSH_PRIVATE_KEY` | Chave privada Ed25519 exclusiva do GitHub Actions |
| Secret | `DEPLOY_KNOWN_HOSTS` | Linha fixa de `ssh-keyscan -H <host>` revisada antes de salvar |
| Secret | `GHCR_PULL_TOKEN` | Fine-grained PAT exclusivo do servidor, com acesso **read-only** a Packages |

O token de Packages usado pelo servidor não é o `GITHUB_TOKEN` da action e não deve ter escopo de escrita, repositório ou administração.

## Preparação única do servidor

Instale Docker Engine + Docker Compose plugin pelo repositório oficial da sua distribuição. Depois, crie o diretório persistente e o arquivo de ambiente:

```bash
install -d -m 0750 /opt/dronehub
install -m 0600 /dev/null /opt/dronehub/.env
```

Copie `deploy/.env.example` para `/opt/dronehub/.env`, troque todos os placeholders por segredos longos e não salve esse arquivo no Git. O workflow carrega compose e script em cada deploy, mas nunca substitui `.env`, volumes PostgreSQL ou Redis.

Os containers são publicados apenas em `127.0.0.1:3000` (web) e `127.0.0.1:3001` (API). Configure Caddy ou Nginx no host para TLS e proxy reverso. Exemplo Caddy, substituindo os domínios:

```caddy
app.seudominio.com {
  reverse_proxy 127.0.0.1:3000
}

api.seudominio.com {
  reverse_proxy 127.0.0.1:3001
}
```

## Segurança operacional

- Não coloque PAT, senha SSH ou `.env` no workflow, em comandos de `docker login` versionados, ou em arquivos do repositório.
- Revogue imediatamente qualquer token já exposto e substitua-o por um token limitado novo.
- Crie uma chave SSH dedicada apenas para deploy; idealmente use o usuário `deploy` com acesso a Docker, não `root`.
- Faça backup testado do volume `dronehub_postgres-data` antes do primeiro deploy e antes de migrations destrutivas.
- O workflow mantém o último release nas tags SHA. Para rollback manual, execute o script remoto com as tags SHA anteriores; não use `main` ou `latest` como referência de produção.
