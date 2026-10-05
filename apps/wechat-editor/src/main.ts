import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  ElButton,
  ElDrawer,
  ElOption,
  ElRadioButton,
  ElRadioGroup,
  ElSelect,
  ElSlider,
  ElSwitch,
} from 'element-plus'
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-drawer.css'
import 'element-plus/theme-chalk/el-radio-button.css'
import 'element-plus/theme-chalk/el-radio-group.css'
import 'element-plus/theme-chalk/el-select.css'
import 'element-plus/theme-chalk/el-option.css'
import 'element-plus/theme-chalk/el-slider.css'
import 'element-plus/theme-chalk/el-switch.css'
import App from './App.vue'

createApp(App)
  .use(createPinia())
  .use(ElButton)
  .use(ElDrawer)
  .component('ElRadioButton', ElRadioButton)
  .component('ElRadioGroup', ElRadioGroup)
  .use(ElOption)
  .use(ElSelect)
  .use(ElSlider)
  .use(ElSwitch)
  .mount('#app')
