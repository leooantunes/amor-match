# Deploy gratuito

O projeto pode ser publicado como um serviço web no Render, com PostgreSQL gratuito no Neon para preservar as salas. No plano gratuito do Render, o serviço pode dormir após um período sem acessos e demorar alguns instantes para responder ao primeiro acesso.

## Preparar o banco no Neon

1. Crie um projeto PostgreSQL no [Neon](https://neon.tech/).
2. Copie a URL de conexão PostgreSQL do projeto. Use a URL com SSL (`sslmode=require`) e mantenha-a privada.

## Publicar no Render

1. Envie o repositório para o GitHub.
2. No [Render](https://render.com/), crie um Blueprint e conecte o repositório.
3. O Render detectará `render.yaml` e solicitará as variáveis marcadas `sync: false`.
4. Cole a URL do Neon em `DATABASE_URL`. A aplicação cria a tabela de sessões na inicialização.
5. Para exibir o Pix de doação, informe `PIX_DONATION_KEY`, `PIX_DONATION_NAME` e `PIX_DONATION_CITY`. Essas variáveis podem ficar vazias se a doação ainda não estiver configurada.
6. Inicie o deploy. O Render compila cliente e servidor e serve ambos pela mesma URL.

Não coloque URLs de banco, chaves Pix ou outras credenciais no repositório. Configure-as somente no painel do Render. Sem `DATABASE_URL`, a aplicação recusa iniciar em produção para evitar perda das salas no disco temporário do serviço.
