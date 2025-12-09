## Architecture & Data Model

There are 5 modules in the project. Four of them are rest modules which are agency, agent, agreement and property. The last one, utils module, includes logics that can be imported by multiple modules.

The rest modules have controller layer and service layer. 
- Controller calls dedicated service function for that request in try catch blocks. If an exception is thrown, the controller checks the exception if it is type of NestCustom exceptions same exception is will be thrown from catch block. If not, a new BadRequestException will be thrown inside the catch block in order not to give much detail to the client.

- Services includes business logic for that modules and the calculations are done inside services.

- utils modules is created for preventing circular import error. It includes shared logic that can be used by multiple modules.


#### Schemas

All the schemas has `timestamp: true` attribute and `_id`, `createdAt` and `updatedAt` fields are filled by orm library by default. Here are the all schemas.

```table
Agency
 └── name: String (required, unique)
 ```

```table
Agent
 ├── name: String (required, minLength: 3)
 └── agency_id: (foreign key → Agency._id)
 ```

```table
Property
 ├── name: String (required, minLength: 3)
 ├── agent_id: (uploader agent, foreign key → Agent._id)
 ├── has_active_transaction: Boolean (required, default: false)
 └── is_listing: Boolean (required, default: true)
```

```table
Wallet
 ├── owner_id: (foreign key, can be agency or agent)
 ├── account_type: String (enum: 'agent' | 'agency')
 └── balance: Number (default: 0)
```

```table
WalletTransaction
 ├── wallet_id: (foreign key -> Wallet._id)
 ├── main_process: (foreign key of any table)
 ├── type: String (required)
 ├── balance_before: Number (required)
 └── balance_after: Number (required)
```
```table
Agreement
 ├── listing_agent: ObjectId → Agent (required)
 ├── selling_agent: ObjectId → Agent (required)
 ├── property: ObjectId → Property (required)
 ├── type: String (enum: AgreementType, required)
 ├── status: String (enum: AgreementStatus, required, default: "agreement")
 └── price: Number (required)
```

```table
AgreementStage
 ├── agreement: ObjectId → Agreement (required)
 └── status: String (enum: AgreementStatus, required)
```

### Structure

I tried to obey single responsibility rule as possible as I can. Every method has one dedicated role and they are not too long. Wallet transaction history and agreement stages have separated schemas. This way every process is more queryable. They do not involve database transaction so that the transactions are more deadlock safe and faster. If they are embedded in the same document, the queries will be restricted across multiple process, database indexes cannot be applied and pagination would read all data, sorted, spliced and returned which is messy and slow. That is why I used separated design.

### Risks/Challenges

* The structure must avoid circular import error. The rest modules should not import themselves. The shared logics are implemented in utils module.
* Shared modules must be designed carefully for later usages, for instance wallet transaction function, it does not accept negative values.

### If Implemented in Real Life

* Authentication & Authorization, it should be role based authentication.
* Paginating & common response type for all apis. 
* Error codes that can be converted and translated to text in frontend
* Logger with unique request id and alarms for logs above threshold
* Rate limiting
* Caching
* DB indexes according to queries, hexagonal indexing for locations, ElasticSearch maybe(never used)
* Events for tracing user behaviors
* Monitoring tools for backend
* Data encryption between frontend and backend, some sites uses this eg. coin glass
