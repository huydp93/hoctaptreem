import { Lesson } from '../../types/Education';
import { letterBLesson } from '../../data/lessons/letterB';

const ALL_LESSONS: Lesson[] = [letterBLesson];

class LessonManagerImpl {
  private byId: Map<string, Lesson> = new Map();

  constructor() {
    ALL_LESSONS.forEach((lesson) => this.byId.set(lesson.id, lesson));
  }

  getById(id: string): Lesson | undefined {
    return this.byId.get(id);
  }

  getAll(): Lesson[] {
    return [...this.byId.values()];
  }
}

export const LessonManager = new LessonManagerImpl();
