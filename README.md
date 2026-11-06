# Atlas

**Sistema desktop de gestão empresarial**

O Atlas é um sistema desktop de gestão empresarial desenvolvido para auxiliar pequenas e médias empresas no controle de suas operações administrativas, financeiras e de estoque.

O projeto tem como objetivo centralizar informações e facilitar atividades como cadastro de produtos, controle de estoque, registro de compras e vendas e acompanhamento de contas a pagar e a receber.

> **Status: Em desenvolvimento**
>
> O Atlas ainda não está finalizado. Novas funcionalidades estão sendo implementadas e os módulos existentes podem passar por melhorias e ajustes.

## Tecnologias utilizadas

- **React** – Construção da interface do usuário.
- **TypeScript** – Tipagem estática e maior segurança no desenvolvimento.
- **Vite** – Ferramenta de desenvolvimento e build do frontend.
- **Electron** – Desenvolvimento da aplicação desktop.
- **SQLite** – Banco de dados relacional local.
- **better-sqlite3** – Integração entre Node.js e SQLite.

## Funcionalidades

O sistema está sendo desenvolvido em módulos, contemplando diferentes áreas da gestão empresarial.

### Produtos e cadastros

- Cadastro e gerenciamento de produtos.
- Cadastro de categorias de produtos.
- Cadastro de unidades de medida.
- Cadastro e gerenciamento de fornecedores.
- Cadastro e gerenciamento de clientes.

### Controle de estoque

- Registro de entradas de mercadorias.
- Registro e consulta de movimentações de estoque.
- Atualização automática do estoque a partir das operações de entrada.

### Compras

- Registro de entradas de mercadorias.
- Associação de entradas a fornecedores.
- Registro de informações de notas fiscais.
- Integração das compras com o controle de estoque.

### Vendas

- Registro de vendas.
- Associação de vendas a clientes.
- Registro dos produtos e quantidades vendidos.

### Financeiro

- Cadastro e acompanhamento de contas a pagar.
- Registro de pagamentos.
- Controle de juros e descontos.
- Cálculo de saldos pendentes.
- Desenvolvimento do módulo de contas a receber.

## Arquitetura

O Atlas utiliza uma arquitetura desktop baseada em Electron, com React responsável pela interface e SQLite como banco de dados local.

A comunicação entre o frontend e o backend é realizada por meio de IPC (Inter-Process Communication) do Electron.

O banco de dados é armazenado localmente, permitindo que a aplicação funcione sem depender de um servidor externo para suas operações.
