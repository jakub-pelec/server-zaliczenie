import firebase from 'firebase';
import {firebaseConfig} from './firebaseConfig';

firebase.initializeApp(firebaseConfig);
const COLLECTION_USERS: string = 'users';

const auth = firebase.auth();
const firestore = firebase.firestore();

export const getBalance = async (collection: string, id: string): Promise<firebase.firestore.DocumentData> => {
	const document: firebase.firestore.DocumentSnapshot = await firestore.collection(collection).doc(id).get();
	const data: firebase.firestore.DocumentData = document.data();
	return data;
}

// TODO: Create user acc in auth
export const createAccount = async(name: string, email: string, accountNumber: string, balance: string): Promise<string> => {
	const data = {
		name,
		accountNumber,
		balance
	}
	try {
		const {id} = await firestore.collection(COLLECTION_USERS).add(data);
		return id;
	} catch(e) {
		throw new Error();
	}
}

export const transferBalance = async(from: string, to: string, amount: number): Promise<number> => {
	const fromPrefix = await firestore.collection(COLLECTION_USERS).doc(from);
	const toPrefix = await firestore.collection(COLLECTION_USERS).doc(to);
	const {balance: fromBalance} = await (await fromPrefix.get()).data();
	const {balance: toBalance} = await (await toPrefix.get()).data();
	if(fromBalance < amount) {
		throw new Error('Balance too low');
	}
	const batch = firestore.batch();
	await batch.update(fromPrefix, {balance: fromBalance - amount});
	await batch.update(toPrefix, {balance: toBalance + amount});
	await batch.commit();
	return fromBalance - amount;
}