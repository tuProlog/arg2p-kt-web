import type { ReactiveController, ReactiveControllerHost } from 'lit';

// The menus of a component: a <details class="menu"> with its summary, and a list of items (role="menuitem") under it
// (see menus in styles.ts)

/** Closes the menus open in [host] when anything else is clicked, or an item of theirs is picked */
export class Menus implements ReactiveController {
    constructor(private readonly host: ReactiveControllerHost & { renderRoot: ParentNode }) {
        host.addController(this);
    }

    hostConnected(): void {
        document.addEventListener('click', this.clicked);
    }

    hostDisconnected(): void {
        document.removeEventListener('click', this.clicked);
    }

    private readonly clicked = (event: Event): void => {
        const path = event.composedPath();
        const picked = path.some(it => it instanceof Element && it.getAttribute('role') === 'menuitem');
        this.host.renderRoot.querySelectorAll<HTMLDetailsElement>('details.menu[open]').forEach(menu => {
            if (picked || !path.includes(menu)) menu.open = false;
        });
    };
}
