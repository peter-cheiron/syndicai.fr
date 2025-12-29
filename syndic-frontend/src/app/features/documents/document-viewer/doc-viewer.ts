// my-doc-viewer.component.ts
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-doc-viewer',
  styles: `
  /* document-look.css */
.doc-root {
  max-width: 800px;
  margin: 1rem auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.06);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111827;
  line-height: 1.5;
}

.doc-title {
  font-size: 1.6rem;
  margin: 0 0 1.25rem;
  font-weight: 600;
}

.doc-section + .doc-section {
  margin-top: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
}

.doc-heading {
  font-size: 1rem;
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: #374151;
}

.doc-paragraph {
  margin: 0.125rem 0 0.35rem;
  font-size: 0.93rem;
}

.doc-null,
.doc-empty {
  color: #9ca3af;
  font-style: italic;
}

.doc-list {
  margin: 0.15rem 0 0.5rem 1rem;
  padding-left: 1rem;
}

.doc-list-item {
  margin-bottom: 0.2rem;
}

  `,
  imports: [CommonModule],
  template: `
    <div [innerHTML]="html()"></div>
  `,
})
export class DocViewerComponent {
  data = input<unknown>();
  title = input<string | undefined>();

  html = computed(() =>
    renderJsonAsDocument(this.data(), { title: this.title() })
  );
}


// json-document-renderer.ts
export interface RenderOptions {
  title?: string;                 // optional top-level title
  maxDepthHeading?: number;       // starting heading level (1–6)
}

export function renderJsonAsDocument(
  data: unknown,
  options: RenderOptions = {}
): string {
  const { title, maxDepthHeading = 2 } = options;

  const parts: string[] = [];
  parts.push('<div class="doc-root">');

  if (title) {
    parts.push(`<h1 class="doc-title">${escapeHtml(title)}</h1>`);
  }

  parts.push(renderValue(data, 0, maxDepthHeading));

  parts.push('</div>');
  return parts.join('');
}

function renderValue(
  value: unknown,
  depth: number,
  headingLevel: number
): string {
  if (value === null || value === undefined) {
    return `<p class="doc-paragraph doc-null">—</p>`;
  }

  const t = typeof value;

  if (t === 'string' || t === 'number' || t === 'boolean') {
    return `<p class="doc-paragraph">${escapeHtml(String(value))}</p>`;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `<p class="doc-paragraph doc-empty">[empty]</p>`;
    }
    const items = value
      .map(item => `<li class="doc-list-item">${renderValue(item, depth + 1, headingLevel)}</li>`)
      .join('');
    return `<ul class="doc-list">${items}</ul>`;
  }

  // Object
  const obj = value as Record<string, unknown>;
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return `<p class="doc-paragraph doc-empty">{}</p>`;
  }

  const nextHeading = Math.min(headingLevel + depth, 6);

  const sections = entries
    .map(([key, val]) => {
      const label = prettifyKey(key);
      const headingTag = `h${Math.min(nextHeading, 6)}`;
      return `
        <section class="doc-section">
          <${headingTag} class="doc-heading">${escapeHtml(label)}</${headingTag}>
          ${renderValue(val, depth + 1, headingLevel)}
        </section>
      `;
    })
    .join('');

  return sections;
}

// Make keys look nicer: "user_name" -> "User name", "createdAt" -> "Created at"
function prettifyKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')   // camelCase → camel Case
    .replace(/[_\-]+/g, ' ')                 // snake_case, kebab → spaces
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

// Basic HTML escaping (important if data can come from users)
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
