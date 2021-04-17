# NLG

## Pour cloner:
`git clone https://github.com/aminehamza1911/NLG.git`
Après:
## Pour lancer le FE
`cd NLG/nlg_fe`
`npm install`
`npm start`
## pour lancer le BE
`cd NLG/api_nlg`
`npm install`
`npm start`


## Pour lancer le docker compose: 
`docker-compose up -d`

## Pour les images docker en local:

1. Pour le Frontend ----->  `sudo  docker pull ashkaamine/nlg:fe`
2. Après excuter ----->  `sudo docker run -it -p 80:80 ashkaamine/nlg:fe`
3. Pour le Backend ----->  `sudo docker pull ashkaamine/nlg:api`
4. Après excuter ----->  `sudo docker run -it -p 3001:3001 ashkaamine/nlg:api`
