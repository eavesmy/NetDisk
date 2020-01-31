<script>

	export let FileName;
	export let Type;
	export let Component;
	export let FilePath;

	import { beforeUpdate } from 'svelte';
	import { Post } from './lib/net.js';
	import { Host, Path_Get } from './lib/const.js';
	
	function closeModal(){
		const $this = this;
		document.querySelectorAll(".modal").forEach(it => {
			it.className = "modal";
		});
	}

	let src = "";

	beforeUpdate(async function(){
		if(!FilePath) return;
		
		let res = await Post(Host + Path_Get,{
			Src: FilePath,
		})

		src = res.Data;
		console.log(src,Component);
	})

</script>

<div>
	<div id="modal" class="modal">
		<div class="modal-background" on:click={closeModal}></div>
		<div class="modal-content">
			<div class="card box">
				<header class="card-header subtitle is-5">
					{FileName}
				</header>
				<div class="card-content">
					<Component Location={src}/>
				</div>
				<footer class="card-footer">
					<a class="button is-success" href={src}>
						下载
					</a>
					<button class="button is-warning">
						删除
					</button>
				</footer>
			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
	</div>
</div>

<style> </style>
