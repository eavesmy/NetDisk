<script>

	import { beforeUpdate } from 'svelte';
	import { Post } from './net.js';
	import { Host, Path_Get } from './const.js';

	export let FilePath;

	let src = "";
	
	beforeUpdate(async function(){
		if(!FilePath) return;

		let src = "";
		
		let res = await Post(Host + Path_Get,{
			Src: FilePath,
		})

		src = res.Data;
	})
	
</script>

<c_img>
	<img src="{src}" alt="">
</c_img>

<style></style>
