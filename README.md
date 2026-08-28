# LIIN Brazil — site público

Oito páginas estáticas, uma função serverless, sem build step.

```
index.html                      página principal
fundos-de-previdencia.html      ┐
municipios.html                 │ páginas de audiência
associacoes-de-municipios.html  │
empresas.html                   ┘
inteligencia.html               Smart Reports, radar e publicações
quem-somos.html                 LIIN, liderança, equipe, carreiras
privacidade.html                LGPD

css/liin.css    folha única — editar aqui altera as oito páginas
js/liin.js      navegação, revelação ao rolar, envio do formulário
img/            14 ilustrações vetoriais
api/contato.js  recebe o formulário e envia por e-mail
vercel.json     URLs limpas, cabeçalhos de segurança, cache de imagens
```

---

# Passo a passo da hospedagem

## 1 · Contas necessárias

| Serviço | Para quê | Custo |
|---|---|---|
| GitHub | guardar o código | grátis |
| Vercel | hospedar e publicar | grátis neste porte |
| Resend | enviar o formulário por e-mail | grátis até 3.000 e-mails/mês |

Registrar as três com o mesmo e-mail corporativo. Ativar verificação em duas etapas nas três.

## 2 · Subir o código para o GitHub

Na pasta `liin-site`:

```bash
git init
git add .
git commit -m "site público LIIN Brazil"
gh repo create liin-brazil-site --private --source=. --push
```

Sem o GitHub CLI: criar o repositório privado pelo site e depois

```bash
git remote add origin https://github.com/SEU-USUARIO/liin-brazil-site.git
git branch -M main
git push -u origin main
```

## 3 · Chave do Resend

Em resend.com → API Keys → Create. Copiar a chave (aparece uma vez só).

Ainda no Resend, em Domains → Add Domain, informar `liinbrazil.org`. O painel gera três registros DNS — SPF, DKIM e retorno. Guardar para o passo 5, onde entram junto com os do domínio.

## 4 · Importar na Vercel

vercel.com/new → Import Git Repository → escolher `liin-brazil-site`.

- **Framework Preset:** Other
- **Build Command:** vazio
- **Output Directory:** vazio
- **Root Directory:** `./`

Antes de clicar em Deploy, abrir *Environment Variables* e cadastrar:

| Nome | Valor |
|---|---|
| `RESEND_API_KEY` | a chave do passo 3 |
| `CONTATO_DESTINO` | kurt@liinbrazil.org |

Marcar Production, Preview e Development. Deploy.

Em cerca de trinta segundos sai uma URL do tipo `liin-brazil-site.vercel.app`. **Testar o formulário nessa URL antes de seguir.**

## 5 · Domínio

Project → Settings → Domains → adicionar `liinbrazil.org` e `www.liinbrazil.org`.

No provedor onde o domínio está registrado, criar:

| Tipo | Nome | Valor |
|---|---|---|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |
| TXT / CNAME | (do Resend) | os três registros do passo 3 |

O certificado TLS é emitido automaticamente. Propagação leva de minutos a algumas horas. Enquanto isso, a URL `.vercel.app` continua funcionando.

## 6 · Verificações finais

- Formulário envia e o e-mail chega — testar com dados reais
- `liinbrazil.org` e `www` abrem, ambos em HTTPS
- As oito rotas respondem sem `.html` na URL
- Compartilhar um link no WhatsApp e conferir o cartão de prévia
- Ativar Vercel Analytics no painel (sem cookie, dispensa banner de consentimento)

## 7 · Rotina de alterações

```bash
git add . && git commit -m "descrição" && git push
```

O push publica. Cada branch gera uma URL de preview própria — útil para revisar antes de ir ao ar.

---

# Ainda pendente

| Item | Onde |
|---|---|
| Retrato de Kurt Morriesen | quem-somos.html, proporção 4:5 |
| `og-liin.png`, 1200×630 | img/ — sem ele, links compartilhados saem sem cartão |
| Capas reais do Smart Report | img/report-fev26.svg e report-out25.svg |
| URLs reais dos materiais e notícias | inteligencia.html, hoje em `#` |
| Revisão jurídica da Política de Privacidade | privacidade.html |
| Mapa em 483 KB | img/mapa-presenca.svg — pode cair para ~120 KB |

---

# Quando o portal de filiados entrar

Nada muda na hospedagem. O projeto ganha Next.js na raiz, estas oito páginas viram rotas estáticas e o portal entra como rota autenticada — mesma conta, mesmo domínio, sem migração.

**Fase A** · Supabase Auth, tabelas de instituições e usuários
**Fase B** · Bases de municípios, RPPS, fundos e regulações com RLS por instituição
**Fase C** · Stripe, assinatura anual e webhook de ativação
