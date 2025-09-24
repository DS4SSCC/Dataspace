<script lang="ts">

    const props: HTMLInputElement & {type: 'text', style?:string} = $props()

</script>

<input type="text" {...props} />
