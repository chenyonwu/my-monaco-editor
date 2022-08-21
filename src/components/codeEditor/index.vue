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

    self.MonacoEnvironment = {
        getWorker(_, label) {
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
    })

    function init() {
        monacoInstance.value = monaco.editor.create(unref(codeEditorRef), {
            value: ['function x() {', '\tconsole.log("Hello, world");', '}'].join('\n'),
            language: "javascript",
            theme: 'vs-dark',
        });
    }
</script>

<style lang="scss" scoped>
    .code-editor {
        width: 700px;
        height: 700px;
    }
</style>