import {Request, Response} from 'express';
import {auth, firestore} from '../firebaseConfig';
import {USERS} from '../constants/collections';

export const loginHandler = async(request: Request, response: Response): Promise<Response> => {
	const {body: {email, password}} = request;
	try {
		await auth.signInWithEmailAndPassword(email, password);
		return response.status(200).send();
	} catch(e) {
		return response.status(403).send();
	}
}

export const createAccountHandler = async(request: Request, response: Response): Promise<Response> => {
	const {body: {email, password, balance}} = request;
	try {
		await auth.createUserWithEmailAndPassword(email, password);
		await firestore.collection(USERS).doc(email).set({
			balance,
			email
		});
		return response.status(200).send();
	} catch(e) {
		return response.status(403).send();
	}
}