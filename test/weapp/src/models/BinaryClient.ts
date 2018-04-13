import TsrpcClient from '../../../../src/TsrpcClient';
import PtlHelloWorld from '../../../protocol/PtlHelloWorld';
import PtlHelloKing from '../../../protocol/PtlHelloKing';
import { TsrpcError } from 'tsrpc-protocol';
import { assert } from 'chai';
import { clearTest, startTest, it } from './Mocha';
import ClientConfig from '../../../../src/models/ClientConfig';
import BinaryTextCoder from '../../../../src/models/BinaryTextCoder';

const urlApi = 'bapi';
const clientConfig: Partial<ClientConfig> = {
    hideApiPath: true,
    binaryTransport: true,
    binaryEncoder: async content => {
        let output = await BinaryTextCoder.encode(content);
        let arr = new Uint8Array(output);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] ^= 0xf0;
        }
        return output;
    },
    binaryDecoder: buf => {
        let arr = new Uint8Array(buf);
        for (let i = 0; i < arr.length; ++i) {
            arr[i] ^= 0xf0;
        }
        let output = BinaryTextCoder.decode(buf);
        return output;
    }
}

let client: TsrpcClient = new TsrpcClient(Object.merge({}, clientConfig, {
    serverUrl: `http://localhost:3302/${urlApi}/`
}));

clearTest();

it('absolute URL with postfix /', async function () {
    let res = await new TsrpcClient(Object.merge({}, clientConfig, {
        serverUrl: `http://localhost:3302/${urlApi}/`
    })).callApi(PtlHelloWorld, { name: 'test' });
    assert.equal(res.reply, 'Hello, test!');
});

it('absolute URL without postfix /', async function () {
    let res = await new TsrpcClient(Object.merge({}, clientConfig, {
        serverUrl: `http://localhost:3302/${urlApi}`
    })).callApi(PtlHelloWorld, { name: 'test' });
    assert.equal(res.reply, 'Hello, test!');
});

it('wrong URL', async function () {
    try {
        await new TsrpcClient(Object.merge({}, clientConfig, {
            serverUrl: 'http://localhost:12345'
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

startTest();