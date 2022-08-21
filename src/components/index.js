import CodeEditor from './codeEditor/index.vue';

function install(Vue) {
    const compoments = [ CodeEditor ];
  
    compoments.forEach(item => {
      if (item.install) {
        Vue.use(item);
      } else if (item.name) {
        Vue.component(item.name, item);
      }
    });
  }
  
export { install, CodeEditor };
  
export default {
    install,
};