import type {
	MoveNodeParams,
	// RepoConnection as RepoConnectionInterface // TODO Doesn't match currently
} from '@enonic-types/lib-node';
import type {
	GetActiveVersionParamObject,
	GetActiveVersionResponse,
	// Log,
	NodeCreateParams,
	NodeModifyParams,
	NodeQueryParams,
	NodeQueryResponse,
	NodeRefreshParams,
	NodeRefreshReturnType,
	RepoConnection as RepoConnectionInterface,
	RepoNodeWithData
} from '../types'
import type { Branch } from './Branch';
// import type { JavaBridge } from './JavaBridge';


export class RepoConnection implements RepoConnectionInterface {
	private branch: Branch;
	// private _javaBridge: JavaBridge;
	// readonly log: Log;

	constructor({
		branch,
		// javaBridge
	}: {
		branch: Branch,
		// javaBridge: JavaBridge
	}) {
		// console.debug('javaBridge.constructor.name', javaBridge.constructor.name);
		this.branch = branch;
		// this._javaBridge = javaBridge;
		// this.log = this._branch.log;
		// this.log.debug('in Connection constructor');
	}

	// TODO: commit()

	create(param: NodeCreateParams): RepoNodeWithData {
		return this.branch.createNode(param);
	}

	delete(keys: string | Array<string>): Array<string> {
		return this.branch.deleteNode(keys);
	}

	// TODO diff()

	// TODO duplicate()

	exists(key: string): boolean {
		return this.branch.existsNode(key);
	}

	// TODO findChildren()

	// TODO findVersion()

	// get(key: string): RepoNodeWithData {
	// 	return this._branch.getNode(key);
	// }
	// get(keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
	// 	return this._branch.getNode(keys);
	// }
	get(...keys: string[]): RepoNodeWithData | RepoNodeWithData[] {
		return this.branch.getNode(...keys);
	}

	getActiveVersion({
		key
	}: GetActiveVersionParamObject): GetActiveVersionResponse {
		return this.branch.getNodeActiveVersion({key});
	}

	public getSingle<T>(key: string): T {
		return this.branch.getNode(key) as T;
	}

	// TODO getBinary()

	// TODO getCommit()

	modify({
		key,
		editor
	}: NodeModifyParams): RepoNodeWithData {
		return this.branch.modifyNode({
			key,
			editor
		});
	}

	move({
		source,
		target
	}: MoveNodeParams): boolean {
		let isMoved = false;
		try {
			isMoved = !!this.branch.moveNode({ source, target });
		} catch (e) {
			this.branch.log.error(`Error in moveNode message:${(e as Error).message}`, e);
		}
		return isMoved;
	}

	// TODO push()

	query({
		aggregations,
		count,
		explain,
		filters,
		highlight,
		query,
		sort,
		start
	}: NodeQueryParams): NodeQueryResponse {
		return this.branch.query({
			aggregations,
			count,
			explain,
			filters,
			highlight,
			query,
			sort,
			start
		});
	}

	refresh(params: NodeRefreshParams): NodeRefreshReturnType {
		return this.branch.refresh(params);
	}

	// TODO setActiveVersion()

	// TODO setChildOrder()

	// TODO setRootPermission()

} // class Connection
