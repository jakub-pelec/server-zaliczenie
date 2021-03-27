import {firestore} from '../firebaseConfig';
import {Request, Response} from 'express';
import {USERS} from '../constants/collections';
import {createResponse} from '../utils/createResponse';

export const getBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {email}} = request;
	try {
		const documentSnapshot = await firestore.collection(USERS).doc(email).get();
		const {balance} = await documentSnapshot.data();
		return response.status(200).send(createResponse('success', balance));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}

export const withdrawMoney = async(request: Request, response: Response) => {
	const {body: {accountNumber, amount}} = request;
	const documentQuery = await firestore.collection(USERS).doc(accountNumber).get();
	if(!documentQuery.exists) {
		return response.status(403).send(createResponse('error', 'This account doesn\'t exist'));
	}
	const documentData = documentQuery.data();
	if(documentData.balance < amount) {
		return response.status(403).send(createResponse('error', 'Balance is too low'));
	}
	
};

export const transferBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {amount, from, to}} = request;
	const numberAmount = parseInt(amount, 10);
	if(isNaN(numberAmount)) {
		return response.status(403).send(createResponse('error', 'Amount must be a number'));
	}
	if(from === to) {
		return response.status(403).send(createResponse('error', 'You cannot transfer money to yourself'));
	}
	try {
		const fromPrefix = await firestore.collection(USERS).doc(from);
		const toPrefix = await firestore.collection(USERS).doc(to);
		const {balance: fromBalance} = await (await fromPrefix.get()).data();
		const {balance: toBalance} = await (await toPrefix.get()).data();
		if(fromBalance < numberAmount) {
			return response.status(403).send(createResponse('error', 'Balance is too low'));
		}
		const batch = firestore.batch();
		await batch.update(fromPrefix, {balance: fromBalance - numberAmount});
		await batch.update(toPrefix, {balance: toBalance + numberAmount});
		await batch.commit();
		return response.status(200).send(createResponse('success', `New balance: ${fromBalance - amount}`));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}

export const addBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {amount, accountNumber}} = request;
	try {
		const documentPrefix = await firestore.collection(USERS).doc(accountNumber);
		const {balance} = await (await documentPrefix.get()).data();
		const newBalance = balance + amount;
		await documentPrefix.update({balance: newBalance});
		return response.status(200).send(createResponse('success', `New balance: ${newBalance}`));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}