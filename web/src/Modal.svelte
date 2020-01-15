<script>
	export let FileName;
	export let Type;
	export let Component;
	export let FilePath;
	
	function closeModal(){
		const $this = this;
		document.querySelectorAll(".modal").forEach(it => {
			it.className = "modal";
		});
	}
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
					<Component {FilePath}/>
				</div>
			</div>
		</div>
		<button class="modal-close is-large" aria-label="close" on:click={closeModal}></button>
	</div>
</div>

<style> </style>
