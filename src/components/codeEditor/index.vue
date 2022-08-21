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