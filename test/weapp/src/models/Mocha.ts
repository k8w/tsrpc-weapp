export function clearTest() {
    tests = [];
}

let tests: any[] = [];

export function it(name: string, func: Function) {
    tests.push({
        name: name, 
        func: func
    })
}

export async function startTest() {
    console.log('%c[TEST]Test Starting!!!!!', 'color: #0f0');
    let i = 0;
    let succNum = 0, failNum = 0;
    for (let test of tests) {
        console.log(`%c[TEST]Start [${test.name}] ${++i}/${tests.length}`, 'color: #0f0');
        try {
            await test.func();
            console.log('%c[TEST]succ', 'color: #0f0');
            ++succNum;
        }
        catch (e) {
            console.log('%c[TEST]fail', 'color: #f00');
            console.error(e);
            ++failNum;
        }
    }
    console.log(`%c[TEST]Test Done!!!!! succ ${succNum}, fail ${failNum}`, 'color: #0f0');
}