import {Request, Response} from 'express';
import firebase from 'firebase';
import {firestore} from '../firebaseConfig';
import {USERS, DATA} from '../constants/collections';
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
	const {body: {balance, PESEL, firstName, lastName, email, password}} = request;
	const dataPrefix = await firestore.collection(DATA).doc(DATA);
	const {currentNumber} = (await dataPrefix.get()).data();

	const currentNumberString = Number(currentNumber).toString();
	const newAccountNumber = currentNumberString.padStart(16 - currentNumberString.length, '0');
	const increment = firebase.firestore.FieldValue.increment(1);

	if(!balance || !PESEL || !firstName || !lastName || !email || !password) {
		return response.status(403).send(createResponse('error', 'Missing parameter'));
	}
	const salt = 10;
	const hash = await bcrypt.hash(password, salt);
	const documentData: UserDocument = {
		password: hash,
		balance,
		firstName,
		lastName,
		PESEL,
		email
	}

	const emailDocumentSnapshot = await firestore.collection(USERS).where('email', '==', email).get();
	if(!emailDocumentSnapshot.empty) {
		return response.status(403).send(createResponse('error', 'User already exists'));
	}
	try {
		await firestore.collection(USERS).doc(newAccountNumber).set(documentData);
		await dataPrefix.update({
			currentNumber: increment
		})
		return response.status(200).send(createResponse('success', 'Account created', {accountNumber: newAccountNumber}));
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