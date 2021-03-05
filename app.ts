import express, {Application} from 'express';
import {createAccountHandler, loginHandler} from './src/handlers/authHandler';
import {getBalance, transferBalance} from './src/handlers/databaseHandler';
import bodyParser from 'body-parser';


const PORT: string = process.env.PORT || '5000';
const app: Application = express();
app.use(bodyParser.json());
app.listen(PORT, (): void => {
	console.log(`server listening on port ${PORT}`);
});

app.post('/create_account', createAccountHandler);
app.post('/login', loginHandler);

app.post('/get_balance', getBalance);
app.post('/transfer', transferBalance);
