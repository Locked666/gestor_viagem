# PRD.md

## Visão do Produto

O Gestor de Viagens é um sistema web para controlar viagens corporativas, usuários técnicos, despesas, movimentações financeiras, relatórios de diárias, calendário de viagens e notificações em tempo real.

O problema resolvido pelo sistema, conforme comportamento identificado no código, é centralizar o ciclo operacional de viagens: cadastro, atribuição de técnicos, acompanhamento de status, registro de gastos/documentos, lançamentos financeiros e emissão de relatórios de diárias.

## Funcionalidades Identificadas

| Funcionalidade | Descrição | Módulos envolvidos | Fluxo resumido | Regras identificadas |
| --- | --- | --- | --- | --- |
| Login por usuário/senha | Permite autenticação por username/email e senha | `authentication`, `Users` | Formulário `/login` valida credenciais e cria sessão Flask-Login | Usuário precisa existir e estar ativo quando buscado por username |
| Registro público | Cria usuário via tela de registro | `authentication`, `Users` | `/register` valida username/email duplicados e cria conta | Username e email devem ser únicos |
| Login OAuth | Permite autenticação por GitHub/Google quando configurado | `authentication.oauth`, Flask-Dance | Callback OAuth busca dados externos, cria ou autentica usuário | Requer `GITHUB_ID/GITHUB_SECRET` ou `GOOGLE_ID/GOOGLE_SECRET` |
| Logout | Encerra sessão autenticada | `authentication` | `/logout` chama `logout_user` | Não identificado controle adicional |
| Gestão de usuários | Admin lista, busca, cria, altera e exclui usuários | `users`, `Users` | `/users` aceita GET/POST/PUT/DELETE | Apenas admin acessa tela; não exclui último usuário; não exclui usuário com viagens vinculadas |
| Reset de senha próprio | Usuário altera a própria senha | `users`, `authentication.util` | `/users/reset_password` valida senha atual e nova senha | Nova senha deve ter pelo menos 6 caracteres |
| Reset de senha por admin | Admin redefine senha de outro usuário para o username | `users` | `/users/reset_password/key` altera senha e marca `first_acess=True` | Apenas admin |
| Listagem de viagens | Lista viagens ativas em andamento operacional | `travel` | `/travel` GET renderiza tabela | Exclui status `Concluída` e `Cancelada` na listagem inicial |
| Filtro de viagens | Filtra viagens por data, status, entidade, descrição e viagens próprias | `travel` | `/travel` POST retorna JSON | Pode restringir por técnico atual quando `filterMyTravel=True` |
| Criação de viagem | Agenda viagem com entidade, datas, tipo, local, veículo e técnicos | `travel`, `notify` | `/travel/add` POST cria `RegistroViagens` e `TecnicosViagens` | Deve informar pelo menos um técnico |
| Edição de viagem | Exibe e atualiza informações operacionais da viagem/técnico | `travel`, `expense`, `finance` | `/travel/edit` GET/PUT | Usuário precisa ser admin ou técnico vinculado; valor total de diárias deve bater com cálculo |
| Calendário de viagens | Exibe página de calendário e eventos JSON | `travel`, `api_rest` | `/travel/events` renderiza tela; `/api/v1/events/get` retorna eventos | Eventos por status recebem cores específicas |
| Consulta de entidades | Busca entidades por nome para autocomplete | `api_rest`, `Entidades` | `/api/v1/entidade?q=` retorna lista JSON | Busca usa `ilike` no nome |
| Consulta de viagem | Retorna dados de uma viagem | `api_rest`, `travel` | `/api/v1/travel/get/<id>` | Permissão validada, exceto modo calendário com validação relaxada |
| Cancelamento de viagem | Marca viagem como cancelada | `api_rest`, `notify` | `/api/v1/travel/cancel/<id>` | Usuário precisa ter permissão na viagem |
| Conclusão de viagem | Marca viagem como concluída | `api_rest`, `notify` | `/api/v1/travel/finish/<id>` | Validação de permissão relaxada no código |
| Exclusão de viagem | Remove viagem, técnicos, gastos e documentos associados | `api_rest`, `travel`, `notify` | `/api/v1/travel/delete/<id>` | Remove documentos físicos quando vinculados |
| Upload de documento | Salva arquivo e metadados de documento | `api_rest`, `DocumentosViagens` | `/api/v1/upload` multipart | Aceita `pdf`, `jpg`, `jpeg`, `png` |
| Visualização de documento | Retorna arquivo ou metadados | `api_rest` | `/api/v1/file/get/<id>` e `/api/v1/file/get/info/<id>` | Requer login |
| Listagem/associação de técnicos | Lista técnicos ativos e vincula técnicos a viagem | `api_rest`, `Users`, `TecnicosViagens` | `/api/v1/users/technicians` GET/POST | Técnicos são usuários `active=True` e `diaria=True` |
| Lançamento de gasto | Registra gasto de viagem | `expense`, `GastosViagens` | `/expense` POST valida e cria gasto | Tipos válidos: Alimentação, Combustível, Estadia, Outras |
| Exclusão de gasto | Remove gasto pendente | `expense` | `/expense/delete` DELETE | Só exclui se status for `Pendente` |
| Totalizador de despesas | Calcula total e estorno por viagem/técnico | `api_rest`, `GastosViagens` | `/api/v1/expense/get/totalizer` | Usa usuário atual quando técnico não informado |
| Lançamento financeiro | Registra crédito/débito de viagem | `finance`, `MovFinanceira` | `/finance/travel/` POST | Tipo válido: `C` ou `D`; descrição, data e valor são obrigatórios |
| Exclusão financeira | Exclui movimentação financeira | `finance` | `/finance/travel/delete/<id>` | Retorna erro se não encontrar o registro |
| Dashboard do usuário | Retorna cards e gráficos de diárias/viagens | `dashboard` | `/dashboard/get/user/cards` e `/dashboard/get/user/graphics` | Usa usuário autenticado |
| Cards de edição de viagem | Consolida diária, despesa e financeiro por viagem | `dashboard` | `/dashboard/cards/travel/edit/<travel_id>` | `@login_required` está comentado; necessita validação de segurança |
| Relatório de diárias | Gera HTML de relatório de diárias por competência ou período | `reports` | `/reports/travel` POST com `reportRequest='daily'` | Usuário comum não pode emitir relatório para outro usuário |
| Tabela dinâmica | Lista/cria/edita/deleta/exporta registros de modelos configurados | `dyn_dt` | Rotas `/dynamic-dt`, `/dynamic-dt/<aPath>`, `/create`, `/update`, `/delete`, `/export` | Configuração atual necessita validação para `RegistroViagens` |
| Notificação em tempo real | Emite eventos de viagem por Socket.IO | `notify`, `socketio_instance` | Chamado após criar/editar/cancelar/concluir/excluir viagem | Eventos usam principalmente canal `new_travel` |
| Download de instalador/arquivo | Disponibiliza arquivo do diretório `download/` | `api_rest` | `/api/v1/download/file/<file>` | Rota pública, sem `login_required` |
| Health check de notificação | Retorna status da API de notificações | `api_rest` | `/api/v1/notify/CheckStatus` | Rota pública |

## Perfis de Usuário

| Perfil | Evidência | Permissões observadas |
| --- | --- | --- |
| Administrador | Campo `Users.admin` | Pode acessar gestão de usuários, alterar admin, resetar senha de usuários, operar viagens fora do vínculo técnico em validações |
| Usuário/Técnico | Campos `Users.active`, `Users.diaria` e vínculos em `TecnicosViagens` | Acessa viagens vinculadas, lança informações, despesas e relatórios próprios |
| Usuário com diária | `Users.diaria=True` | Aparece em seleção/listagem de técnicos e relatórios |
| Integração de notificação | Rotas públicas de status/download e Socket.IO | Consumidor externo não modelado no banco; uso necessita validação |

Perfis de cliente final, operador financeiro dedicado ou aprovador formal não foram identificados como modelos separados.

## Regras de Negócio

| Regra | Local observado |
| --- | --- |
| Usuário autenticado é requerido na maioria das rotas operacionais | Decoradores `@login_required` |
| Acesso a viagem exige usuário admin ou técnico vinculado | `apps/api_rest/services.py::validade_user_travel` |
| Viagem recém-criada inicia com status padrão `Agendada` | `RegistroViagens.status` |
| Viagem pode ser `Agendada`, `Em Andamento`, `Concluída`, `Cancelada` e há referência a `Parcial` em comentário/modelo | Modelos e filtros |
| Criação de viagem exige ao menos um técnico | `apps/travel/routes.py` |
| Técnicos selecionáveis são usuários ativos com diária habilitada | `/api/v1/users/technicians` |
| Cálculo de diárias considera retorno até 07:30 como não contabilizando o dia do retorno | `calcular_diarias` |
| Valor total de diárias informado deve corresponder a quantidade multiplicada por `Parametros.valor_diaria` | `travel.edit_travel` PUT |
| Gastos aceitam tipos Alimentação, Combustível, Estadia e Outras | `expense.services` |
| Gastos aceitam status Pendente, Aprovado, Rejeitado e Parcial | `expense.services` |
| Gasto Parcial exige motivo e, em PUT, valor atual | `expense.services` |
| Gasto Rejeitado exige motivo | `expense.services` |
| Exclusão de gasto só é permitida para status Pendente | `expense.routes` |
| Financeiro aceita tipo `C` para crédito e `D` para débito | `finance.services` |
| Usuário comum não pode emitir relatório para outro usuário | `reports.services` |
| Não é permitido excluir o último usuário | `users.routes` |
| Não é permitido excluir usuário vinculado a viagens | `users.routes` |
| Upload aceita somente PDF/JPG/JPEG/PNG | `api_rest.routes` |

## Requisitos Funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve autenticar usuários por username/email e senha |
| RF-02 | O sistema deve suportar OAuth GitHub e Google quando configurado |
| RF-03 | O sistema deve permitir gestão de usuários por administradores |
| RF-04 | O sistema deve permitir reset de senha pelo próprio usuário |
| RF-05 | O sistema deve permitir reset de senha de usuário por administrador |
| RF-06 | O sistema deve listar, filtrar, criar, editar, cancelar, concluir e excluir viagens |
| RF-07 | O sistema deve associar técnicos a viagens |
| RF-08 | O sistema deve validar acesso a viagens por vínculo técnico ou perfil admin |
| RF-09 | O sistema deve expor eventos de viagem para calendário |
| RF-10 | O sistema deve permitir busca de entidades por nome |
| RF-11 | O sistema deve permitir upload e consulta de documentos de viagem |
| RF-12 | O sistema deve permitir lançamento e exclusão de gastos |
| RF-13 | O sistema deve calcular totalizadores de despesas por viagem/técnico |
| RF-14 | O sistema deve permitir lançamento e exclusão de movimentações financeiras |
| RF-15 | O sistema deve gerar indicadores de dashboard |
| RF-16 | O sistema deve gerar relatório HTML de diárias |
| RF-17 | O sistema deve emitir notificações em tempo real para eventos de viagem |
| RF-18 | O sistema deve oferecer tabela dinâmica para modelos configurados |

## Requisitos Não Funcionais

| Categoria | Identificação no código |
| --- | --- |
| Segurança | Uso de Flask-Login, cookies HTTPOnly em produção, senha com hash, rotas protegidas por `@login_required` |
| Autorização | Controle por `Users.admin` e vínculo de técnico em viagem |
| Performance | Consultas SQLAlchemy diretas; não foi identificado cache aplicado |
| Escalabilidade | Gunicorn configurado com 1 worker no arquivo local; Render usa `WEB_CONCURRENCY=4`; Socket.IO em modo `threading` |
| Logs | Gunicorn com `accesslog='-'`, `loglevel='debug'`; prints em alguns fluxos |
| Monitoramento | Não identificado |
| Internacionalização | Locale `pt_BR.UTF-8` usado para moeda e textos majoritariamente em português |
| Disponibilidade | Docker Compose com app e Nginx; não há serviço Redis ou banco externo declarado no compose |
| Persistência | SQLite por padrão; DB relacional externo opcional via env vars |
| Build frontend | Vite, Sass, PostCSS e cssnano para assets |

## Limitações Atuais

| Limitação | Observação |
| --- | --- |
| CI/CD não identificado | Existe `render.yaml`, mas pipeline CI/CD completo não foi encontrado |
| Monitoramento não identificado | Não há configuração observada de APM, métricas ou tracing |
| Redis não declarado no Docker Compose | Celery usa Redis local, mas compose não sobe Redis |
| Módulo de frota incompleto | Rotas não implementam operações e modelos usam `db.model` |
| Tabela dinâmica pode estar inconsistente | Config aponta para classe não encontrada no módulo indicado |
| Alguns endpoints públicos | Health check/download são públicos; um endpoint de dashboard está sem `login_required` explícito |
| Estratégia de migrations dupla | Há Flask-Migrate/Alembic e scripts SQL próprios em `update_db` |
| Validações de alguns fluxos retornam formatos mistos | Algumas services retornam `dict`, outras `jsonify` ou exceções |
| Email configurado, uso operacional não identificado | Variáveis SMTP existem, mas envio efetivo não foi observado nos fluxos lidos |
| Filas/workers em uso de negócio não identificados | Celery possui tarefas de teste, sem regra de negócio real identificada |

