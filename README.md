# 🚘 Sistema de Controle de Viagens Corporativas  

![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Flask](https://img.shields.io/badge/Flask-Framework-red)
![SQLAlchemy](https://img.shields.io/badge/ORM-SQLAlchemy-blueviolet)
![Bootstrap](https://img.shields.io/badge/UI-Bootstrap_5-purple)
![SocketIO](https://img.shields.io/badge/Realtime-Socket.IO-black)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

---

## 💡 Visão Geral  

O **Sistema de Controle de Viagens Corporativas** foi desenvolvido para **gerenciar todo o ciclo de viagens corporativas**, desde o agendamento até a prestação de contas.  

A aplicação oferece funcionalidades como **organização de viagens, controle de gastos, adiantamentos, relatórios financeiros e notificações em tempo real**, além de **diferenciação de acessos** conforme o tipo de usuário.  

Ideal para **empresas e instituições públicas**, o sistema foca em **usabilidade, segurança e produtividade**.  

---

## 📋 Sumário  

- [🖼️ Telas Principais](#️-telas-principais)  
- [🔔 Sistema de Notificações](#-sistema-de-notificações)  
- [⚙️ Funcionalidades](#️-funcionalidades)  
- [🧱 Arquitetura e Stack Tecnológica](#-arquitetura-e-stack-tecnológica)  
- [📂 Estrutura de Diretórios](#-estrutura-de-diretórios)  
- [🚀 Instalação e Execução](#-instalação-e-execução)  
- [📚 Aprendizados e Próximos Passos](#-aprendizados-e-próximos-passos)  
- [👨‍💻 Autor](#-autor)  

---

## 🖼️ Telas Principais  

### 🔐 Login  
Sistema de autenticação via **JWT**, com diferenciação de telas conforme o perfil do usuário.  
![Tela de Login](/images_readme/login_validade.png)  

---

### 🏠 Tela Inicial (Admin)  
Exibe resumo das viagens, botões de ação e funcionalidades administrativas.  
![Home Admin](/images_readme/img_home_admin.png)  

---

### 👤 Tela Inicial (Usuário)  
Interface simplificada para visualização e solicitação de viagens.  
![Home User](/images_readme/home_user.png)  

---

### 👥 Criação de Usuários  
Permite o cadastro de novos usuários com controle de perfis e permissões.  
![Criação de Usuário](/images_readme/creat_user.png)  

---

### 🧾 Listagem de Viagens  
Lista todas as viagens com **botões de ações rápidas** (editar, visualizar, excluir).  
![Lista de Viagens](/images_readme/travel_list_action.png)  

---

### 📅 Calendário de Viagens  
Permite visualizar os **detalhes das viagens** e criar novas diretamente pelo calendário.  
![Calendário Detalhes](/images_readme/details_travel_calendar.png)  
![Calendário Criação](/images_readme/create_travel_calendar.png)  

---

### 🧠 Autocomplete de Entidades  
Campo de busca inteligente com autocomplete otimizado para todos os formulários.  
![Autocomplete](/images_readme/creat_travel_autocomplet.png)  

---

### ✏️ Edição de Viagem  
Tela dedicada para **lançar gastos, adiantamentos e diárias**, além de editar detalhes da viagem.  
![Edição de Viagem](/images_readme/edit_travel.png)  

---

### 📊 Relatórios de Prestação de Contas  
Geração de relatórios detalhados sobre gastos, adiantamentos e valores de diárias.  
![Relatório de Viagem](/images_readme/report_travel.png)  

---

## 🔔 Sistema de Notificações  

O sistema conta com **notificações em tempo real via WebSocket (Socket.IO)**, exibindo alertas instantâneos sobre **criação, edição e exclusão de viagens**.  

![Instalação Notificações](/images_readme/install_notify.png)  
![Configuração Notificações](/images_readme/config_noity.png)  
![Mensagem de Notificação](/images_readme/notify_message.png)  

---

## ⚙️ Funcionalidades  

✅ Autenticação segura com **JWT**  
✅ Controle de acesso por **perfil de usuário (Admin / Padrão)**  
✅ Temas **Dark** e **Light**  
✅ Visualização de viagens em **calendário interativo**  
✅ Sistema de **notificações em tempo real**  
✅ **Autocomplete** com busca inteligente  
✅ **Relatórios financeiros e de diárias**  
✅ **Modo tela cheia** e **preview dinâmico**  

---

## 🧱 Arquitetura e Stack Tecnológica  

### **Front-end:**  
- Bootstrap 5  
- CSS / JS / JSX  
- HTML5 Responsivo  

### **Back-end:**  
- Python (Flask)  
- SQLAlchemy (ORM)  
- JWT Authentication  
- Socket.IO  
- SQLite (padrão) / PostgreSQL (opcional)  

### **Outros:**  
- Estrutura modular baseada em Blueprints  
- Padrões PEP8 e Clean Code  
- Comunicação em tempo real com Socket.IO  

---

## 📂 Estrutura de Diretórios  

```bash
📦 sistema-controle-viagem
├── app/
│   ├── static/               # Arquivos estáticos (CSS, JS, imagens)
│   ├── templates/            # Páginas HTML (Jinja)
│   ├── routes/               # Blueprints e rotas do sistema
│   ├── models/               # Modelos do banco de dados (SQLAlchemy)
│   ├── utils/                # Funções auxiliares e middlewares
│   ├── __init__.py           # Inicialização do app Flask
│   └── socket_events.py      # Eventos de notificação em tempo real
│
├── database/
│   ├── database.db           # Banco de dados SQLite (local)
│   └── migrations/           # Migrações do banco
│
├── images_readme/            # Imagens utilizadas no README
├── requirements.txt          # Dependências do projeto
├── config.py                 # Configurações do sistema
├── run.py                   # Ponto de entrada principal
└── README.md                 # Documentação do projeto
````

# 📚 Aprendizados e Próximos Passos

Este projeto foi desenvolvido para resolver uma necessidade real de gestão de viagens corporativas, proporcionando grande aprendizado sobre arquitetura modular, integração front/back-end e sistemas em tempo real.

#### 🔮 Melhorias Futuras

* Sistema de aprovação de gastos e adiantamentos

* Sugestões automáticas de hotéis conforme o destino

* Integração com meios de pagamento

* Dashboard analítico com gráficos interativos

* Exportação de relatórios em PDF e Excel

* Módulo de gestão de veículos e motoristas


### 📫 Contato

💼 LinkedIn: [@Julio Sales](https://www.linkedin.com/in/julio-salles-cordeiro-12334b214/)

🐙 GitHub: [@Julio Sales](https://github.com/Locked666)


📧 Email: [MailTo Julio Sales](https://mailto:juliosales509@gmail.com)

