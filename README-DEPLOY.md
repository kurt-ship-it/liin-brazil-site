# LIIN · Dashboard executivo ESG — mockup v0.1 · deploy no Vercel

Site estático: um único `index.html` (gráficos via cdnjs, fontes via Google Fonts). Sem build.

## Opção A — Vercel Drop (sem Git, sem CLI)
1. Abra https://vercel.com/drop logado na sua conta.
2. Arraste a pasta `liin-dashboard-executivo` (ou o .zip) para a página.
3. Escolha o time (kurt-ship-its-projects), dê um nome ao projeto (ex.: `liin-dashboard-executivo`) e clique em **Deploy**.
4. A URL de produção aparece ao final (`https://<nome>.vercel.app`).
   Observação: cada "drop" cria um projeto novo. Para iterar com a mesma URL, conecte um repositório Git ao projeto depois (Settings → Git) ou use a opção B.

## Opção B — Vercel CLI (mantém a mesma URL nas iterações)
```bash
npm i -g vercel
cd liin-dashboard-executivo
vercel          # primeira vez: cria/vincula o projeto
vercel --prod   # publica em produção; repita a cada nova versão
```

## Depois do deploy
- **Confidencialidade**: em Settings → Deployment Protection, ative proteção por senha (planos Pro) ou mantenha "Vercel Authentication" e adicione os e-mails dos convidados. O mockup já leva `noindex` (meta e header) para não entrar em buscadores.
- **Domínio**: para `dashboard.liinbrazil.org`, adicione o domínio em Settings → Domains e crie o CNAME no provedor de DNS do liinbrazil.org apontando para `cname.vercel-dns.com`.
- **Integração futura**: quando o mockup virar módulo do sistema de gestão (React/Vercel), a mesma página pode viver como rota estática (`public/executivo/index.html`) do projeto existente.
