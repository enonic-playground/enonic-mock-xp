import type {
	EventLib
} from '@enonic/js-utils/src/types/index.d';

import type {
	App,
	BranchConfig,
	CreateBranchParams,
	CreateRepoParams,
	Log,
	RepoConnection,
	RepoLib,
	RepositoryConfig,
	Source,
	ValueLib
} from './types/index.d'

import {toStr} from '@enonic/js-utils/dist/cjs/value/toStr';

import {Connection} from './Connection';
import {Repo} from './Repo';
import {RepositoryNotFoundException} from './repo/RepositoryNotFoundException';


export interface Repos {
	[key :string] :Repo
}

type ColorCode = Number[];
interface ColorCodes {
	[key :string] :ColorCode
}

const colorCodes :ColorCodes = {
	reset: [0, 0],

	bold: [1, 22],
	dim: [2, 22],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	hidden: [8, 28],
	strikethrough: [9, 29],

	black: [30, 39],
	red: [31, 39],
	green: [32, 39],
	yellow: [33, 39],
	blue: [34, 39],
	magenta: [35, 39],
	cyan: [36, 39],
	white: [37, 39],
	grey: [90, 39],

	brightRed: [91, 39],
	brightGreen: [92, 39],
	brightYellow: [93, 39],
	brightBlue: [94, 39],
	brightMagenta: [95, 39],
	brightCyan: [96, 39],
	brightWhite: [97, 39],

	bgBlack: [40, 49],
	bgRed: [41, 49],
	bgGreen: [42, 49],
	bgYellow: [43, 49],
	bgBlue: [44, 49],
	bgMagenta: [45, 49],
	bgCyan: [46, 49],
	bgWhite: [47, 49],
	bgGray: [100, 49],
	bgGrey: [100, 49],

	bgBrightRed: [101, 49],
	bgBrightGreen: [102, 49],
	bgBrightYellow: [103, 49],
	bgBrightBlue: [104, 49],
	bgBrightMagenta: [105, 49],
	bgBrightCyan: [106, 49],
	bgBrightWhite: [107, 49]
};

function colorize(colorKey :string, str :string) :string {
	const open = (colorCodes[colorKey] as ColorCode)[0];
	const close = (colorCodes[colorKey] as ColorCode)[1];
	return `\u001b[${open}m${str}\u001b[${close}m`;
}


export class JavaBridge {
	private _repos :Repos = {};
	readonly app :App;
	readonly event :EventLib = {
		listener: ({
			type,
			localOnly,
			callback
		}) => {
			this.log.debug('event.listener({ type:%s, localOnly:%s callback:%s})', type, localOnly, callback);
			return null;
		},
		send: ({
			type,
			distributed,
			data
		}) => {
			this.log.debug('event.send({ type:%s, distributed:%s data:%s})', type, distributed, data);
			return null;
		}
	};
	readonly log :Log = {
		debug: (format :string, ...substs :unknown[]) :void => {
			if (substs.length) {
				console.debug(colorize('grey',`DEBUG ${format}`), ...substs.map(o => toStr(o)));
			} else {
				console.debug(colorize('grey',`DEBUG ${format}`));
			}
		},
		error: (format :string, ...substs :unknown[]) :void => {
			if (substs.length) {
				console.error(colorize('brightRed',`ERROR ${format}`), ...substs.map(o => toStr(o)));
			} else {
				console.error(colorize('brightRed',`ERROR ${format}`));
			}
		},
		info: (format :string, ...substs :unknown[]) :void => {
			if (substs.length) {
				console.info(colorize('white',`INFO  ${format}`), ...substs.map(o => toStr(o)));
			} else {
				console.info(colorize('white',`INFO  ${format}`));
			}
		},
		warning: (format :string, ...substs :unknown[]) :void => {
			if (substs.length) {
				console.warn(colorize('brightYellow',`WARN  ${format}`), ...substs.map(o => toStr(o)));
			} else {
				console.warn(colorize('brightYellow',`WARN  ${format}`));
			}
		}
	};
	readonly repo :RepoLib = {
		create: ({
			id,
			//rootChildOrder,
			//rootPermissions,
			settings
		} :CreateRepoParams) :RepositoryConfig => {
			const repo = new Repo({
				id,
				javaBridge: this,
				//rootPermissions,
				settings
			});
			this._repos[id] = repo;
			return repo.get();
		},
		createBranch: ({
			branchId,
			repoId
		} :CreateBranchParams) :BranchConfig => {
			const repo = this._repos[repoId];
			if (!repo) {
				throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
			}
			return repo.createBranch(branchId);
		},
		get: (repoId :string) :RepositoryConfig => {
			const repo = this._repos[repoId];
			if (!repo) {
				throw new RepositoryNotFoundException(`Repository with id [${repoId}] not found`);
			}
			return repo.get();
		},
		list: () :RepositoryConfig[] => {
			return Object.keys(this._repos).map(repoId => this.repo.get(repoId));
		}
	}
	readonly value :ValueLib = {
		geoPoint: (lat,lon) => `${lat},${lon}`,
		geoPointString: (v) => v,
		instant: (v) => v,
		localDate: (v) => v,
		localDateTime: (v) => v,
		localTime: (v) => v,
		reference: (v) => v
	};

	constructor({
		app,
		log
	} :{
		app :App
		log? :Log
	}) {
		this.app = app;
		if (log) {
			this.log = log;
		}
		//this.log.debug('in JavaBridge constructor');
	} // constructor

	connect({
		repoId,
		branch//,
		//user,
		//principals
	} :Source) :RepoConnection {
		const repo = this._repos[repoId];
		if (!repo) {
			throw new Error(`connect: No repo with id:${repoId}!`);
		}
		const branchObj = repo.getBranch(branch);
		const connection = new Connection({
			branch: branchObj,
			javaBridge: this
		});
		return connection;
	}
} // class JavaBridge
