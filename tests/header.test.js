const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('localhost:3000');
});

afterEach(async () => {
    await page.close();
});

test('1 + 2 is 3?', () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3);
});

test('The header has the correct text?', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('Clicking login starts OAuth flow?', async () => {
    await page.click('.right a');
    const url = page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button?', async () => {
    await page.login();
    const selector = "a[href='/auth/logout']";
    await page.waitFor(selector);
    const text = await page.getContentsOf(selector);
    expect(text).toEqual("Logout");
});