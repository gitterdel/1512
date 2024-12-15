import Vue from 'nativescript-vue';
import Home from './Home.vue';
import { NavigationEntry } from '@nativescript/core';

export class AppContainer extends Vue {
  constructor() {
    super();
    
    // Register global components here
    
    // Set up the initial route
    this.$start = () => {
      const navigationEntry: NavigationEntry = {
        moduleName: 'components/Home',
        clearHistory: true
      };
      
      return navigationEntry;
    };
  }
}