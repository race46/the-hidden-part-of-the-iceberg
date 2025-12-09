## Description

This is the backend part of Iceberg project. The core frameworks are `nest.js` and `mongoose`.

The project is running in a free tier of aws ec2 instance. Here is the link of demo project: http://16.171.145.253

## Project setup

❗ <b>Nodejs</b> and <b>npm</b> must be installed in order to complete project setup.

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod

# it start with pm2 -- build (npm run build) required before this action
$ npm run start:pm2
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Configuring environment variables

There are environment files under main folder named `.env` and `.env.test`. `.env` file is used for development and deployment for now. It must be overwritten during development.

There are no too much configurations needed. Inside the env files, only running port and database url can be configured. There is a url of free tier of mongo atlas inside both env files. 

In the project, there are agencies and agents. An agent have to have an agency. That is why an agency needs to be created in order to create an agent. An agent can create a property. There is no authentication, so that the creator need to be given in body.

For an agreement creation, a selling agent, a listing agent and a property is needed beforehand.

After creating an agreement, the status can be changed -> earnest-money -> title-deed -> completed

Here is the rest apis to use.

## Rest Api Endpoints

`GET` /
* returns 3 column api tester web page

---

`GET` /agency
* return list of agencies

`POST` /agency

* creates an agency

```json
{
  "name": "<agency-name>"
}
```

---

`GET` /agent
* return agent list

`GET` /agent/:agent-id
* return agent, its agency and wallet information

`GET` /agent/:agent-id/wallet-transactions
* return transaction history of given agent

`POST` /agent

* creates and agent

```json
{
  "agency_id": "<agency-id>",
  "name": "<agent-name>"
}
```

---

`GET` /property
* return list of properties that are listed

`POST` /property
* creates a property

```json
{
  "name": "<property-name>",
  "agent_id": "<agent-id>" // uploader
}
```

---

`GET` /agreement
* return list of agreement ids

`GET` /agreement/:agreement-id
* returns details of that agreement

`GET` /agreement/:agreement-id/stage
* returns stages of that agreement

`POST` /agreement
* creates and agreement

```json
{
  "listing_agent_id": "<agent-id>",
  "selling_agent_id": "<agent-id>",
  "property_id": "<property-id>",
  "type": "'sale' or 'rental'",
  "price": "<price> number"
}
```

`PUT` /agreement/:agreement-id/earnest-money
* it changes agreement status from _agreement_ to _earnest-money_

`PUT` /agreement/:agreement-id/title-deed
* it changes agreement status from _earnest-money_ to _title-deed_

`PUT` /agreement/:agreement-id/complete
* it changes agreement status from _earnest-money_ to _completed_, it shares commissions.


## Resources

Have a look at DESIGN.md file for project structure.
