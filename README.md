TSRPC WeChat APP
===

`TSRPC` Client for WeChat App

> `TSRPC` is a full-stack rpc framework in TypeScript, see it at [https://github.com/k8w/tsrpc](https://github.com/k8w/tsrpc)

### Features
1. Full stack in TypeScript
1. Strong type check
1. No URL conern
1. Support both text and binary transport
1. Suppport customized transport encryption

### Usage

```
npm install tsrpc-weapp
```

```typescript
import { TsrpcClient } from 'tsrpc-weapp';
import PtlHelloWorld from './protocol/PtlHelloWorld';

let client = new TsrpcClient({ serverUrl: 'http://localhost:3000' })

// The same with TSRPC NodeJS Client
client.callApi(PtlHelloWorld, { name: 'k8w' }).then(res => {
    console.log(res.reply); //Hello, k8w!
})
```