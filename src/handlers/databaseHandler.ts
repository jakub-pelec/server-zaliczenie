import {firestore} from '../firebaseConfig';
import {Request, Response} from 'express';
import {USERS} from '../constants/collections';
import {createResponse} from '../utils/createResponse';

export const getBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {accountNumber}} = request;
	try {
		const documentSnapshot = await firestore.collection(USERS).doc(accountNumber).get();
		const {balance} = await documentSnapshot.data();
		return response.status(200).send(createResponse('success', '', {balance}));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}

export const withdrawMoney = async(request: Request, response: Response): Promise<Response> => {
	const {body: {accountNumber, amount}} = request;
	const normalizedAccountNumber = typeof accountNumber === 'number' ? accountNumber.toString(10).replace(/\s/g,'') : accountNumber.replace(/\s/g,'');
	const normalizedAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
	if(isNaN(normalizedAmount)) {
		return response.status(403).send(createResponse('error', 'Amount must be a valid number'));
	}
	const documentQuery = firestore.collection(USERS).doc(normalizedAccountNumber);
	const documentSnapshot = await documentQuery.get();
	const documentData = await documentSnapshot.data();
	if(!documentSnapshot.exists) {
		return response.status(403).send(createResponse('error', 'This account doesn\'t exist'));
	}
	if(documentData.balance < normalizedAmount) {
		return response.status(403).send(createResponse('error', 'Balance is too low'));
	}
	try {
		const newBalance = documentData.balance - normalizedAmount;
		await documentQuery.update({balance: newBalance});
		return response.status(200).send(createResponse('success', '', {balance: newBalance}));
	} catch (e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
	
};

export const transferBalance = async(request: Request, response: Response): Promise<Response> => {
	const {body: {amount, from, to}} = request;
	const numberAmount = typeof amount === 'string' ? parseInt(amount, 10) : amount;
	const normalizedFrom = typeof from === 'number' ? from.toString(10).replace(/\s/g,'') : from.replace(/\s/g,'');
	const normalizedTo = typeof to === 'number' ? to.toString(10).replace(/\s/g,'') : to.replace(/\s/g,'');
	if(isNaN(numberAmount)) {
		return response.status(403).send(createResponse('error', 'Amount must be a number'));
	}
	if(normalizedFrom === normalizedTo) {
		return response.status(403).send(createResponse('error', 'You cannot transfer money to yourself'));
	}
	try {
		const fromPrefix = await firestore.collection(USERS).doc(normalizedFrom);
		const toPrefix = await firestore.collection(USERS).doc(normalizedTo);
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
	const numberAmout = parseInt(amount, 10);
	const normalizedAccountNumber = typeof accountNumber === 'number' ? accountNumber.toString(10).replace(/\s/g,'') : accountNumber.replace(/\s/g,'');
	if(isNaN(numberAmout)) {
		return response.status(403).send(createResponse('error', 'Amount must be a valid number'));
	}
	try {
		const documentPrefix = await firestore.collection(USERS).doc(normalizedAccountNumber);
		const {balance} = await (await documentPrefix.get()).data();
		const newBalance = balance + numberAmout;
		await documentPrefix.update({balance: newBalance});
		return response.status(200).send(createResponse('success', `New balance: ${newBalance}`));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}