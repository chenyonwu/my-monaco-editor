<template>
    hello, monaco-editor
    <div ref="codeEditorRef" class="code-editor">

    </div>
</template>

<script>
    export default {
        name: 'CodeEditor',
    }
</script>

<script setup>
    import * as monaco from 'monaco-editor';
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import { loadWASM } from 'onigasm';
    import { Registry} from 'monaco-textmate';
    import { default as themeData } from './theme.json';
    import { wireTmGrammars } from 'monaco-editor-textmate';
    

    //加载onigasm
    const baseUrl = import.meta.env.PROD ? `//${location.host}` : '';
    const initMonaco = async () => {
        await loadWASM(`${baseUrl}/monacoConfig/onigasm/onigasm.wasm`);
    }
    let hasGetWork = false;

    //创建作用域映射
    const tmGrammarJsonMap = {
        'source.json': 'JSON.tmLanguage.json',
        'source.ts': 'TypeScript.tmLanguage.json',
        'source.js': 'JavaScript.tmLanguage.json',
        'source.js.jsx': 'JavaScriptReact.tmLanguage.json',
        'source.js.regexp': {
            format: 'plist',
            path: 'Regular Expressions (JavaScript).tmLanguage',
        },
    };
    const scopeNameMap = {
        json: 'source.json',
        typescript: 'source.ts',
        javascript: 'source.js',
        javascriptreact: 'source.js.jsx',
    };
    //注册语法映射
    const registry = new Registry({
        getGrammarDefinition: async scopeName => {
        let jsonMap = tmGrammarJsonMap[scopeName];

        if (!jsonMap) {
            return null;
        }

        let format = 'json';
        let path = jsonMap;

        if (typeof jsonMap !== 'string') {
            format = jsonMap.format;
            path = jsonMap.path;
        }

        return {
            format,
            content: await (await fetch(`${baseUrl}/monacoConfig/grammars/${path}`)).text(),
        };
        },
    });

    self.MonacoEnvironment = {
        getWorker(_, label) {
            let hasGetWork = true;

            if (label === 'json') {
                return new jsonWorker();
            }
            if (label === 'css' || label === 'scss' || label === 'less') {
                return new cssWorker();
            }
            if (label === 'html' || label === 'handlebars' || label === 'razor') {
                return new htmlWorker();
            }
            if (label === 'typescript' || label === 'javascript') {
                return new tsWorker();
            }
            return new editorWorker();
        },
    };

    const codeEditorRef = ref(null);
    const monacoInstance = shallowRef(null);

    onMounted(() => {
        init();
        initMonaco();
    })

    function init() {
        //定义主题
        monaco.editor.defineTheme('OneDarkPro', themeData);

        monacoInstance.value = monaco.editor.create(unref(codeEditorRef), {
            value: ['function x() {', '\tconsole.log("Hello, world");', '}'].join('\n'),
            language: "javascript",
            theme: 'vs-dark',
        });
        monaco.editor.setTheme('OneDarkPro');
    }

    //设置token解析器
    const loop = () => {
        if (hasGetWork) {
        Promise.resolve().then(async () => {
            await wireTmGrammars(monaco, registry, grammars, editor);
        });
        } else {
        setTimeout(() => {
            loop();
        }, 200);
        }
    };

    loop();
</script>

<style lang="scss" scoped>
    .code-editor {
        width: 700px;
        height: 700px;
    }
</style>