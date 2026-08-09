import { Component, inject, input, OnInit, OnDestroy, DestroyRef, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { WidgetService } from '../../services/widget.service';
import { NotesService } from '../../services/notes.service';
import { TodoService } from '../../services/todo.service';
import { BookmarkService } from '../../services/bookmark.service';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { RssService, RssFeedData } from '../../services/rss.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../shared/toast.service';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ErrorStateComponent } from '../../shared/error-state.component';
import { ModalComponent } from '../../shared/modal.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { ColorSwatchPickerComponent } from '../../shared/color-swatch-picker.component';
import { Dashboard, WidgetInstance, Task, Bookmark } from '../../interfaces';

// ========== CLOCK WIDGET ==========
@Component({
  selector: 'app-clock-widget',
  standalone: true,
  template: `
    <div class="text-center p-2">
      <div class="text-5xl font-mono font-bold" style="color: var(--color-primary)">
        {{ time() }}
      </div>
      <div class="text-sm" style="color: var(--color-ink-secondary)">
        {{ dateStr() }}
      </div>
    </div>
  `,
})
export class ClockWidgetComponent implements OnInit, OnDestroy {
  readonly config = input<any>({});
  protected time = signal('');
  protected dateStr = signal('');
  private intervalId: any;

  ngOnInit() {
    this.updateTime();
    this.intervalId = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const format24h = this.config()?.format24h ?? false;
    const showSeconds = this.config()?.showSeconds ?? false;

    if (format24h) {
      this.time.set(`${hours.toString().padStart(2, '0')}:${minutes}${showSeconds ? ':' + seconds : ''}`);
    } else {
      const period = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      this.time.set(`${h12}:${minutes}${showSeconds ? ':' + seconds : ''} ${period}`);
    }

    this.dateStr.set(
      now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
  }
}

// ========== NOTES WIDGET ==========
@Component({
  selector: 'app-notes-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="notes-widget">
      <textarea
        class="w-full min-h-[120px] px-3 py-2 text-sm border border-border rounded-md bg-surface text-ink outline-none resize-y focus:border-primary transition-colors"
        placeholder="Write something..."
        [value]="content"
        (input)="onInput($event)"
        maxlength="2000"
      ></textarea>
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-ink-secondary">{{ content.length }}/2000</span>
        <span class="text-xs" [class.text-success]="saved()" [class.text-ink-secondary]="!saved()">
          @if (saving()) { Saving... }
          @else if (saved()) { Saved ✓ }
          @else { Unsaved }
        </span>
      </div>
    </div>
  `,
})
export class NotesWidgetComponent implements OnInit {
  readonly widgetId = input.required<string>();
  readonly config = input<any>({});
  private notesService = inject(NotesService);
  private toastService = inject(ToastService);

  protected content = '';
  protected saved = signal(true);
  protected saving = signal(false);
  private saveTimer: any;

  ngOnInit() {
    this.notesService.getNotes(this.widgetId()).subscribe({
      next: (notes) => {
        if (notes.length > 0) {
          this.content = notes[0].content;
        }
      },
    });
  }

  protected onInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.content = textarea.value;
    this.saved.set(false);

    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveContent(), 3000);
  }

  private saveContent() {
    this.saving.set(true);
    this.notesService.getNotes(this.widgetId()).subscribe({
      next: (notes) => {
        if (notes.length > 0) {
          this.notesService.update(notes[0].id, { content: this.content }).subscribe({
            next: () => {
              this.saved.set(true);
              this.saving.set(false);
            },
            error: () => {
              this.saving.set(false);
            },
          });
        } else {
          this.notesService.create(this.widgetId(), this.content).subscribe({
            next: () => {
              this.saved.set(true);
              this.saving.set(false);
            },
            error: () => {
              this.saving.set(false);
            },
          });
        }
      },
    });
  }
}

// ========== TODO WIDGET ==========
@Component({
  selector: 'app-todo-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="todo-widget">
      <!-- Add task -->
      <div class="flex gap-2 mb-3">
        <input
          type="text"
          #taskInput
          placeholder="Add a task..."
          class="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-surface text-ink outline-none focus:border-primary transition-colors"
          (keydown.enter)="addTask(taskInput.value); taskInput.value = ''"
        />
        <button
          class="px-3 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors cursor-pointer border-none"
          (click)="addTask(taskInput.value); taskInput.value = ''"
        >
          Add
        </button>
      </div>

      <!-- Task count -->
      <div class="text-xs text-ink-secondary mb-2">
        {{ completedCount() }}/{{ tasks().length }} completed
      </div>

      <!-- Task list -->
      <div class="task-list flex flex-col gap-1.5 max-h-[250px] overflow-y-auto">
        @for (task of tasks(); track task.id) {
          <div class="task-item flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-secondary transition-colors group">
            <input
              type="checkbox"
              [checked]="task.completed"
              (change)="toggleTask(task)"
              class="w-4 h-4 accent-primary cursor-pointer"
            />
            <span
              class="flex-1 text-sm cursor-pointer"
              [class.line-through]="task.completed"
              [class.text-ink-secondary]="task.completed"
              [class.text-ink]="!task.completed"
              (click)="toggleTask(task)"
            >
              {{ task.text }}
            </span>
            <button
              class="opacity-0 group-hover:opacity-100 p-1 text-ink-secondary hover:text-danger rounded transition-all cursor-pointer bg-transparent border-none text-xs"
              (click)="deleteTask(task)"
            >
              ✕
            </button>
          </div>
        } @empty {
          <div class="text-xs text-ink-secondary py-4 text-center">No tasks yet</div>
        }
      </div>
    </div>
  `,
})
export class TodoWidgetComponent implements OnInit {
  readonly widgetId = input.required<string>();
  readonly config = input<any>({});
  private todoService = inject(TodoService);
  private toastService = inject(ToastService);

  protected tasks = signal<Task[]>([]);
  protected completedCount = computed(() => this.tasks().filter((t) => t.completed).length);

  ngOnInit() {
    this.loadTasks();
  }

  private loadTasks() {
    this.todoService.getTasks(this.widgetId()).subscribe({
      next: (tasks) => this.tasks.set(tasks),
    });
  }

  protected addTask(text: string) {
    if (!text?.trim()) return;
    this.todoService.create(this.widgetId(), text.trim()).subscribe({
      next: (task) => {
        this.tasks.update((t) => [...t, task]);
      },
      error: () => this.toastService.error('Failed to add task'),
    });
  }

  protected toggleTask(task: Task) {
    this.todoService.update(task.id, { completed: !task.completed }).subscribe({
      next: () => {
        this.tasks.update((t) =>
          t.map((x) => (x.id === task.id ? { ...x, completed: !x.completed } : x))
        );
      },
    });
  }

  protected deleteTask(task: Task) {
    this.todoService.delete(task.id).subscribe({
      next: () => {
        this.tasks.update((t) => t.filter((x) => x.id !== task.id));
      },
    });
  }
}

// ========== LINKS WIDGET ==========
@Component({
  selector: 'app-links-widget',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="links-widget">
      <!-- Add link button -->
      @if (showAddForm()) {
        <div class="flex flex-col gap-2 mb-3 p-3 bg-surface-secondary rounded-lg border border-border">
          <input
            type="text"
            #linkTitle
            placeholder="Title"
            class="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-ink outline-none focus:border-primary"
          />
          <input
            type="url"
            #linkUrl
            placeholder="https://..."
            class="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-ink outline-none focus:border-primary"
          />
          <div class="flex gap-2">
            <button
              class="px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary-hover transition-colors cursor-pointer border-none"
              (click)="addBookmark(linkTitle.value, linkUrl.value); linkTitle.value = ''; linkUrl.value = ''"
            >
              Save
            </button>
            <button
              class="px-3 py-1.5 text-xs rounded-md border border-border text-ink hover:bg-surface transition-colors cursor-pointer bg-surface-secondary"
              (click)="showAddForm.set(false)"
            >
              Cancel
            </button>
          </div>
        </div>
      } @else {
        <button
          class="w-full mb-3 px-3 py-1.5 text-xs font-medium text-primary border-2 border-dashed border-primary-300 rounded-lg hover:bg-primary-50 transition-colors cursor-pointer bg-transparent"
          (click)="showAddForm.set(true)"
        >
          + Add Link
        </button>
      }

      <!-- Bookmark grid -->
      <div class="bookmark-grid grid grid-cols-2 gap-2">
        @for (bm of bookmarks(); track bm.id) {
          <a
            [href]="bm.url"
            target="_blank"
            rel="noopener noreferrer"
            class="bookmark-tile flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary hover:bg-primary-50 transition-colors no-underline group"
          >
            <img
              [src]="'https://www.google.com/s2/favicons?domain=' + getDomain(bm.url) + '&sz=32'"
              class="w-5 h-5 rounded"
              alt=""
              loading="lazy"
              (error)="onFaviconError($event)"
            />
            <span class="flex-1 text-sm text-ink truncate">{{ bm.title }}</span>
            <button
              class="opacity-0 group-hover:opacity-100 p-0.5 text-ink-secondary hover:text-danger transition-all cursor-pointer bg-transparent border-none text-xs"
              (click)="$event.preventDefault(); $event.stopPropagation(); deleteBookmark(bm)"
            >
              ✕
            </button>
          </a>
        }
      </div>
    </div>
  `,
})
export class LinksWidgetComponent implements OnInit {
  readonly widgetId = input.required<string>();
  readonly config = input<any>({});
  private bookmarkService = inject(BookmarkService);
  private toastService = inject(ToastService);

  protected bookmarks = signal<Bookmark[]>([]);
  protected showAddForm = signal(false);

  ngOnInit() {
    this.loadBookmarks();
  }

  private loadBookmarks() {
    this.bookmarkService.getBookmarks(this.widgetId()).subscribe({
      next: (bookmarks) => this.bookmarks.set(bookmarks),
    });
  }

  protected getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  protected onFaviconError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  protected addBookmark(title: string, url: string) {
    if (!title?.trim() || !url?.trim()) return;
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    this.bookmarkService.create(this.widgetId(), { title: title.trim(), url }).subscribe({
      next: (bm) => {
        this.bookmarks.update((b) => [...b, bm]);
        this.showAddForm.set(false);
      },
      error: () => this.toastService.error('Failed to add bookmark'),
    });
  }

  protected deleteBookmark(bm: Bookmark) {
    this.bookmarkService.delete(bm.id).subscribe({
      next: () => {
        this.bookmarks.update((b) => b.filter((x) => x.id !== bm.id));
      },
    });
  }
}

// ========== WEATHER WIDGET ==========
@Component({
  selector: 'app-weather-widget',
  standalone: true,
  template: `
    <div class="weather-widget text-center p-2">
      @if (weatherData()) {
        <div class="weather-icon text-4xl mb-1">{{ getWeatherEmoji(weatherData()!.condition) }}</div>
        <div class="text-3xl font-bold text-ink">{{ weatherData()!.temperature }}°{{ config()?.units === 'imperial' ? 'F' : 'C' }}</div>
        <div class="text-sm text-ink-secondary">{{ weatherData()!.location }}</div>
        <div class="text-xs text-ink-secondary mt-1">{{ weatherData()!.condition }}</div>
      } @else {
        <div class="text-sm text-ink-secondary">Configure weather widget</div>
      }
    </div>
  `,
})
export class WeatherWidgetComponent implements OnInit {
  readonly widgetId = input.required<string>();
  readonly config = input<any>({});
  private weatherService = inject(WeatherService);

  protected weatherData = signal<WeatherData | null>(null);

  ngOnInit() {
    const cfg = this.config();
    if (cfg?.location) {
      this.weatherService
        .getWeather(this.widgetId(), cfg.location, cfg.units || 'metric')
        .subscribe({
          next: (data) => this.weatherData.set(data),
        });
    }
  }

  protected getWeatherEmoji(condition: string): string {
    const c = condition?.toLowerCase() || '';
    if (c.includes('sun') || c.includes('clear')) return '☀️';
    if (c.includes('cloud')) return '☁️';
    if (c.includes('rain') || c.includes('drizzle')) return '🌧️';
    if (c.includes('snow')) return '🌨️';
    if (c.includes('thunder') || c.includes('storm')) return '⛈️';
    if (c.includes('fog') || c.includes('mist')) return '🌫️';
    return '🌤️';
  }
}

// ========== POMODORO WIDGET ==========
@Component({
  selector: 'app-pomodoro-widget',
  standalone: true,
  template: `
    <div class="pomodoro-widget text-center p-2">
      <!-- Timer display -->
      <div class="relative w-32 h-32 mx-auto mb-3">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke="var(--color-border)"
            stroke-width="6"
          />
          <circle
            cx="64" cy="64" r="56"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="6"
            stroke-linecap="round"
            [attr.stroke-dasharray]="2 * Math.PI * 56"
            [attr.stroke-dashoffset]="2 * Math.PI * 56 * (1 - progress())"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="text-2xl font-mono font-bold text-ink">{{ displayTime() }}</div>
          <div class="text-xs text-ink-secondary mt-0.5">{{ isWork() ? 'Work' : 'Break' }}</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-2">
        @if (!running()) {
          <button
            class="px-4 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors cursor-pointer border-none"
            (click)="startTimer()"
          >
            Start
          </button>
        } @else {
          <button
            class="px-4 py-1.5 bg-warning text-white text-sm rounded-md hover:opacity-90 transition-colors cursor-pointer border-none"
            (click)="pauseTimer()"
          >
            Pause
          </button>
        }
        <button
          class="px-4 py-1.5 text-sm rounded-md border border-border text-ink hover:bg-surface-secondary transition-colors cursor-pointer bg-surface"
          (click)="resetTimer()"
        >
          Reset
        </button>
      </div>
    </div>
  `,
})
export class PomodoroWidgetComponent implements OnInit, OnDestroy {
  readonly config = input<any>({});
  protected readonly Math = Math;

  protected workDuration = signal(25);
  protected breakDuration = signal(5);
  protected timeLeft = signal(25 * 60);
  protected running = signal(false);
  protected isWork = signal(true);
  protected intervalId: any;

  protected displayTime = computed(() => {
    const total = this.timeLeft();
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  protected progress = computed(() => {
    const total = this.isWork()
      ? this.workDuration() * 60
      : this.breakDuration() * 60;
    return total > 0 ? 1 - this.timeLeft() / total : 0;
  });

  ngOnInit() {
    const cfg = this.config();
    if (cfg?.workDuration) this.workDuration.set(cfg.workDuration);
    if (cfg?.breakDuration) this.breakDuration.set(cfg.breakDuration);
    this.timeLeft.set(this.workDuration() * 60);
  }

  ngOnDestroy() {
    this.stopInterval();
  }

  protected startTimer() {
    if (this.running()) return;
    this.running.set(true);
    this.intervalId = setInterval(() => {
      this.timeLeft.update((t) => {
        if (t <= 1) {
          this.switchMode();
          return this.isWork() ? this.workDuration() * 60 : this.breakDuration() * 60;
        }
        return t - 1;
      });
    }, 1000);
  }

  protected pauseTimer() {
    this.running.set(false);
    this.stopInterval();
  }

  protected resetTimer() {
    this.running.set(false);
    this.stopInterval();
    this.isWork.set(true);
    this.timeLeft.set(this.workDuration() * 60);
  }

  private switchMode() {
    this.isWork.update((v) => !v);
  }

  private stopInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ========== RSS WIDGET ==========
@Component({
  selector: 'app-rss-widget',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="rss-widget">
      @if (feedData()) {
        @if (feedData()!.feedTitle) {
          <div class="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">{{ feedData()!.feedTitle }}</div>
        }
        <div class="feed-list flex flex-col gap-1 max-h-[250px] overflow-y-auto">
          @for (item of feedData()!.items; track item.link) {
            <a
              [href]="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="feed-item block px-2 py-1.5 rounded-md hover:bg-surface-secondary transition-colors no-underline"
            >
              <div class="text-sm text-ink leading-snug">{{ item.title }}</div>
              @if (item.pubDate) {
                <div class="text-xs text-ink-secondary mt-0.5">{{ item.pubDate | date:'mediumDate' }}</div>
              }
            </a>
          }
        </div>
      } @else {
        <div class="text-sm text-ink-secondary text-center py-4">
          Configure RSS feed URL
        </div>
      }

      <!-- Refresh button -->
      @if (feedUrl()) {
        <button
          class="w-full mt-2 px-3 py-1.5 text-xs font-medium rounded-md border border-border text-ink hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent"
          (click)="refreshFeed()"
        >
          Refresh
        </button>
      }
    </div>
  `,
})
export class RssWidgetComponent implements OnInit {
  readonly widgetId = input.required<string>();
  readonly config = input<any>({});
  private rssService = inject(RssService);

  protected feedData = signal<RssFeedData | null>(null);
  protected feedUrl = signal('');

  ngOnInit() {
    const cfg = this.config();
    if (cfg?.feedUrl) {
      this.feedUrl.set(cfg.feedUrl);
      this.refreshFeed();
    }
  }

  protected refreshFeed() {
    const cfg = this.config();
    if (!cfg?.feedUrl) return;
    this.rssService
      .getFeed(this.widgetId(), cfg.feedUrl, cfg.maxItems || 5)
      .subscribe({
        next: (data) => this.feedData.set(data),
      });
  }
}

// ========== GREETING WIDGET ==========
@Component({
  selector: 'app-greeting-widget',
  standalone: true,
  template: `
    <div class="greeting-widget p-2">
      <div class="text-lg font-semibold text-ink">{{ greeting() }}{{ userName() }}</div>
      @if (quote()) {
        <div class="text-sm text-ink-secondary mt-1 italic">"{{ quote() }}"</div>
      }
      @if (customMessage()) {
        <div class="text-sm text-ink-secondary mt-2">{{ customMessage() }}</div>
      }
    </div>
  `,
})
export class GreetingWidgetComponent implements OnInit {
  readonly config = input<any>({});
  private authService = inject(AuthService);

  protected greeting = signal('');
  protected userName = signal('');
  protected quote = signal('');
  protected customMessage = signal('');

  private quotes = [
    'The only way to do great work is to love what you do.',
    'Stay hungry, stay foolish.',
    'Every day is a new beginning.',
    'Small progress is still progress.',
    'Focus on being productive instead of busy.',
    'The secret of getting ahead is getting started.',
    'You don\'t have to be great to start, but you have to start to be great.',
  ];

  ngOnInit() {
    this.updateGreeting();
    this.quote.set(this.quotes[Math.floor(Math.random() * this.quotes.length)]);

    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(`, ${user.displayName || user.username}`);
    }

    if (this.config()?.customMessage) {
      this.customMessage.set(this.config().customMessage);
    }
  }

  private updateGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting.set('Good morning');
    else if (hour < 18) this.greeting.set('Good afternoon');
    else this.greeting.set('Good evening');
  }
}

// ========== MAIN DASHBOARD PAGE ==========
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    FormsModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ModalComponent,
    ConfirmDialogComponent,
    ColorSwatchPickerComponent,
    ClockWidgetComponent,
    NotesWidgetComponent,
    TodoWidgetComponent,
    LinksWidgetComponent,
    WeatherWidgetComponent,
    PomodoroWidgetComponent,
    RssWidgetComponent,
    GreetingWidgetComponent,
  ],
  template: `
    <!-- Loading state -->
    @if (loading()) {
      <div class="widget-grid">
        <app-loading-skeleton type="card" [count]="6" />
      </div>
    }

    <!-- Error state -->
    @if (error() && !loading()) {
      <app-error-state
        [message]="error()"
        retryLabel="Retry"
        (retry)="loadDashboard()"
      />
    }

    <!-- Populated dashboard -->
    @if (!loading() && !error() && dashboard()) {
      <!-- Dashboard header -->
      <div class="dashboard-header flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-ink">{{ dashboard()?.name }}</h2>
          <p class="text-sm text-ink-secondary mt-0.5">{{ dashboard()?.widgets?.length || 0 }} widgets</p>
        </div>
        <button
          class="add-widget-btn flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors cursor-pointer border-none"
          (click)="showWidgetPicker.set(true)"
        >
          <span class="text-lg leading-none">+</span>
          Add Widget
        </button>
      </div>

      <!-- Widget grid -->
      @if ((dashboard()?.widgets?.length ?? 0) > 0) {
        <div class="widget-grid" [style.grid-template-columns]="gridColumns()">
          @for (widget of dashboard()?.widgets || []; track widget.id) {
            <div
              class="widget-card"
              [class.widget-dragging]="draggingWidgetId() === widget.id"
              [class.widget-small]="widget.size === 'small'"
              [class.widget-large]="widget.size === 'large'"
              draggable="true"
              (dragstart)="onDragStart(widget, $event)"
              (dragover)="onDragOver($event)"
              (drop)="onDrop(widget, $event)"
              (dragend)="onDragEnd()"
            >
              <!-- Widget header -->
              <div class="widget-header">
                <div class="flex items-center gap-2">
                  <span class="drag-handle cursor-grab text-ink-secondary opacity-40 hover:opacity-70 text-sm">☰</span>
                  <span class="text-sm font-medium text-ink">{{ widget.title || widgetTypeName(widget.type) }}</span>
                </div>
                <div class="flex items-center gap-1 relative">
                  <button
                    class="p-1 text-ink-secondary hover:text-ink rounded hover:bg-surface-secondary transition-colors cursor-pointer bg-transparent border-none text-sm"
                    (click)="toggleConfigPanel(widget)"
                  >
                    ⋮
                  </button>
                  @if (configWidgetId() === widget.id) {
                    <div class="config-panel absolute right-0 top-full mt-1 w-64 bg-surface border border-border rounded-lg shadow-lg p-4 z-40">
                      <div class="flex flex-col gap-3">
                        <div>
                          <label class="block text-xs font-medium text-ink-secondary mb-1">Title</label>
                          <input
                            type="text"
                            [value]="widget.title || ''"
                            (change)="updateWidgetTitle(widget, $event)"
                            class="w-full px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-ink outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-ink-secondary mb-1">Accent Color</label>
                          <app-color-swatch-picker [(selectedHex)]="accentColor" />
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-ink-secondary mb-1">Size</label>
                          <div class="flex gap-2">
                            @for (size of ['small', 'medium', 'large']; track size) {
                              <button
                                class="flex-1 px-2 py-1 text-xs rounded-md border transition-colors cursor-pointer"
                                [class.bg-primary]="widget.size === size"
                                [class.text-white]="widget.size === size"
                                [class.border-primary]="widget.size === size"
                                [class.border-border]="widget.size !== size"
                                [class.text-ink]="widget.size !== size"
                                (click)="updateWidgetSize(widget, size)"
                              >
                                {{ size.charAt(0).toUpperCase() + size.slice(1) }}
                              </button>
                            }
                          </div>
                        </div>
                        <div class="flex gap-2 pt-1">
                          <button
                            class="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer border-none"
                            (click)="configWidgetId.set(null)"
                          >
                            Close
                          </button>
                          <button
                            class="px-3 py-1.5 text-xs font-medium rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer border-none"
                            (click)="confirmDeleteWidget(widget)"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Widget content -->
              <div class="widget-content">
                @switch (widget.type) {
                  @case ('clock') {
                    <app-clock-widget [config]="widget.config" />
                  }
                  @case ('notes') {
                    <app-notes-widget [widgetId]="widget.id" [config]="widget.config" />
                  }
                  @case ('todo') {
                    <app-todo-widget [widgetId]="widget.id" [config]="widget.config" />
                  }
                  @case ('links') {
                    <app-links-widget [widgetId]="widget.id" [config]="widget.config" />
                  }
                  @case ('weather') {
                    <app-weather-widget [widgetId]="widget.id" [config]="widget.config" />
                  }
                  @case ('pomodoro') {
                    <app-pomodoro-widget [config]="widget.config" />
                  }
                  @case ('rss') {
                    <app-rss-widget [widgetId]="widget.id" [config]="widget.config" />
                  }
                  @case ('greeting') {
                    <app-greeting-widget [config]="widget.config" />
                  }
                  @default {
                    <div class="text-sm text-ink-secondary">Unknown widget type: {{ widget.type }}</div>
                  }
                }
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty state -->
        <app-empty-state
          icon="📊"
          title="No widgets yet"
          description="Add your first widget to start building your dashboard."
          actionLabel="Add Widget"
          (action)="showWidgetPicker.set(true)"
        />
      }
    }

    <!-- Widget Picker Modal -->
    <app-modal title="Add Widget" [visible]="showWidgetPicker()" (close)="showWidgetPicker.set(false)">
      <div class="widget-picker-grid grid grid-cols-2 gap-3">
        @for (def of widgetDefinitions; track def.type) {
          <button
            class="picker-card flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer bg-surface"
            (click)="addWidget(def.type)"
          >
            <span class="text-3xl">{{ def.icon }}</span>
            <span class="text-sm font-medium text-ink">{{ def.name }}</span>
          </button>
        }
      </div>
    </app-modal>

    <!-- Delete confirm dialog -->
    <app-confirm-dialog
      title="Delete Widget"
      [message]="'Are you sure you want to delete this widget?'"
      confirmLabel="Delete"
      [danger]="true"
      [visible]="showDeleteConfirm()"
      (confirm)="deleteWidget()"
      (cancel)="showDeleteConfirm.set(false)"
    />
  `,
  styles: [
    `\n      .widget-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: var(--space-lg);
        align-items: start;
      }

      .widget-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
      }
      .widget-card:hover {
        box-shadow: var(--shadow-md);
        border-color: color-mix(in srgb, var(--color-primary) 20%, var(--color-border));
      }

      .widget-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid var(--color-border);
      }

      .widget-content {
        padding: 16px;
      }

      .widget-small {
        grid-column: span 1;
      }

      .widget-large {
        grid-column: span 2;
      }

      @media (max-width: 640px) {
        .widget-grid {
          grid-template-columns: 1fr !important;
        }
        .widget-large {
          grid-column: span 1;
        }
      }

      @media (min-width: 641px) and (max-width: 1024px) {
        .widget-grid {
          grid-template-columns: repeat(2, 1fr) !important;
        }
      }

      .widget-card {
        animation: widget-appear 250ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .widget-card:nth-child(1) { animation-delay: 0ms; }
      .widget-card:nth-child(2) { animation-delay: 40ms; }
      .widget-card:nth-child(3) { animation-delay: 80ms; }
      .widget-card:nth-child(4) { animation-delay: 120ms; }
      .widget-card:nth-child(5) { animation-delay: 160ms; }
      .widget-card:nth-child(6) { animation-delay: 200ms; }

      .widget-dragging {
        opacity: 0.5;
        box-shadow: var(--shadow-widget-drag) !important;
      }

      .config-panel {
        transform-origin: top right;
        animation: dropdown-appear 100ms ease-out both;
      }

      .picker-card {
        border-radius: var(--radius-lg);
        min-height: 110px;
        transition: all 0.15s;
      }
      .picker-card:hover {
        border-color: var(--color-primary) !important;
        background: var(--color-primary-subtle) !important;
        transform: translateY(-2px);
      }

      @keyframes dropdown-appear {
        from { opacity: 0; transform: translateY(-4px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes widget-appear {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `,
  ],
})
export class DashboardPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected dashboardService = inject(DashboardService);
  protected widgetService = inject(WidgetService);
  protected authService = inject(AuthService);
  protected toastService = inject(ToastService);

  protected dashboard = signal<Dashboard | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected showWidgetPicker = signal(false);
  protected showDeleteConfirm = signal(false);
  protected configWidgetId = signal<string | null>(null);
  protected draggingWidgetId = signal<string | null>(null);
  protected deleteTargetWidget = signal<WidgetInstance | null>(null);
  protected accentColor = signal('#4F46E5');

  protected widgetDefinitions = [
    { type: 'clock', name: 'Clock', icon: '🕐' },
    { type: 'notes', name: 'Quick Notes', icon: '📝' },
    { type: 'todo', name: 'Todo List', icon: '✅' },
    { type: 'links', name: 'Quick Links', icon: '🔗' },
    { type: 'weather', name: 'Weather', icon: '🌤️' },
    { type: 'pomodoro', name: 'Pomodoro', icon: '🍅' },
    { type: 'rss', name: 'RSS Reader', icon: '📡' },
    { type: 'greeting', name: 'Greeting', icon: '👋' },
  ];

  protected gridColumns = computed(() => {
    const cols = this.dashboard()?.layoutConfig?.columns || 3;
    return `repeat(${cols}, 1fr)`;
  });

  ngOnInit() {
    this.loadDashboard();
  }

  protected loadDashboard() {
    this.loading.set(true);
    this.error.set('');
    const slug = this.route.snapshot.paramMap.get('slug');

    const request = slug
      ? this.dashboardService.getBySlug(slug)
      : this.dashboardService.getById('default');

    request.subscribe({
      next: (dash) => {
        this.dashboard.set(dash);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to load dashboard');
      },
    });
  }

  protected widgetTypeName(type: string): string {
    const def = this.widgetDefinitions.find((w) => w.type === type);
    return def?.name || type;
  }

  protected addWidget(type: string) {
    const dashId = this.dashboard()?.id;
    if (!dashId) return;

    this.widgetService
      .create(dashId, {
        type,
        size: 'medium',
        config: this.getDefaultConfig(type),
      })
      .subscribe({
        next: (widget) => {
          this.dashboard.update((d) => {
            if (!d) return d;
            return { ...d, widgets: [...(d.widgets || []), widget] };
          });
          this.showWidgetPicker.set(false);
          this.toastService.success('Widget added');
        },
        error: () => {
          this.toastService.error('Failed to add widget');
        },
      });
  }

  private getDefaultConfig(type: string): any {
    switch (type) {
      case 'clock':
        return { format24h: false, showSeconds: false, timezone: 'local' };
      case 'notes':
        return {};
      case 'todo':
        return {};
      case 'links':
        return {};
      case 'weather':
        return { location: 'London', units: 'metric' };
      case 'pomodoro':
        return { workDuration: 25, breakDuration: 5 };
      case 'rss':
        return { feedUrl: '', maxItems: 5 };
      case 'greeting':
        return { customMessage: '' };
      default:
        return {};
    }
  }

  protected onDragStart(widget: WidgetInstance, event: DragEvent) {
    this.draggingWidgetId.set(widget.id);
    event.dataTransfer?.setData('text/plain', widget.id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  protected onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onDrop(targetWidget: WidgetInstance, event: DragEvent) {
    event.preventDefault();
    const sourceId = this.draggingWidgetId();
    if (!sourceId || sourceId === targetWidget.id) {
      this.draggingWidgetId.set(null);
      return;
    }

    const widgets = [...(this.dashboard()?.widgets || [])];
    const sourceIdx = widgets.findIndex((w) => w.id === sourceId);
    const targetIdx = widgets.findIndex((w) => w.id === targetWidget.id);

    if (sourceIdx === -1 || targetIdx === -1) {
      this.draggingWidgetId.set(null);
      return;
    }

    const [removed] = widgets.splice(sourceIdx, 1);
    widgets.splice(targetIdx, 0, removed);

    const reordered = widgets.map((w, i) => ({ ...w, position: i }));
    this.dashboard.update((d) => (d ? { ...d, widgets: reordered } : d));

    const widgetIds = reordered.map((w) => w.id);
    const dashId = this.dashboard()?.id;
    if (dashId) {
      this.widgetService.reorder(dashId, widgetIds).subscribe({
        error: () => this.toastService.error('Failed to reorder'),
      });
    }

    this.draggingWidgetId.set(null);
  }

  protected onDragEnd() {
    this.draggingWidgetId.set(null);
  }

  protected toggleConfigPanel(widget: WidgetInstance) {
    if (this.configWidgetId() === widget.id) {
      this.configWidgetId.set(null);
    } else {
      this.configWidgetId.set(widget.id);
    }
  }

  protected updateWidgetTitle(widget: WidgetInstance, event: Event) {
    const input = event.target as HTMLInputElement;
    this.widgetService.update(widget.id, { title: input.value }).subscribe({
      next: () => {
        this.dashboard.update((d) => {
          if (!d) return d;
          return {
            ...d,
            widgets: d.widgets?.map((w) =>
              w.id === widget.id ? { ...w, title: input.value } : w
            ),
          };
        });
      },
    });
  }

  protected updateWidgetSize(widget: WidgetInstance, size: string) {
    this.widgetService
      .update(widget.id, { size: size as 'small' | 'medium' | 'large' })
      .subscribe({
        next: () => {
          this.dashboard.update((d) => {
            if (!d) return d;
            return {
              ...d,
              widgets: d.widgets?.map((w) =>
                w.id === widget.id ? { ...w, size: size as 'small' | 'medium' | 'large' } : w
              ),
            };
          });
        },
      });
  }

  protected confirmDeleteWidget(widget: WidgetInstance) {
    this.deleteTargetWidget.set(widget);
    this.showDeleteConfirm.set(true);
    this.configWidgetId.set(null);
  }

  protected deleteWidget() {
    const widget = this.deleteTargetWidget();
    if (!widget) return;
    this.showDeleteConfirm.set(false);

    this.widgetService.delete(widget.id).subscribe({
      next: () => {
        this.dashboard.update((d) => {
          if (!d) return d;
          return {
            ...d,
            widgets: d.widgets?.filter((w) => w.id !== widget.id),
          };
        });
        this.toastService.success('Widget deleted');
      },
      error: () => {
        this.toastService.error('Failed to delete widget');
      },
    });
  }
}
