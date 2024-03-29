import {Server} from '../../../src';
import {hasMethod} from '../../hasMethod';


const APP_NAME = 'com.enonic.app.test';
const CONTENT_TYPE = `${APP_NAME}:myContentType`;

const server = new Server({
	loglevel: 'silent'
});


describe('mock', () => {
	describe('Server', () => {
		server.createRepo({
			id: 'com.enonic.cms.default'
		});
		describe('contentConnect', () => {
			const contentConnection = server.contentConnect({
				branchId: 'master',
				projectId: 'default'
			});
			it('returns an object which has a modify method', () => {
				expect(hasMethod(contentConnection, 'modify')).toBe(true);
			});
			describe('contentConnection', () => {
				const createdContent = contentConnection.create({
					childOrder: 'displayname ASC',
					contentType: CONTENT_TYPE,
					data: {},
					name: 'name',
					parentPath: '/',
				});
				describe('modify', () => {
					it('modifies content when key is an id', () => {
						const modifiedContent = contentConnection.modify({
							key: createdContent._id,
							editor: (content) => {
								content._id = '_id ignored';
								content._name = '_name ignored';
								content._path = '_path ignored';
								content.data = {
									...content.data,
									foo: 'bar'
								};
								return content;
							}
						});
						expect(modifiedContent).toEqual({
							...createdContent,
							data: {
								foo: 'bar'
							},
							modifiedTime: modifiedContent.modifiedTime,
							modifier: modifiedContent.modifier,
						});
					});
					it('modifies content when key is a path', () => {
						const modifiedContent = contentConnection.modify({
							key: createdContent._path,
							editor: (content) => {
								content._id = '_id ignored';
								content._name = '_name ignored';
								content._path = '_path ignored';
								content.data = {
									...content.data,
									foo: 'fnord'
								};
								return content;
							}
						});
						expect(modifiedContent).toEqual({
							...createdContent,
							data: {
								foo: 'fnord'
							},
							modifiedTime: modifiedContent.modifiedTime,
							modifier: modifiedContent.modifier,
						});
					});
				});
			});
		});
	});
});
