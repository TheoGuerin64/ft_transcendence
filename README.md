# ft_transcendence

![common core](https://img.shields.io/badge/common%20core-gray?style=flat&logo=42)
![grade 100/100](https://img.shields.io/badge/grade-100%2F100-blue?style=flat&logo=42)

A real-time multiplayer Pong web app with auth, chat, profiles, and matchmaking.

## Features

### Pong game with ranking:  
![play-menu](https://github.com/theo-guerin/ft_transcendence/assets/57496441/41260a64-0e2a-4b57-bf50-4a42bc055420)  
![wait-menu](https://github.com/theo-guerin/ft_transcendence/assets/57496441/8a11b943-a45c-4835-8d59-f028f2f2cee7)  
![pong-playing](https://github.com/theo-guerin/ft_transcendence/assets/57496441/61a1d516-24bd-4c24-8d2d-d98edd1c079a)  
![match-history](https://github.com/theo-guerin/ft_transcendence/assets/57496441/3d482a5a-3496-4d06-9261-4e1c928e570e)  

### OAuth2 authentication with 42 intra:  
![sign-in-button](https://github.com/theo-guerin/ft_transcendence/assets/57496441/1558095c-f55d-4f5d-8ecb-f13365af1a52)  
![42-intra-sign-in](https://github.com/theo-guerin/ft_transcendence/assets/57496441/ec5dab8b-f0c0-4850-acfd-617e13c28550)  

### User profiles:  
![user-profile](https://github.com/theo-guerin/ft_transcendence/assets/57496441/3c98751d-3910-421f-82a5-b098158477b8)  
![public-profile](https://github.com/theo-guerin/ft_transcendence/assets/57496441/6a490079-11e3-4b69-af7b-028ac2e1f5cf)  

### 2FA:  
![add-2fa-button](https://github.com/theo-guerin/ft_transcendence/assets/57496441/8fd7eca8-be99-4c69-a426-c19d05f10a5a)  
![2fa-code-form](https://github.com/theo-guerin/ft_transcendence/assets/57496441/97dd7cf7-a054-4181-aedf-80a40c71ee50)  

### Friend list:  
![friend-list](https://github.com/theo-guerin/ft_transcendence/assets/57496441/73b25561-3d84-46ed-b970-8fd57fc09a16)  
![game-invitation](https://github.com/theo-guerin/ft_transcendence/assets/57496441/a6182e6b-093d-480d-9b3a-44e1e51aedb0)  

### Chat:  
![chat-creation](https://github.com/theo-guerin/ft_transcendence/assets/57496441/4092e803-41be-4ce4-aafe-a0fb4565fba8)  
![channel-list](https://github.com/theo-guerin/ft_transcendence/assets/57496441/8e2ec61b-e7b1-49f2-b2c5-627421aa0eb0)  
![chat](https://github.com/theo-guerin/ft_transcendence/assets/57496441/0f75110e-d103-4fcd-9087-3a29488b0e61)  
![chat-context-menu](https://github.com/theo-guerin/ft_transcendence/assets/57496441/ea9147b1-81b4-455a-89a6-feee93bb5049)  

## Usage
*require docker and docker-compose*
- Clone the repository: `git clone https://github.com/theo-guerin-42-cursus/ft_transcendence.git`
- Create a .env in the root folder of the project and fill it with keys indicated in the ![next section](https://github.com/theo-guerin-42-cursus/ft_transcendence#required-env-variables)
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
