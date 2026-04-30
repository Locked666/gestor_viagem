# AGENTS.md

## Visão Geral do Sistema

O projeto é uma aplicação web Flask para gestão de viagens corporativas, com foco em agendamento de viagens, associação de técnicos, controle de despesas, movimentações financeiras, relatórios de diárias, dashboards e notificações em tempo real.

A aplicação usa renderização server-side com templates Jinja, assets estáticos em `static/`, Blueprints Flask por domínio e persistência via SQLAlchemy. O ponto de entrada principal é `run.py`, que cria a aplicação a partir de `apps.create_app`, registra extensões, cria tabelas via `db.create_all()` e inicializa migrations com Flask-Migrate.

Principais módulos identificados:

| Módulo | Responsabilidade principal |
| --- | --- |
| `authentication` | Login, registro, logout, OAuth GitHub/Google e modelo de usuários |
| `home` | Dashboard inicial, páginas estáticas, perfil e atualização de entidades |
| `users` | Administração de usuários e reset de senha |
| `travel` | Listagem, criação, edição e calendário de viagens |
| `api_rest` | Endpoints JSON para viagens, entidades, eventos, upload, documentos, técnicos e notificações |
| `expense` | Lançamento e exclusão de gastos de viagens |
| `finance` | Lançamento e exclusão de movimentações financeiras |
| `dashboard` | Indicadores e gráficos do usuário/viagem |
| `reports` | Relatório de viagens/diárias |
| `dyn_dt` | Tabelas dinâmicas baseadas em modelos configurados |
| `fleets` | Estrutura inicial para frota; rotas sem comportamento funcional identificado |
| `notify` | Emissão de eventos Socket.IO para notificações de viagens |
| `tasks` | Tarefas Celery de teste e agendamento de teste |

## Arquitetura

A arquitetura identificada é uma aplicação Flask modular baseada em Blueprints. A divisão principal segue domínios funcionais dentro de `apps/`, com templates Jinja em `templates/`, arquivos estáticos em `static/` e configuração centralizada em `apps/config.py`.

Padrões utilizados:

| Padrão | Evidência no código |
| --- | --- |
| Application factory parcial | `apps.create_app(config)` cria e configura o Flask app |
| Blueprints por domínio | Registro em `apps/__init__.py` para `authentication`, `home`, `travel`, `api_rest`, etc. |
| ORM | `db = SQLAlchemy()` e modelos em `apps/models.py`, `apps/authentication/models.py`, `apps/travel/models.py`, `apps/finance/models.py` |
| Autenticação por sessão | Flask-Login com `login_user`, `logout_user`, `@login_required` |
| Templates server-side | Renderização com `render_template` em rotas de páginas |
| API JSON interna | Endpoints em `apps/api_rest/routes.py`, `apps/expense/routes.py`, `apps/finance/routes.py`, `apps/dashboard/routes.py` |
| Notificação em tempo real | `flask_socketio.SocketIO` em `apps/socketio_instance.py` e `apps/notify.py` |
| Migração/atualização de banco | Flask-Migrate em `migrations/` e scripts SQL em `update_db/scripts/` |

Divisão de responsabilidades:

| Camada | Componentes |
| --- | --- |
| Entrada HTTP | Blueprints em `apps/*/routes.py` |
| Regras/serviços | `apps/*/services.py`, `apps/api_rest/services.py`, `apps/utils/` |
| Persistência | SQLAlchemy models e `db.session` |
| Interface | Templates Jinja e JS/CSS em `templates/` e `static/assets/` |
| Infraestrutura | Dockerfile, docker-compose, Gunicorn, Nginx e Render |

## Agentes/Módulos do Sistema

### Authentication

| Item | Descrição |
| --- | --- |
| Nome | `apps.authentication` |
| Responsabilidade | Autenticar usuários por formulário ou OAuth, registrar contas e encerrar sessão |
| Dependências | Flask-Login, Flask-Dance, SQLAlchemy, `Users`, `OAuth`, `LoginForm`, `CreateAccountForm` |
| Entradas | Formulários de login/registro, callbacks OAuth GitHub/Google |
| Saídas | Sessão autenticada, redirecionamentos e templates de autenticação |
| Integrações | GitHub OAuth e Google OAuth quando variáveis de ambiente estão configuradas |

### Users

| Item | Descrição |
| --- | --- |
| Nome | `apps.users` |
| Responsabilidade | Gestão administrativa de usuários e reset de senha |
| Dependências | `Users`, `RegistroViagens`, `TecnicosViagens`, validações de usuário/senha |
| Entradas | Requisições GET/POST/PUT/DELETE em `/users`, PUT para reset de senha |
| Saídas | Templates de usuários ou respostas JSON |
| Integrações | Banco de dados via SQLAlchemy |

### Travel

| Item | Descrição |
| --- | --- |
| Nome | `apps.travel` |
| Responsabilidade | Criar, listar, filtrar, editar e exibir viagens/calendário |
| Dependências | `RegistroViagens`, `TecnicosViagens`, `GastosViagens`, `MovFinanceira`, `Entidades`, `Parametros`, `Users` |
| Entradas | Dados de viagem, filtros, técnicos, datas e informações de diárias |
| Saídas | Templates de viagem/calendário e respostas JSON |
| Integrações | `send_notification`, validação de permissão por `validade_user_travel` |

### API REST

| Item | Descrição |
| --- | --- |
| Nome | `apps.api_rest` |
| Responsabilidade | Expor endpoints JSON para entidades, viagens, eventos, upload, arquivos, técnicos e status de notificação |
| Dependências | Modelos de viagem, usuários, entidades, financeiro, documentos, Socket.IO indireto |
| Entradas | Query params, JSON, multipart upload e path params |
| Saídas | JSON, arquivos via `send_from_directory` |
| Integrações | Sistema de arquivos em `uploads/documentos` e `download/` |

### Expense

| Item | Descrição |
| --- | --- |
| Nome | `apps.expense` |
| Responsabilidade | Incluir e excluir gastos vinculados a viagens |
| Dependências | `GastosViagens`, `DocumentosViagens`, `validade_data_expense`, `include_data_expense` |
| Entradas | JSON de gasto e identificador de gasto para exclusão |
| Saídas | JSON de sucesso/erro |
| Integrações | Banco de dados e remoção de arquivos anexados quando aplicável |

### Finance

| Item | Descrição |
| --- | --- |
| Nome | `apps.finance` |
| Responsabilidade | Registrar e excluir movimentações financeiras de viagens |
| Dependências | `MovFinanceira`, `RegistroViagens`, validações financeiras e `validade_user_travel` |
| Entradas | JSON com data, descrição, viagem, tipo (`C` ou `D`) e valor |
| Saídas | JSON com movimentação criada ou resultado de exclusão |
| Integrações | Banco de dados |

### Reports

| Item | Descrição |
| --- | --- |
| Nome | `apps.reports` |
| Responsabilidade | Gerar relatório HTML de diárias por usuário/período ou competência |
| Dependências | `RegistroViagens`, `TecnicosViagens`, `Users`, `Entidades`, `Parametros` |
| Entradas | JSON com `reportRequest`, filtros de competência, período e usuário |
| Saídas | JSON contendo HTML renderizado do relatório |
| Integrações | Template `relatorios/model_print/relatorio_diarias_user.html` |

### Dashboard

| Item | Descrição |
| --- | --- |
| Nome | `apps.dashboard` |
| Responsabilidade | Retornar indicadores de cards e gráficos |
| Dependências | `TecnicosViagens`, `GastosViagens`, `MovFinanceira`, `current_user` |
| Entradas | Usuário autenticado ou `travel_id` |
| Saídas | JSON com indicadores e séries de 12 meses |
| Integrações | Banco de dados |

### Dynamic Data Table

| Item | Descrição |
| --- | --- |
| Nome | `apps.dyn_dt` |
| Responsabilidade | Criar tabela dinâmica para modelos configurados em `Config.DYNAMIC_DATATB` |
| Dependências | `PageItems`, `HideShowFilter`, `ModelFilter`, SQLAlchemy introspection |
| Entradas | Nome do modelo configurado, filtros, paginação e formulários |
| Saídas | Templates de tabela, CSV exportado e redirecionamentos |
| Integrações | Atualmente mapeia `Viagens` para `apps.models.RegistroViagens`, porém essa classe não foi identificada em `apps/models.py`; necessita validação |

### Notify

| Item | Descrição |
| --- | --- |
| Nome | `apps.notify` |
| Responsabilidade | Emitir eventos Socket.IO sobre criação, edição, cancelamento, conclusão e exclusão de viagens |
| Dependências | `socketio`, `Users`, `Entidades` |
| Entradas | Tipo de notificação, dados da viagem, mensagem e ID da viagem |
| Saídas | Eventos Socket.IO, principalmente no canal `new_travel` |
| Integrações | Socket.IO em modo `threading` com CORS liberado |

### Tasks

| Item | Descrição |
| --- | --- |
| Nome | `apps.tasks` |
| Responsabilidade | Tarefas Celery de teste e schedule a cada minuto |
| Dependências | Celery, Redis configurado em `Config.CELERY_BROKER_URL` e `Config.CELERY_RESULT_BACKEND` |
| Entradas | JSON serializado em tarefas de teste |
| Saídas | Estados de tarefa e payload final |
| Integrações | Redis local em `redis://localhost:6379` |

### Fleets

| Item | Descrição |
| --- | --- |
| Nome | `apps.fleets` |
| Responsabilidade | Estrutura inicial para frota |
| Dependências | `apps.fleets.models` |
| Entradas | Não identificado |
| Saídas | Não identificado |
| Integrações | Não identificado |

## Fluxos Principais

### Autenticação

1. Usuário acessa `/login`.
2. `apps.authentication.routes.login` valida usuário por username ou email.
3. Senha é validada por `verify_pass`.
4. Flask-Login executa `login_user`.
5. Usuário autenticado é redirecionado para a home.
6. Rotas protegidas usam `@login_required`.
7. Usuários não autenticados são redirecionados para `/login`.

OAuth GitHub/Google existe via Flask-Dance e cria/vincula usuários com campos `oauth_github` e `oauth_google`.

### Fluxo Operacional de Viagens

1. Usuário autenticado acessa `/travel`.
2. Viagens ativas e não concluídas/canceladas são listadas.
3. Usuário cria uma viagem em `/travel/add` com entidade, período, tipo, local, veículo, técnicos e descrição.
4. Sistema cria `RegistroViagens` e vínculos em `TecnicosViagens`.
5. `send_notification('new_travel', ...)` emite evento Socket.IO.
6. Usuário edita detalhes operacionais em `/travel/edit`, incluindo diárias, período técnico e relatório intranet.
7. APIs permitem cancelar, concluir, editar ou excluir viagens.

### Fluxo de Despesas

1. Documento pode ser enviado via `/api/v1/upload`.
2. Metadados são gravados em `DocumentosViagens`.
3. Gasto é lançado em `/expense` com viagem, técnico, tipo, valor, status e documento opcional.
4. Exclusão de gasto só é permitida quando status é `Pendente`.
5. Se houver documento, o arquivo físico e o registro de documento são removidos.

### Fluxo Financeiro

1. Usuário envia JSON para `/finance/travel/`.
2. `validade_data_finance` valida campos obrigatórios e tipo `C` ou `D`.
3. `validade_user_travel` valida acesso à viagem.
4. `insert_data_finance` cria `MovFinanceira`.
5. Exclusão ocorre por `/finance/travel/delete/<id_finance>`.

### Fluxo de Relatórios

1. Usuário acessa `/reports/travel`.
2. Sistema lista usuários ativos com `diaria=True`.
3. POST com `reportRequest='daily'` executa `get_daily_travels`.
4. O relatório consulta viagens atribuídas, não canceladas e dentro do período.
5. Retorna HTML renderizado com total de diárias e valor total.

### Comunicação Entre Módulos

| Origem | Destino | Finalidade |
| --- | --- | --- |
| `travel` | `api_rest.services` | Validação de permissão em viagens |
| `travel`/`api_rest` | `notify` | Emissão de notificações |
| `expense` | `travel.models` | Associar gastos a viagens e documentos |
| `finance` | `travel.models` | Validar viagem e técnico |
| `dashboard` | `travel`/`finance`/`expense` | Consolidar indicadores |
| `reports` | `travel`/`users`/`entidades` | Gerar relatórios de diárias |

## Dependências Críticas

| Tipo | Dependência | Uso |
| --- | --- | --- |
| Backend | Flask | Framework web |
| Backend | Flask-Login | Sessão e autenticação |
| Backend | Flask-SQLAlchemy / SQLAlchemy | ORM |
| Backend | Flask-Migrate / Alembic | Migrações |
| Backend | Flask-Dance | OAuth GitHub/Google |
| Backend | Flask-SocketIO | Notificações em tempo real |
| Backend | Celery / Redis | Tarefas assíncronas de teste |
| Backend | Gunicorn | Servidor WSGI em produção/container |
| Frontend | Bootstrap/Material Dashboard | Interface visual |
| Frontend | Vite, Sass, PostCSS | Build e minificação de assets |
| Infra | Docker / Docker Compose | Empacotamento e execução com Nginx |
| Infra | Nginx | Proxy reverso para Gunicorn |
| Externo | GitHub OAuth | Login social opcional |
| Externo | Google OAuth | Login social opcional |
| Externo | SMTP | Configuração de email presente; uso operacional não identificado |

## Riscos Técnicos Identificados

| Risco | Evidência | Impacto possível |
| --- | --- | --- |
| Divergência entre README e código | README cita JWT, mas autenticação observada usa Flask-Login; helper de token existe mas não foi visto aplicado às rotas principais | Documentação externa pode induzir entendimento incorreto |
| Modelo de frota possivelmente inválido | `apps/fleets/models.py` usa `db.model` em vez de `db.Model` | Falha ao importar/usar o módulo de frota |
| Endpoint de dashboard sem proteção explícita | `/dashboard/cards/travel/edit/<travel_id>` tem `@login_required` comentado | Exposição de estatísticas se rota estiver acessível |
| Configuração de tabela dinâmica possivelmente inconsistente | `Config.DYNAMIC_DATATB` aponta para `apps.models.RegistroViagens`, mas `RegistroViagens` está em `apps.travel.models` | Falha em tabela dinâmica para viagens |
| Uso direto de `db.create_all()` no startup | `run.py` cria tabelas automaticamente | Risco operacional em ambientes controlados por migrations |
| Scripts de atualização paralelos a migrations | Existem `migrations/` e `update_db/scripts/` | Possível divergência de estratégia de evolução do schema |
| Remoção física de arquivos em rotas de exclusão | `os.remove` em documentos associados | Falhas de filesystem podem interromper operações de exclusão |
| Locale fixo `pt_BR.UTF-8` | Vários módulos chamam `locale.setlocale` | Pode falhar em hosts sem locale instalado |
| Redis/Celery configurado localmente | Config usa `redis://localhost:6379`; compose não declara Redis | Tarefas podem não funcionar no container atual |
| Upload em caminho relativo | `UPLOAD_FOLDER = 'uploads/documentos'` | Dependência do diretório de execução do processo |

