<script lang="ts">

    const props: HTMLInputElement & {type: 'email', style?:string} = $props()

</script>

<input type="email" placeholder="example@email.com" {...props} />
