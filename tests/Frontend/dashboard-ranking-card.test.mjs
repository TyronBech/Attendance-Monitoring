import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import * as lucide from 'lucide-react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const componentPath = path.resolve(
    'resources/js/components/dashboard-ranking-card.tsx',
);
const source = readFileSync(componentPath, 'utf8');
const compiled = ts.transpileModule(source, {
    compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
    },
}).outputText;
const componentModule = { exports: {} };
vm.runInThisContext(
    '(function(require, exports, module) {' + compiled + '\n})',
)(
    (specifier) =>
        specifier === 'lucide-react'
            ? lucide
            : createRequire(componentPath)(specifier),
    componentModule.exports,
    componentModule,
);
const Card = componentModule.exports.default;
const users = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    rank: index + 1,
    name: index === 0 ? 'A very long visitor name '.repeat(8) : 'Research User',
    user_type: 'Visitor',
    grade_section:
        index === 0
            ? 'Polytechnic University of the Philippines '.repeat(5)
            : 'Grade 12 - ABM 11-B',
    count: 7 - index,
    avatar: null,
}));

test('ranking cards retain full names and affiliations and render the activity counts', () => {
    for (const variant of ['library', 'research']) {
        const html = renderToStaticMarkup(
            React.createElement(Card, { users, variant }),
        );
        assert.ok(html.includes('title="' + users[0].name + '"'));
        assert.ok(html.includes('title="' + users[0].grade_section + '"'));
        assert.equal((html.match(/<tr/g) || []).length, 6);
        assert.ok(html.includes('>7</td>'));
    }
});

test('both ranking cards render their empty state', () => {
    const library = renderToStaticMarkup(
        React.createElement(Card, { users: [], variant: 'library' }),
    );
    const research = renderToStaticMarkup(
        React.createElement(Card, { users: [], variant: 'research' }),
    );
    assert.ok(library.includes('No library visits recorded yet.'));
    assert.ok(research.includes('No online research sessions recorded yet.'));
});

const chrome = process.env.CHROME_PATH?.trim();

test(
    'ranking card columns and rows align without overflow at desktop and mobile sizes',
    {
        skip: chrome
            ? false
            : 'Set CHROME_PATH to enable browser layout checks',
    },
    async () => {
        const cssPath = path.resolve('resources/css/app.css');
        const stylesheet = await compile(readFileSync(cssPath, 'utf8'), {
            base: path.dirname(cssPath),
            from: cssPath,
            onDependency() {},
        });
        const scanner = new Scanner({
            sources: [
                {
                    base: path.resolve('resources/js'),
                    pattern: '**/*.tsx',
                    negated: false,
                },
            ],
        });
        const css = stylesheet.build(scanner.scan());
        const cards = renderToStaticMarkup(
            React.createElement(
                React.Fragment,
                null,
                React.createElement(Card, { users, variant: 'library' }),
                React.createElement(Card, {
                    users: users.map((user) => ({
                        ...user,
                        name: 'Short Name',
                        grade_section: 'N/A',
                    })),
                    variant: 'research',
                }),
            ),
        );
        const directory = mkdtempSync(path.join(tmpdir(), 'ranking-layout-'));

        try {
            for (const width of [1440, 1280, 1024, 768, 375, 320]) {
                const htmlPath = path.join(
                    directory,
                    'layout-' + width + '.html',
                );
                writeFileSync(
                    htmlPath,
                    '<!doctype html><html><head><meta charset="utf-8"><style>' +
                        css +
                        '@media(min-width:1024px){main{width:calc(100% - 256px)}}</style></head><body style="padding:16px"><main class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">' +
                        cards +
                        '</main><output id="measurements"></output><script>' +
                        `const cards = [...document.querySelectorAll('section')];
                const bounds = cards.map(card => ({
                    width: card.clientWidth, scroll: card.scrollWidth,
                    rows: [...card.querySelectorAll('tr')].map(row => ({
                        top: row.getBoundingClientRect().top, height: row.getBoundingClientRect().height,
                        columns: [...row.children].map(cell => cell.getBoundingClientRect().left - card.getBoundingClientRect().left),
                    })),
                }));
                document.querySelector('output').textContent = JSON.stringify({
                    width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth, bounds,
                });` +
                        '</script></body></html>',
                );
                const browser = spawnSync(
                    chrome,
                    [
                        '--headless',
                        '--disable-gpu',
                        '--no-first-run',
                        '--no-default-browser-check',
                        '--user-data-dir=' +
                            path.join(directory, 'profile-' + width),
                        '--window-size=' + width + ',1000',
                        '--dump-dom',
                        pathToFileURL(htmlPath).href,
                    ],
                    {
                        encoding: 'utf8',
                        timeout: 30000,
                        maxBuffer: 4 * 1024 * 1024,
                    },
                );
                assert.equal(browser.status, 0, browser.stderr);
                const result = browser.stdout.match(
                    /<output id="measurements">([^<]+)<\/output>/,
                );
                assert.ok(result, 'Browser must return layout measurements');
                const measurements = JSON.parse(result[1]);
                assert.equal(
                    measurements.overflow,
                    false,
                    'Page overflow at width ' + width,
                );
                const [left, right] = measurements.bounds;

                for (const card of [left, right]) {
                    assert.ok(
                        card.scroll <= card.width,
                        'Card overflow at width ' + width,
                    );

                    for (const row of card.rows.slice(1)) {
                        assert.equal(
                            row.height,
                            56,
                            'Rows must remain equal with long text',
                        );
                    }
                }

                for (let index = 0; index < left.rows.length; index++) {
                    assert.deepEqual(
                        left.rows[index].columns,
                        right.rows[index].columns,
                        'Columns must align',
                    );

                    if (measurements.width >= 1024) {
                        assert.equal(
                            left.rows[index].top,
                            right.rows[index].top,
                            'Rows must align across both cards',
                        );
                    }
                }
            }
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    },
);
