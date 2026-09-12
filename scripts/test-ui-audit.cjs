'use strict';

// Run with: node scripts/test-ui-audit.cjs
// These isolated component checks use the project's TypeScript runtime and hook
// stubs. Browser focus, rendering, and screen-reader behavior need browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');

function nodes(tree) {
  const found = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== 'object' || !node.props) return;
    found.push(node);
    visit(node.props.children);
  }
  visit(tree);
  return found;
}

function loadComponent(filename) {
  const state = [];
  let cursor = 0;
  let currentProps;
  let checks;
  const calls = { fetch: [], focused: [], changes: [] };
  const loadedModule = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const editor = {
    can: () => ({ undo: () => true, redo: () => true }),
    isActive: () => false,
  };

  const context = {
    module: loadedModule,
    exports: loadedModule.exports,
    URL,
    console,
    setTimeout: () => {},
    document: { getElementById: id => ({ focus: () => calls.focused.push(id) }) },
    fetch: async (url, init) => {
      calls.fetch.push({ url, init });
      return { ok: true, json: async () => ({ success: true }) };
    },
    require(name) {
      if (name === 'react') return {
        useState(initial) {
          const index = cursor++;
          if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
          return [state[index], value => {
            state[index] = typeof value === 'function' ? value(state[index]) : value;
          }];
        },
        useRef(initial) {
          const index = cursor++;
          if (!(index in state)) state[index] = { current: initial };
          return state[index];
        },
        useId() { return `test-${cursor++}`; },
        useEffect() {},
        useMemo(compute) {
          const value = compute();
          if (Array.isArray(value) && value.some(item => item.id === 'keyword-content')) checks = value;
          return value;
        },
      };
      if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx };
      if (name === 'lucide-react') return new Proxy({}, { get: (_, prop) => String(prop) });
      if (name === 'framer-motion') return {
        motion: new Proxy({}, { get: (_, prop) => `motion.${String(prop)}` }),
        AnimatePresence: 'AnimatePresence',
      };
      if (name === '@/lib/seo/config') return { siteConfig: { url: 'https://threemonkeysphuket.com' } };
      if (name === '@tiptap/react') return { useEditor: () => editor, EditorContent: 'EditorContent' };
      if (name.startsWith('@tiptap/')) return { default: { configure: () => ({}) } };
      if (name === './EditorImageUpload') return { default: 'EditorImageUpload' };
      if (name === 'next/image') return { default: 'Image' };
      if (name === '@/i18n/navigation') return { Link: 'Link' };
      if (name === '@/components/ui') return { CustomSelect: 'CustomSelect', CountryCodeSelect: 'CountryCodeSelect' };
      if (name === '@/components/ui/RainforestBackground') return { RainforestBackground: 'RainforestBackground' };
      if (name === 'next-intl') return { useTranslations: () => key => key };
      throw new Error(`Unexpected import: ${name}`);
    },
  };

  const source = fs.readFileSync(path.join(projectRoot, filename), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  vm.runInNewContext(compiled.outputText, context, { filename });
  const component = loadedModule.exports.default || loadedModule.exports.CustomSelect;
  return {
    calls,
    render(props = currentProps) {
      currentProps = props;
      cursor = 0;
      return component(props);
    },
    checks: () => checks,
  };
}

const seoFile = 'components/admin/blog/SEOPanel.tsx';
const seoProps = {
  title: 'Restaurant guide', slug: 'guide', content: '<p>Dining guide.</p>',
  seoData: {
    seoTitle: '', seoDescription: '', focusKeyword: 'dining', secondaryKeywords: [], canonicalUrl: '',
    ogTitle: '', ogDescription: '', ogImage: '', twitterTitle: '', twitterDescription: '', twitterImage: '',
    noIndex: false, noFollow: false,
  },
  onChange() {},
};

function testEditorIdentity() {
  const scenarios = [
    [seoFile, ['Section', 'StatusIcon'], seoProps],
    ['components/admin/blog/RichTextEditor.tsx', ['ToolbarButton', 'ToolbarDivider'], { content: '<p>First draft</p>', onChange() {} }],
  ];
  for (const [file, componentNames, props] of scenarios) {
    const component = loadComponent(file);
    const first = nodes(component.render(props));
    const second = nodes(component.render({ ...props, content: '<p>Updated draft</p>' }));
    for (const name of componentNames) {
      const find = list => list.find(node => typeof node.type === 'function' && node.type.name === name);
      assert.ok(find(first), `${name} must exist`);
      assert.equal(find(first).type, find(second).type, `${name} must not remount after editing`);
    }
  }

  const seo = loadComponent(seoFile);
  const getSection = () => nodes(seo.render(seoProps)).find(node => node.props.id === 'focus-keyword');
  const sectionNodes = () => { const section = getSection(); return nodes(section.type(section.props)); };
  assert.ok(sectionNodes().some(node => node.type === 'input'));
  sectionNodes().find(node => node.type === 'button').props.onClick();
  assert.equal(sectionNodes().some(node => node.type === 'input'), false);
  sectionNodes().find(node => node.type === 'button').props.onClick();
  assert.ok(sectionNodes().some(node => node.type === 'input'));
  console.log('PASS: editor component identities and section toggling');
}

function testSEOAnalysis() {
  const seo = loadComponent(seoFile);
  function analyze(keyword, content) {
    seo.render({ ...seoProps, content, seoData: { ...seoProps.seoData, focusKeyword: keyword } });
    return Object.fromEntries(seo.checks().map(check => [check.id, check]));
  }
  for (const [keyword, content, count] of [
    ['[', '<p>A [ and [.</p>', 2],
    ['C++', '<p>C++ and C++.</p>', 2],
    ['.', '<p>One. Two.</p>', 2],
    ['.*', '<p>Literal .* here.</p>', 1],
    ['DINING', '<p>Dining and dining.</p>', 2],
  ]) {
    assert.match(analyze(keyword, content)['keyword-content'].message, new RegExp(`appears ${count} times`));
  }
  for (const [content, status] of [
    ['<p>Welcome.</p><p>Dining tips.</p>', 'warning'],
    ['<h2>Dining</h2><p>Welcome.</p><p>Dining tips.</p>', 'warning'],
    ['<P class="intro">Try <strong>DINING</strong> here.</P>', 'good'],
    ['Welcome.\n\nDining tips.', 'warning'],
    ['', 'warning'],
  ]) {
    assert.equal(analyze('dining', content)['keyword-intro'].status, status);
  }
  console.log('PASS: literal keyword matching and first-paragraph detection');
}

function testSelectKeyboard() {
  const select = loadComponent('components/ui/CustomSelect.tsx');
  let props = {
    value: '',
    onChange(value) { select.calls.changes.push(value); props = { ...props, value }; },
    options: [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Blocked', disabled: true }, { value: 'c', label: 'Charlie' }],
    id: 'test-select',
  };
  const trigger = () => nodes(select.render(props)).find(node => node.props.role === 'combobox');
  function key(value) {
    const button = trigger();
    button.props.ref.current = { focus: () => select.calls.focused.push('trigger') };
    let prevented = false;
    button.props.onKeyDown({ key: value, preventDefault() { prevented = true; }, stopPropagation() {} });
    return prevented;
  }
  const active = index => assert.equal(trigger().props['aria-activedescendant'], `test-select-listbox-option-${index}`);

  assert.equal(trigger().props['aria-expanded'], false);
  assert.equal(key('ArrowDown'), true);
  active(0);
  assert.equal(trigger().props['aria-expanded'], true);
  assert.ok(nodes(select.render(props)).find(node => node.props.role === 'listbox' && node.props.id === trigger().props['aria-controls']));
  key('ArrowDown'); active(2);
  key('Enter');
  assert.deepEqual(select.calls.changes, ['c']);
  assert.equal(trigger().props['aria-expanded'], false);
  assert.equal(select.calls.focused.length, 1);
  key(' '); active(2);
  key('Home'); active(0);
  key('End'); active(2);
  key('ArrowDown'); active(0);
  key('ArrowUp'); active(2);
  const blocked = nodes(select.render(props)).find(node => node.props.role === 'option' && node.props['aria-disabled']);
  assert.equal(blocked.props.disabled, true);
  blocked.props.onClick();
  assert.deepEqual(select.calls.changes, ['c']);
  key('Escape');
  assert.equal(trigger().props['aria-expanded'], false);
  assert.deepEqual(select.calls.changes, ['c']);
  key('ArrowUp');
  assert.equal(key('Tab'), false);
  assert.equal(trigger().props['aria-expanded'], false);

  for (const options of [[{ value: 'b', label: 'Blocked', disabled: true }], []]) {
    props = { ...props, options };
    key('ArrowDown'); key('Enter');
    assert.deepEqual(select.calls.changes, ['c']);
    assert.equal(trigger().props['aria-activedescendant'], undefined);
    key('Escape');
  }
  console.log('PASS: dropdown keyboard navigation, disabled options, ARIA, and focus return');
}

async function testContactForm() {
  const contact = loadComponent('app/[locale]/(public)/contact/page.tsx');
  const renderedNodes = () => nodes(contact.render({}));
  const submit = () => renderedNodes().find(node => node.type === 'form').props.onSubmit({ preventDefault() {} });
  for (const field of ['name', 'email', 'phone', 'subject', 'message']) {
    assert.ok(renderedNodes().find(node => node.type === 'label' && node.props.htmlFor === `contact-${field}`));
    assert.ok(renderedNodes().find(node => node.props.id === `contact-${field}`));
  }
  await submit();
  assert.equal(contact.calls.fetch.length, 0);
  assert.deepEqual(contact.calls.focused, ['contact-subject']);
  assert.equal(renderedNodes().find(node => node.props.id === 'contact-subject').props['aria-invalid'], true);
  for (const [name, value] of [['name', 'Test Guest'], ['email', 'test@example.com'], ['message', 'Reservation inquiry']]) {
    renderedNodes().find(node => node.props.name === name).props.onChange({ target: { name, value } });
  }
  renderedNodes().find(node => node.props.id === 'contact-subject').props.onChange('reservation');
  assert.equal(renderedNodes().find(node => node.props.id === 'contact-subject').props['aria-invalid'], false);
  await submit();
  assert.equal(contact.calls.fetch.length, 1);
  assert.equal(JSON.parse(contact.calls.fetch[0].init.body).subject, 'reservation');
  console.log('PASS: contact labels and subject validation before a mocked POST');
}

async function main() {
  testEditorIdentity();
  testSEOAnalysis();
  testSelectKeyboard();
  await testContactForm();
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
