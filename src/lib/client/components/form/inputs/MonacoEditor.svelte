<script lang="ts" module>
    import type * as Library from 'monaco-editor';
    import type {MaybePromise} from "$lib/server/types/MaybePromise";
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import {onDestroy, onMount} from 'svelte';
    import {sizes, type Sizes} from '$lib/client/helpers/sizes.helper';

    export type Monaco = typeof Library

    export type MountFN = (input: {
        Monaco: typeof Library,
        editor: Library.editor.IStandaloneCodeEditor
    }) => MaybePromise<any>
</script>

<script lang="ts">


    // Types for responsive configuration

    type ResponsiveFeature = 'editor' | 'linenumbers' | 'minimap';
    type ResponsiveConfig = Partial<Record<Sizes, ResponsiveFeature[]>>;

    // Enhanced props with editor configuration options and responsive controls
    let {
        value = $bindable(),
        onchange,
        theme = 'auto',
        lineNumbers = 'on',
        minimap = {enabled: true},
        fontSize = 16,
        wordWrap = 'off',
        tabSize = 2,
        scrollBeyondLastLine = false,
        padding = {top: 12, bottom: 12},
        language,
        readOnly = false,
        // Responsive breakpoint configurations
        xs,
        sm,
        md,
        lg,
        xl,
        xxl,
        style,
        ...restProps
    }:
        Library.editor.IStandaloneEditorConstructionOptions &
        {
            onchange?: (input: { value: string, editor: Library.editor.IStandaloneCodeEditor }) => unknown,
            onmount?: MountFN[],
            roundedCorners?: boolean,
            height?: string,
            // Responsive props
            xs?: ResponsiveFeature[],
            sm?: ResponsiveFeature[],
            md?: ResponsiveFeature[],
            lg?: ResponsiveFeature[],
            xl?: ResponsiveFeature[],
            xxl?: ResponsiveFeature[],
            style?: string,
        }
        = $props();

    let ready = $state(false);
    let element = $state<HTMLDivElement>();
    let editor: Library.editor.IStandaloneCodeEditor;
    let themeObserver: MutationObserver;
    let currentResolvedTheme = $state<string>();
    let currentBreakpoint = $state<Sizes>('xs');
    let isEditorVisible = $state(true);
    let isUpdatingFromExternal = false; // Flag to prevent infinite loops

    // Default responsive configuration - progressive enhancement
    const defaultResponsiveConfig: ResponsiveConfig = {
        xs: ['editor'],                              // Basic editor only on mobile
        sm: ['editor', 'linenumbers'],              // Add line numbers on small tablets
        md: ['editor', 'linenumbers', 'minimap'],   // Add minimap on medium+ screens
        lg: ['editor', 'linenumbers', 'minimap'],   // All features on large screens
        xl: ['editor', 'linenumbers', 'minimap'],   // All features on xl screens
        xxl: ['editor', 'linenumbers', 'minimap']   // All features on xxl screens
    };

    // Merge user config with defaults (user config takes precedence)
    const responsiveConfig: ResponsiveConfig = {
        xs: xs ?? defaultResponsiveConfig.xs,
        sm: sm ?? defaultResponsiveConfig.sm,
        md: md ?? defaultResponsiveConfig.md,
        lg: lg ?? defaultResponsiveConfig.lg,
        xl: xl ?? defaultResponsiveConfig.xl,
        xxl: xxl ?? defaultResponsiveConfig.xxl
    };

    // Function to get current breakpoint based on window width
    function getCurrentBreakpoint(): Sizes {
        const width = window.innerWidth;
        const breakpointEntries = Object.entries(sizes)
            .sort(([, a], [, b]) => b.breakpoint - a.breakpoint);

        for (const [size, config] of breakpointEntries) {
            if (width >= config.breakpoint) {
                return size as Sizes;
            }
        }
        return 'xs';
    }

    // Function to check if a feature should be visible at current breakpoint
    function isFeatureVisible(feature: ResponsiveFeature): boolean {
        const currentConfig = responsiveConfig[currentBreakpoint];
        if (!currentConfig) return true; // Default to visible if no config
        return currentConfig.includes(feature);
    }

    // Function to get responsive editor options
    function getResponsiveEditorOptions() {
        const showLineNumbers = isFeatureVisible('linenumbers');
        const showMinimap = isFeatureVisible('minimap');

        return {
            lineNumbers: showLineNumbers ? lineNumbers : 'off' as Library.editor.LineNumbersType,
            minimap: {
                enabled: showMinimap ? (typeof minimap === 'object' ? minimap.enabled : minimap) : false
            }
        };
    }

    // Function to update editor options based on current breakpoint
    function updateEditorResponsiveOptions() {
        if (!editor) return;

        const responsiveOptions = getResponsiveEditorOptions();
        editor.updateOptions(responsiveOptions);
    }

    // Function to handle visibility of entire editor
    function updateEditorVisibility() {
        isEditorVisible = isFeatureVisible('editor');
    }

    // Function to get the current theme based on data-theme attribute or media query fallback
    function getCurrentTheme(): string {
        if (theme !== 'auto') return theme;

        const rootElement = document.documentElement;
        const dataTheme = rootElement.getAttribute('data-theme');

        if (dataTheme === 'dark') return 'vs-dark';
        if (dataTheme === 'light') return 'vs';

        // Fallback to media query if data-theme is not set
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        return mediaQuery.matches ? 'vs-dark' : 'vs';
    }

    // Function to update the Monaco editor theme
    function updateEditorTheme(monaco: typeof Library) {
        const newTheme = getCurrentTheme();
        if (newTheme !== currentResolvedTheme) {
            currentResolvedTheme = newTheme;
            monaco.editor.setTheme(newTheme);
        }
    }

    // Function to handle window resize
    function handleResize() {
        const newBreakpoint = getCurrentBreakpoint();
        if (newBreakpoint !== currentBreakpoint) {
            currentBreakpoint = newBreakpoint;
            updateEditorResponsiveOptions();
            updateEditorVisibility();
        }
    }

    onMount(async () => {
        self.MonacoEnvironment = {
            getWorker: function (_: any, label: string) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker();
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return new htmlWorker();
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker();
                }
                return new editorWorker();
            }
        };

        const monaco = await import('monaco-editor');
        monaco.editor.onDidCreateEditor(() => ready = true);

        if (!element) return;

        // Set initial breakpoint and visibility
        currentBreakpoint = getCurrentBreakpoint();
        updateEditorVisibility();

        // Set initial theme
        currentResolvedTheme = getCurrentTheme();

        // Get initial responsive options
        const responsiveOptions = getResponsiveEditorOptions();

        // Create editor with enhanced configuration including responsive options
        editor = monaco.editor.create(element, {
            value,
            theme: currentResolvedTheme,
            automaticLayout: true,
            fontSize,
            wordWrap,
            tabSize,
            scrollBeyondLastLine,
            language,
            readOnly,
            padding,
            ...responsiveOptions,
            ...restProps
        });

        // Handle content changes
        editor.onDidChangeModelContent(() => {
            if (!isUpdatingFromExternal) {
                value = editor.getValue();
                onchange?.({value: editor.getValue(), editor});
            }
        });

        // Set up window resize listener for responsive behavior
        window.addEventListener('resize', handleResize);

        // Set up theme monitoring only if theme is 'auto'
        if (theme === 'auto') {
            // Monitor changes to the data-theme attribute on the root element
            themeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                        updateEditorTheme(monaco);
                    }
                });
            });

            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });

            // Also listen for media query changes as fallback
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleMediaChange = () => {
                // Only update if data-theme is not explicitly set
                const rootElement = document.documentElement;
                const dataTheme = rootElement.getAttribute('data-theme');
                if (!dataTheme) {
                    updateEditorTheme(monaco);
                }
            };

            mediaQuery.addEventListener('change', handleMediaChange);
        }

        if (restProps.onmount) restProps.onmount.forEach((onmount) => onmount({editor, Monaco: monaco}))

    });

    onDestroy(() => {
        editor?.dispose();
        themeObserver?.disconnect();
        window.removeEventListener('resize', handleResize);
    });

    // Reactive statement to handle theme prop changes
    $effect(() => {
        if (editor && theme !== 'auto') {
            currentResolvedTheme = theme;
            import('monaco-editor').then(monaco => {
                monaco.editor.setTheme(theme);
            });
        }
    });

    // Reactive statement to handle responsive config changes
    $effect(() => {
        if (editor) {
            // Recalculate when any responsive prop changes
            const _ = [xs, sm, md, lg, xl, xxl];
            updateEditorResponsiveOptions();
            updateEditorVisibility();
        }
    });

    // Handle external value and language changes
    $effect(() => {
        value;
        language; // Otherwise effect won't run for some reason...🤷‍♂️
        if (editor) {
            let needsUpdate = false;
            const model = editor.getModel();

            // Handle language changes
            if (language !== undefined && model) {
                const currentLanguage = model.getLanguageId();
                if (language !== currentLanguage) {
                    import('monaco-editor').then(monaco => {
                        monaco.editor.setModelLanguage(model, language);
                    });
                }
            }

            // Handle value changes
            if (value !== undefined) {
                const currentEditorValue = editor.getValue();
                if (value !== currentEditorValue) {
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                isUpdatingFromExternal = true;

                // Preserve cursor position and selection if possible
                const position = editor.getPosition();
                const selection = editor.getSelection();

                editor.setValue(value || '');

                // Restore cursor position if it's still valid
                if (position) {
                    const restoredModel = editor.getModel();
                    if (restoredModel) {
                        const lineCount = restoredModel.getLineCount();
                        const lastLineLength = restoredModel.getLineLength(lineCount);

                        // Check if the position is still valid
                        if (position.lineNumber <= lineCount) {
                            const maxColumn = position.lineNumber === lineCount
                                ? lastLineLength + 1
                                : restoredModel.getLineLength(position.lineNumber) + 1;

                            const validPosition = {
                                lineNumber: position.lineNumber,
                                column: Math.min(position.column, maxColumn)
                            };

                            editor.setPosition(validPosition);
                        }
                    }
                }

                // Restore selection if it's still valid
                if (selection) {
                    try {
                        editor.setSelection(selection);
                    } catch {
                        // Selection is no longer valid, ignore
                    }
                }

                isUpdatingFromExternal = false;
            }
        }
    });
</script>

<!-- Loading indicator -->
{#if !ready}
    <div class="loading-container">
        <span class="loading">Loading editor...</span>
    </div>
{/if}

<!-- Editor container with dynamic height and border radius -->
{#if isEditorVisible}
    <div
            class="container"
            {style}
            bind:this={element}
    ></div>
{:else}
    <div class="hidden-editor-placeholder">
        <span>Editor hidden on {currentBreakpoint} screens</span>
    </div>
{/if}

<style>
    .container {
        width: var(--editor-width, 100%);
        min-width: var(--editor-min-width, auto);
        height: var(--editor-height, 100%);
        min-height: var(--editor-min-height, 100px);
        padding: 0;
        border: var(--editor-border, 1px solid var(--color-border-primary));
        border-radius: var(--editor-border-radius, 8px);
        overflow: hidden;
        transition: box-shadow 0.3s ease;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--editor-width, 100%);
        min-width: var(--editor-min-width, auto);
        height: var(--editor-height, 100%);
        min-height: var(--editor-min-height, 100px);
        background-color: transparent;
    }

    .loading {
        color: #666;
    }

    .hidden-editor-placeholder {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100px;
        background-color: #f9f9f9;
        border: 1px dashed #ccc;
        border-radius: 8px;
        color: #999;
        font-style: italic;
    }

    /* Fix for Monaco editor corners - ensures content doesn't overflow the border radius */
    :global(.monaco-editor .overflow-guard) {
        border-radius: inherit;
    }
</style>
