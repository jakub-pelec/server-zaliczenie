import express, {Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {getBalance, createAccount} from './actions';
const PORT: number = 5000;

const app: Application = express();

app.use(bodyParser.json());

app.listen(PORT, (): void => {
	console.log(`server listening on port ${PORT}`);
})

app.post('/create_account', async(request: Request, response: Response): Promise<Response> => {
	const {body: {balance, accountNumber, name, email}} = request;
	if(!balance || !accountNumber || !name || !email) {
		return response.status(403).send('Missing parameters.')
	}
	try {
		const id = await createAccount(name, email, accountNumber, balance);
		return response.status(200).send(id);
	} catch(e) {
		return response.status(500).send('Something went wrong.');
	}
})

app.post('/get_balance', async(request: Request, response: Response): Promise<Response> => {
	const {body: {id}} = request;
	if(!id) {
		return response.status(403).send('Missing parameter.');
	}
	const collection: string = 'users';
	try {
		const data = await getBalance(collection, id);
		return response.status(200).send(data);
	} catch(e) {
		return response.status(500).send('Something went wrong.');
	}

}) 