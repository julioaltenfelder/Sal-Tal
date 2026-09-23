# SAL & TAL — O Churrasco · Plataforma

Plataforma web do serviço de churrasco premium a domicílio **SAL & TAL — O Churrasco**.
Aplicação completa e funcional (frente + servidor + banco de dados), não um protótipo.

> **Status atual: Fases 1 e 2 concluídas.** As próximas fases estão descritas
> no fim deste documento.

---

## O que já funciona (Fase 1)

- **Site do cliente** com a identidade da marca (logo, cores da brasa, tipografia premium).
- **Formulário 1 — Solicitação de Orçamento**, em passos visuais, mobile-first, com
  campos condicionais e validações (ex: limite de 30 adultos, data restrita às
  datas disponíveis).
- **Tudo é salvo de verdade** num banco de dados e continua lá depois de fechar o
  navegador ou reiniciar a aplicação.
- **Painel da equipe** (área administrativa) com login e senha, que lista as
  solicitações e mostra os detalhes de cada uma, com botão direto para o WhatsApp.
- **Deduplicação de cliente**: se o mesmo WhatsApp pedir orçamento de novo, o
  sistema reaproveita o cadastro em vez de duplicar.

### Fase 2 — Propostas e contratação

- **Editor de proposta** no admin, criado a partir da solicitação, com escopo,
  valor, condições, validade e ressalvas (o que o cliente vê).
- **Precificação interna confidencial**: tabela editável de insumos
  (quantidade × custo = subtotal), despesas e um resumo de conferência
  (custo total, receita, resultado bruto). **Sem fórmula automática de preço.**
- **Proposta por link seguro individual**: o cliente abre por um token
  aleatório, vê só o que pode ver (nunca custos) e **aceita ou recusa**.
- **Sinal de garantia (50%)** avisado de forma discreta na proposta; ao aceitar,
  o sistema **cria o evento** e registra o valor do sinal como pendente.
- **PDF** da proposta e **histórico de versões** (duplicar em nova versão).
- Botão de **enviar por WhatsApp** (monta a mensagem com o link).

---

## Como rodar (passo a passo)

Pré-requisito: ter o **Node.js 18+** instalado.

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o banco de dados e os dados iniciais (admin, datas, configuração)
npm run setup

# 3. Iniciar em modo desenvolvimento
npm run dev
```

Depois abra **http://localhost:3000** no navegador.

- Site do cliente: `/`
- Pedir orçamento: `/orcamento`
- Painel da equipe: `/admin`

### Acesso inicial do painel (TROQUE a senha depois)

- **Login:** `admin`
- **Senha:** `saletal2025`

---

## Decisões técnicas (em linguagem simples)

| Peça | Escolha | Por quê |
|---|---|---|
| Aplicação | **Next.js** (React) | Um só programa cuida da tela e do servidor. Menos coisas para manter. |
| Banco de dados | **SQLite** (um arquivo) | Zero manutenção, persiste os dados, ideal para começar. Migra para Postgres trocando 1 linha. |
| Estilo | **Tailwind CSS** | Visual consistente e responsivo (funciona bem no celular). |
| Login | Senha com **hash (bcrypt)** + sessão em cookie assinado | Segurança: a senha nunca é guardada em texto puro. |

**Para produção:** trocar em `prisma/schema.prisma` o `provider` de `sqlite` para
`postgresql` e ajustar a `DATABASE_URL`. O restante do código não muda.

---

## Segurança e dados (LGPD)

- Validação **no servidor** (nunca confia só no navegador).
- Senha do admin guardada com **hash bcrypt**.
- Área administrativa protegida — quem não está logado é redirecionado ao login.
- Coleta mínima de dados no Formulário 1.
- Custos e margens (Fase 2) ficam em campos **confidenciais**, nunca expostos ao cliente.

---

## Estrutura do projeto

```
prisma/
  schema.prisma      → modelo de dados (todas as entidades da jornada)
  seed.ts            → cria admin, configuração e datas disponíveis
src/
  app/
    page.tsx                       → site do cliente (landing)
    orcamento/                     → Formulário 1 (passos, validação, envio)
    admin/                         → painel da equipe (login, lista, detalhe)
  components/                      → cabeçalhos da marca e do admin
  lib/                             → banco, autenticação, validação, formatação, estados
  middleware.ts                    → protege as rotas /admin
public/logos/                      → logos originais da marca
```

---

## Roteiro das próximas fases

- **Fase 2 — Propostas e contratação:** ferramenta de precificação (estrutura
  editável), editor de propostas, link seguro para o cliente ver/aceitar, PDF,
  histórico de versões. *A lógica de cálculo de preço entra como configuração,
  definida à parte.*
- **Fase 3 — Preparação do evento:** Formulário 2 (liberado só após o aceite),
  ficha do evento, calendário, checklist, **sinal de garantia de 50%**.
- **Fase 4 — Gestão financeira:** fornecedores, compras, previsto x realizado,
  relatórios.

> O **sinal de garantia de 50%** já está previsto no modelo de dados desde a Fase 1
> (campos de valor, status e datas no evento), pronto para entrar em ação na Fase 3.
