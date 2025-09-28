<script lang="ts" module>

    export type Defaults =
        'initials' |
        'color' |
        '404' |
        'mp' |
        'identicon' |
        'monsterid' |
        'retro' |
        'robohash' |
        'blank' |
        string;

    export type Rating =
        'g' |
        'pg' |
        'r' |
        'x'

    export const GravatarURL = new URL(`https://gravatar.com/avatar`);

</script>

<script lang="ts">


    import type {HTMLImgAttributes} from "svelte/elements";

    const {
        email,
        defaults = 'mp',
        rating = 'g',
        initials,
        name,
        size = 80,
        force_default = false,
        ...restProps
    }: {
        email: string,
        defaults?: Defaults,
        force_default?: boolean,
        rating?: Rating,
        initials?: string,
        name?: string,
        size?: number,
    } & HTMLImgAttributes = $props()

    let src = $state<string>();
    $effect.pre(() => {
        const encoded = new TextEncoder().encode(email)
        crypto.subtle.digest('SHA-256', encoded)
            .then((digest) => {
                const hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
                return hashArray
                    .map((b) => b.toString(16).padStart(2, "0"))
                    .join("");
            })
            .then((hash) => {
                const url = new URL(GravatarURL)
                url.pathname = `/avatar/${hash}`
                url.searchParams.set("s", size.toString())
                url.searchParams.set("d", defaults)
                if (force_default) url.searchParams.set("f", 'y')
                url.searchParams.set("r", rating)
                if (initials) url.searchParams.set("initials", initials)
                if (name) url.searchParams.set("name", name)
                src = url.toString()
            })
    })

</script>

<img {src} alt={restProps?.['alt']} {...restProps}/>
