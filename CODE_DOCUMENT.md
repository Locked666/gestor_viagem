# CODE_DOCUMENT.md

## Stack Tecnológica

| Categoria | Tecnologias identificadas |
| --- | --- |
| Linguagem backend | Python 3.10 no Dockerfile |
| Framework web | Flask 3.1.0 |
| Templates | Jinja2 |
| Formulários | WTForms, Flask-WTF, WTForms-Alchemy |
| Autenticação | Flask-Login, Flask-Dance, hash customizado em `apps.authentication.util` |
| ORM | Flask-SQLAlchemy, SQLAlchemy |
| Migrações | Flask-Migrate, Alembic |
| Realtime | Flask-SocketIO |
| Tarefas | Celery com Redis configurado |
| Frontend | HTML/Jinja, Bootstrap/Material Dashboard, JavaScript em `static/assets/js/application` |
| Build frontend | Vite, Sass, PostCSS, cssnano, autoprefixer |
| Servidor produção | Gunicorn |
| Proxy | Nginx |
| Container | Docker e Docker Compose |
| Deploy declarado | Render via `render.yaml` |
| Banco padrão | SQLite em `apps/db.sqlite3` quando env vars de DB não estão configuradas |
| Banco externo opcional | DB relacional via `DB_ENGINE`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASS` |

## Estrutura de Pastas

Árvore principal observada:

```text
.
├── apps/
│   ├── api_rest/
│   ├── authentication/
│   ├── charts/
│   ├── dashboard/
│   ├── dyn_dt/
│   ├── exceptions/
│   ├── expense/
│   ├── finance/
│   ├── fleets/
│   ├── home/
│   ├── reports/
│   ├── travel/
│   ├── users/
│   ├── utils/
│   ├── __init__.py
│   ├── config.py
│   ├── helpers.py
│   ├── models.py
│   ├── notify.py
│   ├── socketio_instance.py
│   └── tasks.py
├── templates/
│   ├── authentication/
│   ├── calendar/
│   ├── dashboard/
│   ├── dyn_dt/
│   ├── error/
│   ├── finance/
│   ├── fleets/
│   ├── includes/
│   ├── layouts/
│   ├── pages/
│   ├── relatorios/
│   ├── travel/
│   └── users/
├── static/
│   └── assets/
│       ├── css/
│       ├── fonts/
│       ├── images/
│       ├── img/
│       ├── js/
│       └── scss/
├── migrations/
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── update_db/
│   ├── main.py
│   └── scripts/
├── nginx/
├── download/
├── images_readme/
├── media/
├── uploads/
├── run.py
├── requirements.txt
├── package.json
├── vite.config.js
├── postcss.config.js
├── Dockerfile
├── docker-compose.yml
├── gunicorn-cfg.py
├── render.yaml
├── env.sample
├── README.md
└── CHANGELOG.md
```

## Descrição dos Principais Arquivos

| Arquivo | Responsabilidade | Dependências/uso |
| --- | --- | --- |
| `run.py` | Ponto de entrada; seleciona config, cria app, cria tabelas, inicializa Migrate, Minify e Socket.IO | `apps.create_app`, `db`, `Migrate`, `socketio` |
| `apps/__init__.py` | Define `db`, `login_manager`, registra Blueprints e extensões, cria Flask app | Flask, SQLAlchemy, Flask-Login, Socket.IO |
| `apps/config.py` | Configura env vars, banco, mail, Celery, OAuth, CDN e tabelas dinâmicas | `os.getenv`, `Path` |
| `apps/socketio_instance.py` | Instância global de Socket.IO | `flask_socketio.SocketIO` |
| `apps/models.py` | Modelos globais `Entidades`, `Parametros` e enum `CURRENCY_TYPE` | `db` |
| `apps/authentication/models.py` | Modelo `Users`, modelo OAuth e loaders Flask-Login | Flask-Login, Flask-Dance, SQLAlchemy |
| `apps/travel/models.py` | Modelos centrais de viagem, técnicos, gastos e documentos | `db`, relações com `users` e `entidades` |
| `apps/finance/models.py` | Modelo de movimentação financeira | `db` |
| `apps/fleets/models.py` | Modelos pretendidos para frota e impressão de requisição | Necessita validação por uso de `db.model` |
| `apps/api_rest/routes.py` | API JSON principal do sistema | Flask, Flask-Login, models, upload, notificações |
| `apps/api_rest/services.py` | Validação de permissão em viagens | `current_user`, `RegistroViagens`, `TecnicosViagens` |
| `apps/travel/routes.py` | Telas e ações principais de viagens | Templates, models, services, notificações |
| `apps/expense/services.py` | Validação e inclusão de gastos | `GastosViagens`, `Users`, `RegistroViagens` |
| `apps/finance/services.py` | Validação, inclusão e exclusão financeira | `MovFinanceira`, `Users`, `RegistroViagens` |
| `apps/reports/services.py` | Consulta e renderização de relatórios de diárias | SQLAlchemy queries, templates |
| `apps/dashboard/services.py` | Agregações de cards e gráficos | SQLAlchemy `func`, `current_user` |
| `apps/notify.py` | Emissão de eventos Socket.IO | `socketio`, `Users`, `Entidades` |
| `apps/tasks.py` | Celery app e tarefas de teste | Celery, Redis |
| `Dockerfile` | Imagem Python 3.10, instala requirements e executa Gunicorn | `requirements.txt`, `gunicorn-cfg.py` |
| `docker-compose.yml` | Sobe app e Nginx em redes bridge | Não declara banco ou Redis |
| `nginx/appseed-app.conf` | Proxy reverso de `:5085` para app em `appseed_app:5005` | Nginx |
| `gunicorn-cfg.py` | Bind `0.0.0.0:5005`, 1 worker e logs em stdout | Gunicorn |
| `render.yaml` | Configuração de serviço web Render | Build `./build.sh`, start `gunicorn run:app` |
| `env.sample` | Exemplo de variáveis de ambiente | Flask, DB, OAuth, SMTP |

## Fluxo da Aplicação

### Inicialização

1. `run.py` lê `DEBUG` do ambiente.
2. Seleciona `DebugConfig` ou `ProductionConfig`.
3. Chama `create_app(app_config)`.
4. `create_app` configura templates/static, carrega config, registra extensões e Blueprints.
5. Registra Blueprints OAuth GitHub/Google em `/login`.
6. Inicializa Socket.IO.
7. Registra handler para `InvalidUsage`.
8. `run.py` executa `db.create_all()` dentro do contexto da aplicação.
9. Inicializa `Migrate(app, db)`.
10. Em produção, aplica `Flask-Minify`.
11. Em execução direta, roda `socketio.run(app, host='0.0.0.0', port=5000, debug=True)`.

### Fluxo de Requisição

```text
Browser/cliente
  -> Flask Blueprint route
  -> login_required quando presente
  -> validações de request/form/json
  -> services ou queries SQLAlchemy
  -> db.session quando há persistência
  -> render_template, jsonify, redirect ou send_from_directory
```

### Fluxo de Autenticação

```text
/login
  -> LoginForm
  -> Users.find_by_username ou Users.find_by_email
  -> verify_pass
  -> login_user
  -> redirect home
```

Rotas protegidas usam Flask-Login. O `unauthorized_handler` redireciona para `/login`.

### Fluxo de Dados de Viagem

```text
/travel/add
  -> RegistroViagens
  -> TecnicosViagens
  -> send_notification
  -> Socket.IO event
```

```text
/travel/edit
  -> validade_user_travel
  -> TecnicosViagens
  -> GastosViagens
  -> MovFinanceira
  -> Parametros.valor_diaria
  -> render_template ou JSON
```

## APIs Identificadas

### Authentication e páginas

| Método | Rota | Finalidade | Auth | Payload esperado | Retorno identificado |
| --- | --- | --- | --- | --- | --- |
| GET | `/login` | Renderizar login | Não | Não aplicável | HTML |
| POST | `/login` | Autenticar usuário | Não | Form `username`, `password`, `login` | Redirect ou HTML com erro |
| GET | `/register` | Renderizar registro | Não | Não aplicável | HTML |
| POST | `/register` | Criar usuário | Não | Form de registro | HTML com sucesso/erro |
| GET | `/logout` | Encerrar sessão | Não explícito | Não aplicável | Redirect |
| GET | `/github` | Login GitHub | Não | OAuth | Redirect |
| GET | `/google` | Login Google | Não | OAuth | Redirect |
| GET | `/` | Página inicial | Sim | Não aplicável | HTML |
| GET/POST | `/profile` | Perfil do usuário | Sim | Form em POST | HTML/redirect |

### Usuários

| Método | Rota | Finalidade | Auth | Payload esperado | Retorno identificado |
| --- | --- | --- | --- | --- | --- |
| GET | `/users` | Listar/buscar usuários | Sim, admin para tela | Query `search` opcional | HTML |
| POST | `/users` | Criar usuário | Sim, admin | JSON com `username`, `email`, `setor`, flags | JSON |
| PUT | `/users` | Atualizar usuário | Sim, admin | JSON com `user_id`, `username`, `email`, `setor`, flags | JSON |
| DELETE | `/users` | Excluir usuário | Sim, admin | JSON com `user_id` | JSON |
| GET | `/users/reset_password` | Renderizar reset | Sim | Não aplicável | HTML |
| PUT | `/users/reset_password` | Alterar senha própria | Sim | JSON `current_password`, `new_password` | JSON |
| PUT | `/users/reset_password/key` | Resetar senha de usuário | Sim, admin | JSON `user_id` | JSON |

### Viagens

| Método | Rota | Finalidade | Auth | Payload esperado | Retorno identificado |
| --- | --- | --- | --- | --- | --- |
| GET | `/travel` | Listar viagens | Sim | Query `message` opcional | HTML |
| POST | `/travel` | Filtrar viagens | Sim | JSON com filtros de data/status/entidade/descrição | JSON |
| GET | `/travel/add` | Formulário de criação | Sim | Query `date_start`, `date_end` opcionais | HTML |
| POST | `/travel/add` | Criar viagem | Sim | JSON com entidade, datas, tipo, local, veículo, técnicos | JSON |
| GET | `/travel/edit` | Tela de edição | Sim | Query `idTravel`, `idUser` opcional | HTML/redirect |
| PUT | `/travel/edit` | Atualizar dados do técnico na viagem | Sim | JSON com `id_viagem`, datas, diária, relatório, técnico | JSON |
| GET | `/travel/events` | Tela de calendário | Sim | Não aplicável | HTML |

### API REST `/api/v1`

| Método | Rota | Finalidade | Auth | Payload esperado | Retorno identificado |
| --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/entidade` | Buscar entidades | Sim | Query `q` | JSON lista `{id,nome}` |
| GET | `/api/v1/travel/get/<integer>` | Obter viagem | Sim | Query `calendar=true` opcional | JSON |
| GET | `/api/v1/get/infoForTravel/tecnical/` | Info de viagem por técnico | Sim | Query `idTravel`, `idTecnical` | JSON |
| DELETE | `/api/v1/travel/delete/<integer>` | Deletar viagem | Sim | Path id | JSON |
| PUT | `/api/v1/travel/cancel/<integer>` | Cancelar viagem | Sim | Path id | JSON |
| PUT | `/api/v1/travel/finish/<integer>` | Concluir viagem | Sim | Path id | JSON |
| PUT | `/api/v1/travel/edit` | Editar viagem | Sim | JSON `id_viagem` e campos opcionais | JSON |
| GET | `/api/v1/expense/get/totalizer` | Totalizar despesas | Sim | Query `id_viagem`, `id_tecnico` opcional | JSON |
| GET/POST | `/api/v1/events/get` | Buscar eventos de calendário | Sim | Query filtros/status | JSON lista de eventos |
| GET | `/api/v1/upload` | Validar rota/caminho upload | Sim | Não aplicável | JSON |
| POST/PUT | `/api/v1/upload` | Enviar documento | Sim | Multipart `arquivo`, `viagemId`, `tipoDocumento` | JSON |
| GET | `/api/v1/file/get/<documento_id>` | Obter arquivo | Sim | Path id | Arquivo |
| GET | `/api/v1/file/get/info/<documento_id>` | Obter metadados do documento | Sim | Path id | JSON |
| GET | `/api/v1/users/technicians` | Listar técnicos | Sim | Não aplicável | JSON |
| POST | `/api/v1/users/technicians` | Vincular técnicos à viagem | Sim | JSON `idTravel`, `newTechnicians` | JSON |
| GET | `/api/v1/notify/CheckStatus` | Status da API de notificação | Não | Não aplicável | JSON |
| GET | `/api/v1/download/file/<file>` | Download de arquivo | Não | Path filename | Arquivo |

### Despesas, Financeiro, Dashboard, Relatórios e Dyn DT

| Método | Rota | Finalidade | Auth | Payload esperado | Retorno identificado |
| --- | --- | --- | --- | --- | --- |
| POST | `/expense` | Criar gasto | Sim | JSON de gasto | JSON |
| PUT | `/expense` | Não implementado funcionalmente | Sim | Não identificado | JSON genérico |
| GET | `/expense` | Não implementado funcionalmente | Sim | Não identificado | JSON genérico após `pass` |
| DELETE | `/expense/delete` | Excluir gasto | Sim | JSON `id_gasto` | JSON |
| GET | `/finance` | Tela financeira | Sim | Não aplicável | HTML |
| GET | `/finance/get/travel/<travel_id>` | Consulta financeira de viagem | Sim | Path id | Não identificado; função incompleta |
| POST | `/finance/travel/` | Criar movimento financeiro | Sim | JSON financeiro | JSON |
| DELETE | `/finance/travel/delete/<id_finance>` | Excluir movimento financeiro | Sim | Path id | JSON |
| GET | `/dashboard/get/user/cards` | Cards do usuário | Sim | Não aplicável | JSON |
| GET | `/dashboard/get/user/graphics` | Gráficos do usuário | Sim | Não aplicável | JSON |
| GET | `/dashboard/cards/travel/edit/<travel_id>` | Cards da edição de viagem | Não explícito | Path id | JSON |
| GET | `/reports/travel` | Tela de relatórios | Não explícito | Não aplicável | HTML |
| POST | `/reports/travel` | Gerar relatório | Não explícito | JSON `reportRequest` e filtros | JSON |
| GET | `/dynamic-dt` | Índice de tabelas dinâmicas | Não explícito | Não aplicável | HTML |
| GET/POST | `/dynamic-dt/<aPath>` | Listar modelo dinâmico | Não explícito | Query/form | HTML |
| POST | `/create/<aPath>` | Criar item dinâmico | Sim | Form | Redirect |
| GET | `/delete/<aPath>/<id>` | Excluir item dinâmico | Sim | Path id | Redirect |
| POST | `/update/<aPath>/<id>` | Atualizar item dinâmico | Sim | Form | Redirect |
| GET | `/export/<aPath>` | Exportar CSV | Não explícito | Path modelo | CSV |

## Modelos de Dados

### `Users`

Tabela: `users`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `username` | String(64), unique | Login/nome |
| `email` | String(64), unique | Email |
| `password` | LargeBinary | Senha com hash |
| `bio` | Text | Opcional |
| `foto` | String(1000) | Caminho da foto |
| `setor` | String(100) | Setor do usuário |
| `admin` | Boolean | Perfil administrativo |
| `diaria` | Boolean | Indica usuário/técnico com diária |
| `active` | Boolean | Ativo |
| `supply_request` | Boolean | Permissão para requisição de abastecimento |
| `first_acess` | Boolean | Primeiro acesso |
| `created_at` | DateTime | Default no servidor |
| `oauth_github` | String(100) | Identidade GitHub |
| `oauth_google` | String(100) | Identidade Google |

### `OAuth`

Tabela definida pelo mixin `OAuthConsumerMixin` com FK `user_id` para `users.id`.

### `Entidades`

Tabela: `entidades`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `nome` | String(100) | Nome obrigatório |
| `data` | DateTime | Data |
| `tipo` | String(100) | Tipo |
| `ativo` | Boolean | Ativo |

### `Parametros`

Tabela: `parametros`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `valor_diaria` | Float | Valor padrão da diária |
| `supervisor` | String(100) | Supervisor |
| `n_script` | Integer | Último script SQL executado |

### `RegistroViagens`

Tabela: `registro_viagens`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `entidade_destino` | FK `entidades.id` | Entidade destino |
| `data_inicio` | DateTime | Início |
| `data_fim` | DateTime | Fim |
| `dia_todo` | Boolean | Viagem de dia todo |
| `status` | String(100) | Default `Agendada` |
| `tipo_viagem` | String(100) | Tipo |
| `local_viagem` | String(100) | Local |
| `descricao` | String(100) | Descrição |
| `veiculo` | String(100) | Veículo |
| `placa` | String(100) | Placa |
| `km_inicial` | String(100) | KM inicial |
| `km_final` | String(100) | KM final |
| `n_combustivel` | String(100) | Número do combustível |
| `total_gasto` | Float | Default 0.0 |
| `usuario` | FK `users.id` | Usuário que registrou |
| `ativo` | Boolean | Ativo |
| `data` | DateTime | Default `now()` |

Relacionamentos identificados:

| Relacionamento | Tipo |
| --- | --- |
| `RegistroViagens.entidade_rel` | `Entidades`, lazy `joined`, backref `viagens` |
| `RegistroViagens.usuario_rel` | `Users`, lazy `joined`, backref `viagens` |

### `TecnicosViagens`

Tabela: `tecnicos_viagens`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `viagem` | FK `registro_viagens.id` | Viagem |
| `tecnico` | FK `users.id` | Técnico |
| `atribuito` | Boolean | Indica atribuição/execução |
| `data_inicio` | DateTime | Início do técnico |
| `data_fim` | DateTime | Fim do técnico |
| `n_diaria` | String(100) | Número/quantidade de diária |
| `v_diaria` | Float | Valor da diária |
| `n_intranet` | String(100) | Número da visita/relatório intranet |
| `data` | DateTime | Default `now()` |

### `GastosViagens`

Tabela: `gastos_viagens`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `viagem` | FK `registro_viagens.id` | Viagem |
| `tecnico` | FK `users.id` | Técnico |
| `data_gasto` | DateTime | Data do gasto |
| `tipo_gasto` | String(100) | Tipo do gasto |
| `n_documento` | String(100) | Número do documento |
| `tipo_documento` | String(100) | Tipo do documento |
| `descricao` | String(100) | Descrição |
| `valor` | Float | Valor |
| `arquivo` | FK `documentos_viagens.id` | Documento |
| `ativo` | Boolean | Ativo |
| `estorno` | Boolean | Estorno |
| `status` | String(100) | Default `Pendente` |
| `motivo` | String(255) | Motivo de rejeição/parcial |
| `valor_atual` | Float | Valor após alterações |
| `usuario` | FK `users.id` | Usuário que alterou |
| `data` | DateTime | Default `now()` |

### `DocumentosViagens`

Tabela: `documentos_viagens`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `tipo` | String(100) | Tipo |
| `data` | DateTime | Default `now()` |
| `arquivo` | String(300) | Caminho do arquivo |

### `MovFinanceira`

Tabela: `mov_financeira`

| Campo | Tipo | Observação |
| --- | --- | --- |
| `id` | Integer PK | Identificador |
| `tecnico` | FK `users.id` | Técnico |
| `viagem` | FK `registro_viagens.id` | Viagem |
| `data_lanc` | DateTime | Data do lançamento |
| `tipo` | String(2) | `C` ou `D` |
| `descricao` | Text | Descrição |
| `valor` | Float | Valor |
| `data` | DateTime | Data |

### Modelos de tabela dinâmica

| Modelo | Tabela | Finalidade |
| --- | --- | --- |
| `PageItems` | `page_items` | Quantidade de itens por página |
| `HideShowFilter` | `hide_show_filter` | Visibilidade de colunas |
| `ModelFilter` | `model_filter` | Filtros persistidos por modelo |

### Modelos de frota

`apps/fleets/models.py` declara `Fleet` e `RequestPrint`, porém usa `db.model`. Essa definição necessita validação antes de uso operacional.

## Serviços e Regras

| Serviço | Responsabilidade | Regras observadas |
| --- | --- | --- |
| `validade_user_travel` | Verificar se usuário pode acessar viagem | Admin ou técnico vinculado; pode lançar exceção ou retornar dict |
| `validade_data_expense` | Validar gasto | Tipo/status obrigatórios; regras para Parcial/Rejeitado |
| `include_data_expense` | Inserir gasto | Admin pode informar técnico; usuário comum usa `current_user.id` |
| `validade_data_finance` | Validar financeiro | Exige viagem, data, descrição, tipo `C/D`, valor |
| `insert_data_finance` | Inserir movimento financeiro | Exige usuário e viagem existentes |
| `delete_finance` | Excluir movimento financeiro | Retorna erro se não encontrar |
| `get_travel_statistics_user` | Cards mensais do usuário | Compara mês atual e anterior |
| `get_diaries_last_12_months` | Série mensal de diárias | Agrupa por ano/mês |
| `get_travels_last_12_months` | Série mensal de viagens | Agrupa por ano/mês |
| `get_statistics_card_edit_travel` | Consolidação por viagem | Soma diárias, financeiro e despesas |
| `get_daily_travels` | Relatório de diárias | Usuário comum não consulta outro usuário |
| `calcular_diarias` | Cálculo de quantidade de diárias | Considera horário base 07:30 |
| `send_notification` | Eventos Socket.IO | Emite eventos para ações de viagem |

Jobs/workers:

| Item | Situação |
| --- | --- |
| `celery_test` | Tarefa de teste com estados STARTING/RUNNING/CLOSING/FINISHED |
| `celery_beat_test` | Tarefa agendada de teste a cada minuto |
| Jobs de negócio | Não identificado |

## Variáveis de Ambiente

| Nome | Finalidade | Obrigatoriedade identificada |
| --- | --- | --- |
| `DEBUG` | Seleciona modo Debug/Production | Opcional; default `False` em `run.py`, exemplo `True` |
| `FLASK_APP` | App Flask para CLI | Exemplo em `env.sample` |
| `FLASK_DEBUG` | Debug Flask para CLI | Exemplo em `env.sample` |
| `SECRET_KEY` | Chave Flask | Opcional; default `S3cret_999`, Render gera valor |
| `DB_ENGINE` | Engine de banco externo | Opcional; se ausente usa SQLite |
| `DB_NAME` | Nome do banco externo | Opcional |
| `DB_HOST` | Host do banco externo | Opcional |
| `DB_PORT` | Porta do banco externo | Opcional |
| `DB_USERNAME` | Usuário do banco externo | Opcional |
| `DB_PASS` | Senha do banco externo | Opcional |
| `GITHUB_ID` | Client ID OAuth GitHub | Opcional; habilita GitHub se junto de secret |
| `GITHUB_SECRET` | Client secret OAuth GitHub | Opcional |
| `GOOGLE_ID` | Client ID OAuth Google | Opcional; habilita Google se junto de secret |
| `GOOGLE_SECRET` | Client secret OAuth Google | Opcional |
| `MAIL_SERVER` | Servidor SMTP | Opcional; default `smtp.gmail.com` |
| `MAIL_PORT` | Porta SMTP | Opcional; default `587` |
| `MAIL_USE_TLS` | TLS SMTP | Opcional; default `True` |
| `MAIL_USE_SSL` | SSL SMTP | Opcional; default `False` |
| `MAIL_USER` | Usuário SMTP | Opcional |
| `MAIL_PASSWORD` | Senha SMTP | Opcional |
| `CDN_DOMAIN` | Domínio CDN | Opcional |
| `CDN_HTTPS` | Uso de HTTPS no CDN | Opcional |
| `WEB_CONCURRENCY` | Workers no Render | Declarado em `render.yaml` |

Configurações Celery estão fixas em `apps/config.py`:

| Config | Valor |
| --- | --- |
| `CELERY_BROKER_URL` | `redis://localhost:6379` |
| `CELERY_RESULT_BACKEND` | `redis://localhost:6379` |
| `CELERY_HOSTMACHINE` | `celery@app-generator` |

## Dependências Externas

| Dependência | Tipo | Uso identificado |
| --- | --- | --- |
| GitHub OAuth | API externa | Login social via Flask-Dance |
| Google OAuth | API externa | Login social via Flask-Dance |
| SMTP | Serviço externo | Configuração disponível; envio efetivo não identificado nos fluxos lidos |
| Redis | Serviço de infraestrutura | Broker/backend Celery configurado |
| Nginx | Proxy | Encaminha porta 5085 para app |
| Render | Plataforma cloud | Arquivo de deploy presente |
| Sistema de arquivos | Infra local | Uploads em `uploads/documentos`, downloads em `download/` |

## Observações Técnicas

| Tema | Observação |
| --- | --- |
| Autenticação | O código principal usa Flask-Login/sessão; JWT aparece em helper/README, mas não foi observado como autenticação das rotas principais |
| Autorização | Regras principais usam `Users.admin` e vínculo em `TecnicosViagens` |
| Banco | SQLite é fallback/default; criação automática de tabelas ocorre no startup |
| Migrações | Há Alembic/Flask-Migrate e scripts SQL próprios em `update_db` |
| Frontend | Aplicação é server-rendered com JS modular em `static/assets/js/application` |
| Upload | Extensões permitidas são `pdf`, `jpg`, `jpeg`, `png` |
| Notificações | Socket.IO usa `async_mode='threading'` e CORS `*` |
| Relatórios | Relatório de diárias retorna HTML dentro de JSON |
| Localidade | Uso de `locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')` pode depender do host |
| Segurança | Algumas rotas não possuem `@login_required` explícito: relatórios, dynamic-dt e cards de edição de dashboard; necessita validação |
| Frota | Módulo existe, mas não há rotas funcionais identificadas |
| Helpers legados | `apps/helpers.py` referencia configurações como `Config.CURRENCY`, `Config.PAYMENT_TYPE`, `Config.STATE` não identificadas em `apps/config.py` |
| Compose | `docker-compose.yml` sobe app e Nginx, mas não sobe DB externo ou Redis |
| Porta | Gunicorn usa `5005`, Nginx expõe `5085`, execução direta via Socket.IO usa `5000` |

