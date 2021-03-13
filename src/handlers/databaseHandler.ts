import {firestore} from '../firebaseConfig';
import {Request, Response} from 'express';
import {USERS} from '../constants/collections';

export const getBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {email}} = request;
	try {
		const documentSnapshot = await firestore.collection(USERS).doc(email).get();
		const {balance} = await documentSnapshot.data();
		return response.status(200).send({balance});
	} catch(e) {
		return response.status(403).send({error: e});
	}
}

export const transferBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {amount, from, to}} = request;
	const numberAmount = parseInt(amount, 10);
	if(isNaN(numberAmount)) {
		return response.status(403).send({error: 'Amount must be number'});
	}
	if(from === to) {
		return response.status(403).send({error: 'Cannot transfer to yourself.'});
	}
	try {
		const fromPrefix = await firestore.collection(USERS).doc(from);
		const toPrefix = await firestore.collection(USERS).doc(to);
		const {balance: fromBalance} = await (await fromPrefix.get()).data();
		const {balance: toBalance} = await (await toPrefix.get()).data();
		if(fromBalance < numberAmount) {
			return response.status(403).send({error: {code: 'db/balance-too-low', message: 'Balance too low'}});
		}
		const batch = firestore.batch();
		await batch.update(fromPrefix, {balance: fromBalance - numberAmount});
		await batch.update(toPrefix, {balance: toBalance + numberAmount});
		await batch.commit();
		return response.status(200).send({messsage: `New balance: ${fromBalance - numberAmount}`});
	} catch(e) {
		return response.status(403).send({error: e});
	}
}