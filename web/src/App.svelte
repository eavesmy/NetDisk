<script>
	export let Title;

	import { onMount } from 'svelte';

	import Modal from './Modal.svelte';
	import C_Img from './lib/Img.svelte';

	import { Post } from './lib/net.js';
	import { Host, Path_Index, Path_Info } from './lib/const.js';

	let _root = "";
	let _total = 0;
	let _data = [];

	let C_Default = C_Img; // 写一个 default 的组件

	let Select = {
		FileName: "",
		Type: "",
		Component: C_Default,
		FilePath: "",
	};
	
	onMount(async function(){
		await GetIndex()
	});

	async function GetIndex(subPath = ""){
		let res = await Post(Host + Path_Info);
		_root = res.Data.Root;
		_total = res.Data.Total;

		res = await Post(Host + Path_Index,{
			Path: _root + subPath,
		});
		_data = res.Data;
	}

	GetIndex();

	function Jump(){
		const $this = this;
		let isDir = $this.getAttribute("data-isDir");
		let fileName = $this.getAttribute("data-fileName");

		if(isDir && isDir !== "false") {
			GetIndex("/" + fileName)
		} else {
			Select = JSON.parse($this.getAttribute("data"));
			Select.Type = (fileName.split(".").reverse())[0];
			Select.FilePath = Select.Path + "/" + fileName ;
			if(["jpg","png","jpge"].indexOf(Select.Type)) {
				Select.Component = C_Img;
			}

			document.querySelector("#modal").className += " is-active";
			// TODO: 打开预览
		}
	}

	function SelectAll(){
		let boxs = document.querySelectorAll(".checkbox");

		for(let box of boxs) {
			box.checked = !box.checked;
		}
	}

</script>

<main>
	<div class="card">
		<header class="card-header">
			<p class="title">{Title}</p>
		</header>
		<div class="card-content">
			<div class="field">
				<p>
					根目录: {_root}
				</p>
				<p>
					共 {_total} 个文件
				</p>
				<p>
					<button class="button is-success" on:click={SelectAll}>全选/反选</button>
				</p>
			</div>
			<div class="field">
				<table class="table is-fullwidth">
					<thead>
						<th></th>
						<th>预览</th>
						<th>文件名</th>
						<th>操作</th>
						<th>修改日期</th>
					</thead>
					<tbody>
						{#each _data as item}
							<tr>
								<td><input class="checkbox" type="checkbox"></td>
								<td> <img src="" alt=""> </td>
							    <td>
									<a href="javascript:void(0)" on:click={Jump} data-fileName={item.FileName} data-isDir={item.IsDir} data={JSON.stringify(item)}> {item.FileName} </a>
								</td>
								<td>
									<div class="control">
										<button class="button is-primary">重命名</button>
										<button class="button is-primary">删除</button>
										<button class="button is-primary">移动到</button>
									</div>
								</td>
								<td>{item.LastModify}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<Modal {...Select}/>
</main>

<style>
	header {
		padding: 20px 5vw;
	}
</style>
