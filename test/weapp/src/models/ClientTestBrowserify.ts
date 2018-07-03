import TsrpcClient from '../../../../src/TsrpcClient';
import TsrpcPtl, { TsrpcError } from 'tsrpc-protocol';
import { assert } from 'chai';
import { clearTest, startTest, it } from './Mocha';
import { ReqHelloWorld, ResHelloWorld } from '../../../protocol/PtlHelloWorld';
import { ReqHelloKing, ResHelloKing } from '../../../protocol/PtlHelloKing';

const urlApi = 'api';
const clientConfig = {

}

let protocolPath = '/shared/protocols';
let PtlHelloWorld = new TsrpcPtl<ReqHelloWorld, ResHelloWorld>('/shared/protocols/PtlHelloWorld.js');
let PtlHelloKing = new TsrpcPtl<ReqHelloKing, ResHelloKing>('/shared/protocols/PtlHelloKing.js');

let client: TsrpcClient = new TsrpcClient(Object.merge({}, clientConfig, {
    serverUrl: `http://localhost:3301/${urlApi}/`,
    protocolPath: protocolPath
}))

function pushTests() {
    it('absolute URL with postfix /', async function () {
        let res = await new TsrpcClient(Object.merge({}, clientConfig, {
            serverUrl: `http://localhost:3301/${urlApi}/`,
            protocolPath: protocolPath
        })).callApi(PtlHelloWorld, { name: 'test' });
        assert.equal(res.reply, 'Hello, test!');
    });

    it('absolute URL without postfix /', async function () {
        let res = await new TsrpcClient(Object.merge({}, clientConfig, {
            serverUrl: `http://localhost:3301/${urlApi}`,
            protocolPath: protocolPath
        })).callApi(PtlHelloWorld, { name: 'test' });
        assert.equal(res.reply, 'Hello, test!');
    });

    it('wrong URL', async function () {
        try {
            await new TsrpcClient(Object.merge({}, clientConfig, {
                serverUrl: 'http://localhost:12345',
                protocolPath: protocolPath
            })).callApi(PtlHelloWorld, { name: 'test' });
            assert.fail('Should not be here')
        }
        catch (e) {
            assert.equal((e as TsrpcError).info, 'NETWORK_ERROR');
        }
    });

    it('client call', async function () {
        let reqStr = '', resStr = '';
        client.onRequest = () => {
            reqStr = 'reqStr';
        }
        client.onResponse = () => {
            resStr = 'resStr'
        }
        assert.equal((await client.callApi(PtlHelloWorld, { name: 'Peter' })).reply, 'Hello, Peter!')
        assert.equal(reqStr, 'reqStr')
        assert.equal(resStr, 'resStr')

        client.onRequest = client.onResponse = undefined;
    })

    it('default param', async function () {
        assert.equal((await client.callApi(PtlHelloWorld)).reply, 'Hello, world!')
    })

    it('404', async function () {
        try {
            await client.callApi(PtlHelloKing);
            assert(false, 'Should not get res')
        }
        catch (e) {
            assert.equal(e.info, 'PTL_NOT_FOUND');
        }
    })

    it('500', async function () {
        try {
            await client.callApi(PtlHelloWorld, { name: 'Error' });
            assert(false, 'Should not get res')
        }
        catch (e) {
            assert.ok(e.message.startsWith('Internal Server Error'));
            assert.equal(e.info, 'UNHANDLED_API_ERROR');
        }
    })

    it('TsrpcError', async function () {
        try {
            await client.callApi(PtlHelloWorld, { name: 'TsrpcError' });
            assert(false, 'Should not get res')
        }
        catch (e) {
            assert.ok(e.message.startsWith('TsrpcError'));
            assert.equal(e.info, 'TsrpcError');
        }
    })

    it('Client Cancel', async function () {
        return new Promise(rs => {
            let req = client.callApi(PtlHelloWorld, { name: 'Delay' }).then(res => {
                assert.fail('Have canceled, should not be here');
            }).catch(e => {
                assert.fail('Have canceled, should not be here');
            });

            setTimeout(() => {
                req.cancel();
            }, 80)

            setTimeout(() => {
                rs();
            }, 200)
        })
    })
}

async function main() {
    clearTest();
    pushTests();
    await startTest();

    clearTest();
    protocolPath = '/';
    PtlHelloWorld = new TsrpcPtl<ReqHelloWorld, ResHelloWorld>('/PtlHelloWorld.js');
    PtlHelloKing = new TsrpcPtl<ReqHelloKing, ResHelloKing>('/PtlHelloKing.js');

    client = new TsrpcClient(Object.merge({}, clientConfig, {
        serverUrl: `http://localhost:3301/${urlApi}/`,
        protocolPath: protocolPath
    }))
    pushTests();
    await startTest();
}
main();