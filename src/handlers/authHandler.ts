import {Request, Response} from 'express';
import {firestore} from '../firebaseConfig';
import {USERS} from '../constants/collections';
import {createResponse} from '../utils/createResponse';
import bcrypt from 'bcrypt';

interface UserDocument {
	password: string,
	balance: number,
	firstName: string,
	lastName: string,
	PESEL: string,
	email: string
}

export const createAccountHandler = async(request: Request, response: Response): Promise<Response> => {
	const {body: {balance, accountNumber, PESEL, firstName, lastName, email, password}} = request;
	if(!balance || !accountNumber || !PESEL || !firstName || !lastName || !email || !password) {
		return response.status(403).send(createResponse('error', 'Missing parameter'));
	}
	const salt = 10;
	const hash = await bcrypt.hash(password, salt);
	const normalizedAccountNumber = typeof accountNumber === 'number' ? Number(accountNumber).toString(10).replace(/\s/g,'') : accountNumber.replace(/\s/g,'');
	const documentData: UserDocument = {
		password: hash,
		balance,
		firstName,
		lastName,
		PESEL,
		email
	}

	const emailDocumentSnapshot = await firestore.collection(USERS).where('email', '==', email).get();
	const accountNumberDocumentSnapshot = await firestore.collection(USERS).doc(normalizedAccountNumber).get()
	if(!emailDocumentSnapshot.empty || accountNumberDocumentSnapshot.exists) {
		return response.status(403).send(createResponse('error', 'User already exists'));
	}
	
	if(!balance || !accountNumber || !PESEL || !firstName || !lastName){
		return response.status(403).send(createResponse('error', 'Missing parameter'));
}
	if(normalizedAccountNumber.length !== 16) {
		return response.status(403).send(createResponse('error', 'Account number must be 16 digits long'));
	}
	try {
		await firestore.collection(USERS).doc(normalizedAccountNumber).set(documentData);
		return response.status(200).send(createResponse('success', 'Account created'));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
}

export const login = async(request: Request, response: Response): Promise<Response> => {
	const {body: {email, password}} = request;
	if(!email || !password) {
		return response.status(403).send(createResponse('error', 'Missing parameters'));
	}
	try {
		const documentSnapshot = await firestore.collection(USERS).where('email', '==', email).get();
		if(!documentSnapshot.empty) {
			const [userDoc] = documentSnapshot.docs;
			const data = userDoc.data();
			const isOk = await bcrypt.compare(password, data.password);
			if(isOk) {
				return response.status(200).send(createResponse('success', 'You are logged in', {accountNumber: data.acccountNumber}));
			}
			return response.status(403).send(createResponse('error', 'Wrong password'));
		}
		return response.status(403).send(createResponse('error', 'User doesn\'t exist'));
	} catch(e) {
		return response.status(403).send(createResponse('error', 'Something went wrong'));
	}
	
}