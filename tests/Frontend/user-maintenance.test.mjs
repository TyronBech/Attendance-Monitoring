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
import * as inertia from '@inertiajs/react';
import { compile } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import * as lucide from 'lucide-react';
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import ts from 'typescript';

const modules = new Map();

function loadComponent(filename) {
    const absolute = path.resolve(filename);
    if (modules.has(absolute)) {
        return modules.get(absolute);
    }
    const source = readFileSync(absolute, 'utf8');
    const compiled = ts.transpileModule(source, {
        compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.CommonJS,
        },
    }).outputText;
    const component = { exports: {} };
    modules.set(absolute, component.exports);
    vm.runInThisContext(
        '(function(require, exports, module) {' + compiled + '\n})',
    )(
        (specifier) => {
            if (specifier === 'lucide-react') {
                return lucide;
            }

            if (specifier === '@inertiajs/react') {
                return inertia;
            }
            if (specifier.startsWith('@/') || specifier.startsWith('.')) {
                const base = specifier.startsWith('@/')
                    ? path.resolve('resources/js', specifier.slice(2))
                    : path.resolve(path.dirname(absolute), specifier);
                let resolved;
                for (const extension of ['.tsx', '.ts', '/index.ts']) {
                    try {
                        readFileSync(base + extension);
                        resolved = base + extension;
                        break;
                    } catch (error) {
                        if (error.code !== 'ENOENT') {
                            throw error;
                        }
                    }
                }
                return loadComponent(resolved ?? base);
            }
            return createRequire(absolute)(specifier);
        },
        component.exports,
        component,
    );
    return component.exports;
}

const render = (component, props) =>
    renderToStaticMarkup(React.createElement(component, props));
const values = {
    user_type: 'Student',
    privilege_id: '1',
    first_name: 'Juan',
    middle_name: '',
    last_name: 'Cruz',
    suffix: '',
    gender: 'Male',
    email: 'juan@example.com',
    rfid: '',
    student_id: 'STU-001',
    grade_level: '',
    section: '',
    employee_id: '',
    employee_role: '',
    school_org: '',
    purpose: '',
};
const groups = [
    { id: 1, user_type: 'Student', category: 'Undergraduate' },
    { id: 2, user_type: 'Employee', category: 'Faculty' },
    { id: 3, user_type: 'Visitor', category: 'Guest' },
];

test('user forms show common fields and only details for the selected group', () => {
    const Fields = loadComponent(
        'resources/js/pages/users/components/user-fields.tsx',
    ).default;
    for (const [type, expected, absent] of [
        [
            'Student',
            ['student_id', 'grade_level', 'section'],
            ['employee_id', 'employee_role', 'school_org', 'purpose'],
        ],
        [
            'Employee',
            ['employee_id', 'employee_role'],
            ['student_id', 'grade_level', 'school_org', 'purpose'],
        ],
        [
            'Visitor',
            ['school_org', 'purpose'],
            ['student_id', 'grade_level', 'employee_id', 'employee_role'],
        ],
    ]) {
        const html = render(Fields, {
            values: { ...values, user_type: type },
            groups,
            errors: {},
            onChange() {},
        });
        for (const name of [
            'first_name',
            'last_name',
            'email',
            'rfid',
            ...expected,
        ]) {
            assert.ok(
                html.includes('name="' + name + '"'),
                type + ' must contain ' + name,
            );
        }
        for (const name of absent) {
            assert.ok(
                !html.includes('name="' + name + '"'),
                type + ' must hide ' + name,
            );
        }
        assert.ok(!html.includes('name="password"'));
    }
});

test('user forms restrict categories to the current group and display validation errors', () => {
    const Fields = loadComponent(
        'resources/js/pages/users/components/user-fields.tsx',
    ).default;
    const html = render(Fields, {
        values,
        groups,
        errors: {
            first_name: 'Enter a first name.',
            student_id: 'This student ID is already used.',
        },
        onChange() {},
    });
    assert.ok(html.includes('Undergraduate'));
    assert.ok(!html.includes('Faculty'));
    assert.ok(!html.includes('Guest'));
    assert.ok(html.includes('Enter a first name.'));
    assert.ok(html.includes('This student ID is already used.'));
    assert.ok(html.includes('aria-invalid="true"'));
});

test('maintenance filters offer only the sort options supported by each group', () => {
    const Filters = loadComponent(
        'resources/js/pages/users/components/user-filters.tsx',
    ).default;
    for (const type of ['Student', 'Employee', 'Visitor']) {
        const html = render(Filters, {
            userType: type,
            search: '',
            sort: 'newest',
            onTypeChange() {},
            onSearchChange() {},
            onSortChange() {},
            onSubmit() {},
            onClear() {},
        });
        assert.ok(html.includes('Recently added'));
        assert.ok(html.includes('Oldest added'));
        assert.equal(html.includes('Grade level'), type === 'Student');
        assert.equal(html.includes('Employee role'), type === 'Employee');
        assert.ok(html.includes('Students'));
        assert.ok(html.includes('Employees'));
        assert.ok(html.includes('Visitors'));
        assert.ok(html.includes('name="search"'));
    }
});

const managedUser = {
    ...values,
    id: 42,
    privilege_id: 1,
    name: 'Juan Cruz',
    category: 'Undergraduate',
    created_at: '2026-10-18T08:00:00Z',
};

async function renderPage(name, props) {
    const Page = loadComponent(
        'resources/js/pages/users/' + name + '.tsx',
    ).default;
    const result = await inertia.createInertiaApp({
        page: {
            component: 'users/' + name,
            url: '/admin/maintenance/users',
            version: null,
            props: { errors: {}, auth: { user: { id: 1 } }, ...props },
        },
        resolve: () => Page,
        setup: ({ App, props: appProps }) => React.createElement(App, appProps),
        render: renderToString,
    });
    return result.body;
}

const listProps = {
    filters: { user_type: 'Student', search: '', sort: 'newest' },
    users: {
        data: [managedUser],
        total: 1,
        from: 1,
        to: 1,
        current_page: 1,
        last_page: 1,
        prev_page_url: null,
        next_page_url: null,
    },
};

test('the user list renders create view edit and delete actions for the correct user', async () => {
    const html = await renderPage('index', listProps);
    assert.ok(
        html.includes(
            'href="/admin/maintenance/users/create?user_type=Student"',
        ),
    );
    assert.ok(html.includes('href="/admin/maintenance/users/42"'));
    assert.ok(html.includes('href="/admin/maintenance/users/42/edit"'));
    assert.ok(html.includes('aria-label="Delete Juan Cruz"'));
    assert.ok(html.includes('Juan Cruz'));
    const table = html.match(/<table\b[\s\S]*?<\/table>/)?.[0];
    assert.ok(table);
    assert.ok(!table.includes('STU-001'));
});

test('maintenance tables hide added dates categories and student IDs while the view retains details', async () => {
    for (const type of ['Student', 'Employee', 'Visitor']) {
        const html = await renderPage('index', {
            ...listProps,
            filters: { ...listProps.filters, user_type: type },
            users: {
                ...listProps.users,
                data: [{ ...managedUser, user_type: type }],
            },
        });
        const table = html.match(/<table\b[\s\S]*?<\/table>/)?.[0];
        assert.ok(table);
        assert.ok(!table.includes('Added'));
        assert.ok(!table.includes('Undergraduate'));
        assert.ok(!table.includes('Student ID'));
        assert.ok(!table.includes('STU-001'));
        assert.equal(
            (table.match(/<th\s/g) ?? []).length,
            type === 'Student' ? 4 : 5,
        );
    }
    const view = await renderPage('show', { managedUser });
    const details = view.match(/<dl\b[\s\S]*?<\/dl>/)?.[0];
    assert.ok(details.includes('Undergraduate'));
    assert.ok(details.includes('STU-001'));
    assert.ok(!details.includes('Added'));
});

test('Add User uses singular group labels while maintenance filters retain plural labels', async () => {
    const create = await renderPage('create', { groups, userType: 'Student' });
    const labels = [
        ...create.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g),
    ].map(([html]) => html.replace(/<[^>]*>/g, ''));
    assert.ok(labels.includes('Student'));
    assert.ok(labels.includes('Employee'));
    assert.ok(labels.includes('Visitor'));
    assert.ok(!labels.includes('Students'));
    assert.ok(!labels.includes('Employees'));
    assert.ok(!labels.includes('Visitors'));
});

test('desktop navigation places Maintenance directly after Import and marks user pages active', async () => {
    const Header = loadComponent(
        'resources/js/components/app-header.tsx',
    ).AppHeader;
    const result = await inertia.createInertiaApp({
        page: {
            component: 'header',
            url: '/admin/maintenance/users/42/edit',
            version: null,
            props: {
                errors: {},
                name: 'Attendance Monitoring',
                ui: null,
                auth: {
                    user: {
                        id: 1,
                        name: 'Admin User',
                        email: 'admin@example.com',
                    },
                },
            },
        },
        resolve: () => Header,
        setup: ({ App, props }) => React.createElement(App, props),
        render: renderToString,
    });
    const buttons = [
        ...result.body.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g),
    ].map(([html]) => ({ html, text: html.replace(/<[^>]*>/g, '') }));
    const importIndex = buttons.findIndex(({ text }) => text === 'Import');
    assert.ok(importIndex >= 0);
    assert.equal(buttons[importIndex + 1].text, 'Maintenance');
    assert.ok(buttons[importIndex + 1].html.includes('aria-current="page"'));
    assert.ok(!result.body.includes('href="/admin/maintenance/users"'));
});

test('the user list shows an empty search state and retains pagination URLs', async () => {
    const empty = await renderPage('index', {
        filters: { ...listProps.filters, search: 'missing' },
        users: { ...listProps.users, data: [], total: 0, from: null, to: null },
    });
    assert.ok(empty.includes('No users match your search.'));
    const paginated = await renderPage('index', {
        ...listProps,
        users: {
            ...listProps.users,
            total: 16,
            last_page: 2,
            next_page_url:
                '/admin/maintenance/users?user_type=Student&sort=oldest&search=Juan&page=2',
        },
    });
    assert.ok(
        paginated.includes(
            'href="/admin/maintenance/users?user_type=Student&amp;sort=oldest&amp;search=Juan&amp;page=2"',
        ),
    );
});

test('create edit and view pages render the actual type specific information', async () => {
    const create = await renderPage('create', { groups, userType: 'Visitor' });
    assert.ok(create.includes('name="school_org"'));
    assert.ok(!create.includes('name="student_id"'));
    const edit = await renderPage('edit', { groups, managedUser });
    assert.ok(edit.includes('value="STU-001"'));
    assert.ok(edit.includes('Save changes'));
    const show = await renderPage('show', { managedUser });
    assert.ok(show.includes('Juan Cruz'));
    assert.ok(show.includes('STU-001'));
    assert.ok(show.includes('href="/admin/maintenance/users/42/edit"'));
});

test('profile pictures appear on View and in the Edit preview but stay out of the user list', async () => {
    const picturedUser = {
        ...managedUser,
        profile_image: 'data:image/png;base64,aW1hZ2U=',
    };
    const view = await renderPage('show', { managedUser: picturedUser });
    assert.ok(view.includes('src="data:image/png;base64,aW1hZ2U="'));
    assert.ok(view.includes('alt="Profile photo of Juan Cruz"'));
    const withoutPicture = await renderPage('show', {
        managedUser: { ...managedUser, profile_image: null },
    });
    assert.ok(withoutPicture.includes('aria-label="No profile photo"'));
    assert.ok(withoutPicture.includes('<svg'));
    assert.ok(!withoutPicture.includes('<img'));

    const list = await renderPage('index', {
        ...listProps,
        users: { ...listProps.users, data: [picturedUser] },
    });
    const table = list.match(/<table\b[\s\S]*?<\/table>/)?.[0];
    assert.ok(!table.includes('<img'));
    const edit = await renderPage('edit', {
        groups,
        managedUser: picturedUser,
    });
    assert.ok(edit.includes('src="data:image/png;base64,aW1hZ2U="'));
});

test('Add and Edit forms include an optional photo input with validation guidance and error feedback', async () => {
    for (const type of ['Student', 'Employee', 'Visitor']) {
        const create = await renderPage('create', { groups, userType: type });
        const input = create.match(/<input\b[^>]*type="file"[^>]*>/)?.[0];
        assert.ok(input);
        assert.ok(input.includes('name="profile_image"'));
        assert.ok(input.includes('accept="image/jpeg,image/png,image/webp"'));
        assert.ok(!input.includes('required'));
        assert.ok(create.includes('2 MB'));
        assert.ok(create.includes('4096'));
    }
    const PhotoInput = loadComponent(
        'resources/js/pages/users/components/user-photo-input.tsx',
    ).default;
    const html = render(PhotoInput, {
        photo: null,
        currentPhoto: managedUser.profile_image,
        removePhoto: false,
        error: 'The profile photo must not exceed 2 MB.',
        onChange() {},
        onRemoveChange() {},
    });
    assert.ok(html.includes('The profile photo must not exceed 2 MB.'));
    assert.ok(html.includes('aria-invalid="true"'));
});

test(
    'maintenance pages fit desktop and mobile viewports',
    {
        skip: process.env.CHROME_PATH
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
        const pages = {
            index: await renderPage('index', listProps),
            create: await renderPage('create', { groups, userType: 'Student' }),
            show: await renderPage('show', { managedUser }),
        };
        const directory = mkdtempSync(
            path.join(tmpdir(), 'user-maintenance-layout-'),
        );
        try {
            for (const [name, body] of Object.entries(pages)) {
                for (const width of [1280, 375]) {
                    const filename = path.join(
                        directory,
                        name + '-' + width + '.html',
                    );
                    const screenshotPath = process.env
                        .USER_MAINTENANCE_SCREENSHOT_DIR
                        ? path.join(
                              process.env.USER_MAINTENANCE_SCREENSHOT_DIR,
                              name + '-' + width + '.png',
                          )
                        : null;
                    writeFileSync(
                        filename,
                        '<!doctype html><html><head><meta charset="utf-8"><style>' +
                            css +
                            '</style></head><body style="width:' +
                            width +
                            'px">' +
                            body +
                            '<output id="measurements" hidden></output><script>' +
                            `const selected=document.querySelector('[data-state="on"]');const selectedStyle=selected?getComputedStyle(selected):null;document.querySelector("#measurements").textContent=JSON.stringify({overflow:document.body.scrollWidth>${width},inputs:[...document.querySelectorAll("input,select")].every(el=>el.getBoundingClientRect().right<=${width}),selectedVisible:!selectedStyle||(selectedStyle.backgroundColor!=="rgba(0, 0, 0, 0)"&&selectedStyle.backgroundColor!==selectedStyle.color),actions:[...document.querySelectorAll("button")].filter(el=>el.textContent.includes("Delete")).length});` +
                            '</script></body></html>',
                    );
                    const browser = spawnSync(
                        process.env.CHROME_PATH,
                        [
                            '--headless',
                            '--disable-gpu',
                            '--no-first-run',
                            '--no-default-browser-check',
                            '--user-data-dir=' +
                                path.join(directory, 'profile-' + name + width),
                            '--window-size=' + width + ',1100',
                            '--dump-dom',
                            ...(screenshotPath
                                ? ['--screenshot=' + screenshotPath]
                                : []),
                            pathToFileURL(filename).href,
                        ],
                        {
                            encoding: 'utf8',
                            timeout: 30000,
                            maxBuffer: 4 * 1024 * 1024,
                        },
                    );
                    assert.equal(browser.status, 0, browser.stderr);
                    const measured = browser.stdout.match(
                        /<output id="measurements"[^>]*>([^<]+)<\/output>/,
                    );
                    assert.ok(
                        measured,
                        'Browser must return measurements for ' + name,
                    );
                    const measurements = JSON.parse(measured[1]);
                    assert.equal(
                        measurements.overflow,
                        false,
                        name + ' must not overflow at ' + width,
                    );
                    assert.equal(
                        measurements.inputs,
                        true,
                        name + ' controls must fit at ' + width,
                    );
                    assert.equal(
                        measurements.selectedVisible,
                        true,
                        name + ' selected user group must remain readable',
                    );
                    if (name === 'index') {
                        assert.equal(measurements.actions, 1);
                    }
                }
            }
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    },
);
