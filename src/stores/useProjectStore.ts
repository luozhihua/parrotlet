import { defineStore } from 'pinia';
import { merge } from 'lodash-es';

export interface Project {
  id: string;
  name: string;
  path: string;
  language: string;
  enabledLanguages: string[];
  logo: string;
  description: string;
}

export interface State {
  projects: Project[];
  activeId: string;
}

export interface Getters<StateT = State> {
  [k: string]: any;
  project: (state: StateT) => Project;
}

export const ID = 'project';
export const useProjectStore = defineStore<typeof ID, State, Getters>(ID, {
  state: () => ({
    projects: [] as Project[],
    activeId: '',
  }),

  getters: {
    project: (state) =>
      state.projects.find((p) => p.id === state.activeId) as Project,
  },

  actions: {
    add(project: Project) {
      this.projects.push(project);
    },

    remove(projectId: string) {
      const index = this.projects.findIndex((p) => p.id === projectId);
      this.projects.splice(index, 1);
    },

    update(project: Project) {
      const index = this.projects.findIndex((p) => p.id === project.id);
      merge(this.projects[index], project);
    },
  },
});
