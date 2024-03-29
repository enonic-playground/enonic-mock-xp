import {
	RepoConnection,
	Server,
} from '../../src';
import {SYSTEM_REPO} from '../../src/constants';


const REPO_ID = 'com.enonic.myapp';

// const REPO_INFO = {
// 	branches: ['master'],
// 	id: REPO_ID,
// 	settings: {}
// }
const NODE_ID = '00000000-0000-4000-8000-000000000002';
const NODE_VERSION_KEY = '00000000-0000-4000-8000-000000000003';
const NODE_VERSION_KEY_MODIFIED = '00000000-0000-4000-8000-000000000004';
const NODE = {
	_id: NODE_ID,
	_indexConfig: {
		configs: [],
		default: {
		decideByType: true,
		enabled: true,
		fulltext: false,
		includeInAllText: false,
		indexValueProcessors: [],
		languages: [],
		nGram: false,
		path: false,
		},
	},
	_name: NODE_ID,
	_nodeType: 'default',
	_path: `/${NODE_ID}`,
	_state: 'DEFAULT',
	_ts: expect.any(String) as unknown as string,
	_versionKey: NODE_VERSION_KEY
};

describe('Server', () => {
	it('should be instantiable without any params', () => {
		const server = new Server();
		expect(server).toBeInstanceOf(Server);
	});

	it('comes with system-repo', () => {
		const server = new Server();
		expect(server.getRepo(SYSTEM_REPO)).toBeDefined();
	});

	it('can be used to create a repo', () => {
		const server = new Server();
		expect(server.listRepos().length).toStrictEqual(1);
		expect(() => server.getRepo(REPO_ID)).toThrow();

		const repo = server.createRepo({id: REPO_ID});
		expect(repo.id).toStrictEqual(REPO_ID);
		expect(repo.branches['master']).toBeDefined();
		expect(repo.settings).toStrictEqual({});

		const gottenRepo = server.getRepo(REPO_ID);
		expect(gottenRepo.id).toStrictEqual(REPO_ID);
		expect(gottenRepo.branches['master']).toBeDefined
		expect(gottenRepo.settings).toStrictEqual({});

		expect(server.listRepos().length).toStrictEqual(2);
	});

	it('can be used to create a draft branch', () => {
		const server = new Server();
		expect(() => server.createBranch({
			branchId: 'draft',
			repoId: REPO_ID
		})).toThrow();
		server.createRepo({id: REPO_ID});
		const branch = server.createBranch({
			branchId: 'draft',
			repoId: REPO_ID
		});
		expect(branch.id).toStrictEqual('draft');
	});

	it('can be used to connect and create, exists, get, getActiveVersion, modify and delete a node', () => {
		const server = new Server({
			loglevel: 'debug'
		});
		server.createRepo({id: REPO_ID});
		const connection = new RepoConnection({
			branch: server.repos[REPO_ID].getBranch('master')
		});

		expect(connection.exists(NODE_ID)).toBe(false);
		expect(connection.get(NODE_ID)).toBeUndefined();

		const node = connection.create({});
		expect(node).toStrictEqual(NODE);
		expect(connection.exists(NODE_ID)).toBe(true);
		expect(connection.get(NODE_ID)).toStrictEqual(NODE);
		expect(connection.getActiveVersion({key:NODE_ID})).toStrictEqual({
			nodeId: NODE_ID,
			nodePath: `/${NODE_ID}`,
			timestamp: expect.any(String) as unknown as string,
			versionId: NODE_VERSION_KEY
		});

		expect(connection.modify({
			editor: (node) => {
				node.key = 'value';
				return node;
			},
			key: NODE_ID
		})).toStrictEqual({
			...NODE,
			_versionKey: NODE_VERSION_KEY_MODIFIED,
			key: 'value'
		});
		expect(connection.get(NODE_ID)).toStrictEqual({
			...NODE,
			_versionKey: NODE_VERSION_KEY_MODIFIED,
			key: 'value'
		});
		expect(connection.getActiveVersion({key:NODE_ID})).toStrictEqual({
			nodeId: NODE_ID,
			nodePath: `/${NODE_ID}`,
			timestamp: expect.any(String) as unknown as string,
			versionId: NODE_VERSION_KEY_MODIFIED
		});

		expect(connection.delete(NODE_ID)).toStrictEqual([NODE_ID]);
		expect(connection.exists(NODE_ID)).toBe(false);
		expect(connection.get(NODE_ID)).toBeUndefined();
	});
});
