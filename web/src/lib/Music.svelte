<script>

	import { afterUpdate } from 'svelte';

	export let Location;

	afterUpdate(async function(){
		console.log(Location,123)
	})
</script>
	
<video src="{Location}" height="100%" width="100%"></video>

<style></style>
