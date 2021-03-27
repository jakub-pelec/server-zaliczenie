import {Request, Response} from 'express';
import {firestore} from '../firebaseConfig';
import {USERS} from '../constants/collections';
import {createResponse} from '../utils/createResponse';

export const createAccountHandler = async(request: Request, response: Response): Promise<Response> => {
	const {body: {balance, accountNumber, PESEL, firstName, lastName}} = request;
	if(!balance || !accountNumber || !PESEL || !firstName || !lastName){
		return response.status(403).send(createResponse('error', 'Missing parameter'));
}
	if(accountNumber.length !== 16) {
		return response.status(403).send(createResponse('error', 'Account number must be 16 digits long'));
	}
	try {
		await firestore.collection(USERS).doc(accountNumber).set({
			balance,
			firstName,
			lastName,
			PESEL,
		});
		return response.status(200).send(createResponse('success', 'Account created'));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}