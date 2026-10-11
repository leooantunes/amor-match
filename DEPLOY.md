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
5. Para exibir o Pix de doação, informe `PIX_DONATION_KEY`, `PIX_DONATION_NAME` e `PIX_DONATION_CITY`. Em `PIX_DONATION_KEY`, use a chave Pix cadastrada no banco (CPF, e-mail, telefone ou chave aleatória), **não** o BR Code/“Pix Copia e Cola”. Essas variáveis podem ficar vazias se a doação ainda não estiver configurada.
6. Inicie o deploy. O Render compila cliente e servidor e serve ambos pela mesma URL.

Não coloque URLs de banco, chaves Pix ou outras credenciais no repositório. Configure-as somente no painel do Render. Sem `DATABASE_URL`, a aplicação recusa iniciar em produção para evitar perda das salas no disco temporário do serviço.

## Publicar o site na Vercel

A Vercel hospeda o cliente Vite, enquanto a API e o banco continuam no Render e no Neon.

1. Importe o repositório no [Vercel](https://vercel.com/) usando a raiz do repositório (`.`) como diretório do projeto.
2. Selecione **Vite** como framework e configure:
   - Install Command: `npm ci`
   - Build Command: `npm run build -w client`
   - Output Directory: `client/dist`
3. O arquivo `vercel.json` encaminha `/api/*` para o serviço LoveMatch no Render e as demais rotas para o app de página única. Atualize o destino nesse arquivo caso o domínio do serviço Render mude.
4. Faça o deploy. Não é necessário configurar `DATABASE_URL` nem as variáveis Pix no projeto Vercel; elas permanecem configuradas no Render.
5. Valide `/api/health` no domínio Vercel e crie uma sala para confirmar que o frontend consegue usar a API.
