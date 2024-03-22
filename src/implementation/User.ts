import type {
	User as UserInterface,
} from '@enonic-types/lib-auth';


import {Principal} from './Principal';


export class User extends Principal implements UserInterface {
	// Constrict Principal
	declare readonly key: UserInterface['key'];
	readonly type = 'user';

	// Extend Principal
	readonly idProvider: UserInterface['idProvider'];
	readonly login: UserInterface['login'];
	// Optional
	readonly disabled: UserInterface['disabled'] = false;
	readonly email?: UserInterface['email'];

	constructor({
		// Principal
		displayName,
		key,
		modifiedTime,
		// Extensions
		email,
		idProvider,
		login,
		// Optional
		disabled = false,
	}: {
		displayName: Principal['displayName']
		idProvider: UserInterface['idProvider']
		key: UserInterface['key']
		login: UserInterface['login']
		// Optional
		email?: UserInterface['email']
		disabled?: UserInterface['disabled']
		modifiedTime?: Principal['modifiedTime']
	}) {
		super({
			displayName,
			key,
			type: 'user',
		});
		this.disabled = disabled;
		this.email = email;
		this.idProvider = idProvider;
		this.login = login;
		this.modifiedTime = modifiedTime;
	} // constructor
}
