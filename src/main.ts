import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import './style.css';
import { useEditorStore } from './ui/stores/editorStore';

async function bootstrap(): Promise<void> {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);
  await useEditorStore(pinia).initializePersistence();
  app.mount('#app');
}

void bootstrap();
