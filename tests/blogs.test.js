const Page = require('./helpers/page');

let page;

beforeEach(async() => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe("When logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form?', async () => {
        const label = await page.getContentsOf("form label");
        expect(label).toEqual('Blog Title');
    });

    describe('and using valid inputs', async () => {

        beforeEach(async () => {
            await page.type(".title input", Math.random().toString());
            await page.type(".content input", Math.random().toString());
            await page.click("form button");
        });

        test("submitting takes user to review screen?", async () => {
            const pageHTML = await page.evaluate(() => document.body.innerHTML);
            expect(pageHTML).toMatch(/confirm/);
        });

        test("submitting + saving adds blog to index page?", async () => {
            await page.click("button.green");
            await page.waitFor(".card");
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title.length).toBeGreaterThan(0);
            expect(content.length).toBeGreaterThan(0);
        });

    });

    describe("and using invalid inputs", async () => {

        beforeEach(async () => {
            await page.click('form button');
        });

        test("the form shows an error message?", async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual("You must provide a value");
            expect(contentError).toEqual("You must provide a value");
        });
    });
});

describe("When not logged in", () => {
    test('user cannot create blog posts?', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ title: "Blah", content: "Blah" })
            }).then(res => res.json());
        });

        expect(result).toHaveProperty("error");
    });

    test('user cannot see blog posts?', async () => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(res => res.json());
        });

        expect(result).toHaveProperty("error");
    });
});