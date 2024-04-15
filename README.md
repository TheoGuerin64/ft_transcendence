# Ft_transcendence

A pong game website with ranking, chatting, 2FA ...

## Features

### Pong game with ranking:<br/>
![play-menu](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/41260a64-0e2a-4b57-bf50-4a42bc055420)<br/>
![wait-menu](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/8a11b943-a45c-4835-8d59-f028f2f2cee7)<br/>
![pong-playing](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/61a1d516-24bd-4c24-8d2d-d98edd1c079a)<br/>
![match-history](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/3d482a5a-3496-4d06-9261-4e1c928e570e)<br/>

### OAuth2 authentication with 42 intra:<br/>
![sign-in-button](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/1558095c-f55d-4f5d-8ecb-f13365af1a52)<br/>
![42-intra-sign-in](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/ec5dab8b-f0c0-4850-acfd-617e13c28550)<br/>

### User profiles:<br/>
![user-profile](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/3c98751d-3910-421f-82a5-b098158477b8)
![public-profile](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/6a490079-11e3-4b69-af7b-028ac2e1f5cf)<br/>

### 2FA:<br/>
![add-2fa-button](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/8fd7eca8-be99-4c69-a426-c19d05f10a5a)<br/>
![2fa-code-form](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/97dd7cf7-a054-4181-aedf-80a40c71ee50)<br/>

### Friend list:<br/>
![friend-list](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/73b25561-3d84-46ed-b970-8fd57fc09a16)<br/>
![game-invitation](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/a6182e6b-093d-480d-9b3a-44e1e51aedb0)<br/>

### Chat:<br/>
![chat-creation](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/4092e803-41be-4ce4-aafe-a0fb4565fba8)<br/>
![channel-list](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/8e2ec61b-e7b1-49f2-b2c5-627421aa0eb0)<br/>
![chat](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/0f75110e-d103-4fcd-9087-3a29488b0e61)<br/>
![chat-context-menu](https://github.com/TheoGuerin64/ft_transcendence/assets/57496441/ea9147b1-81b4-455a-89a6-feee93bb5049)<br/>

## Usage
*require docker and docker-compose*
- Clone the repository: `git clone https://github.com/TheoGuerin64/ft_transcendence.git`
- Create a .env in the root folder of the project and fill it with keys indicated in the ![next section](https://github.com/TheoGuerin64/ft_transcendence?tab=readme-ov-file#required-env-variables)
- Run this command in your terminal: `docker compose up --build -d`
- Open in your web browser: http://127.0.0.1:8080

## Required env variables
 - [INTRA42_UID](https://profile.intra.42.fr/oauth/applications) (optional)
 - [INTRA42_SECRET](https://profile.intra.42.fr/oauth/applications) (optional)
 - [INTRA42_REDIRECT_URI](https://profile.intra.42.fr/oauth/applications) (optional)
 - [POSTGRES_USER](https://github.com/docker-library/docs/blob/master/postgres/README.md#postgres_user)
 - [POSTGRES_PASSWORD](https://github.com/docker-library/docs/blob/master/postgres/README.md#postgres_password)
 - [PGADMIN_DEFAULT_EMAIL](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html)
 - [PGADMIN_DEFAULT_PASSWORD](https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html)
 - JWT_SECRET (minimum 50 char)
 - TWOFA_PASSWORD
 - [TWOFA_SALT](https://en.wikipedia.org/wiki/Salt)
