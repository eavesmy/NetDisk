<script>
	export let Title;

	import { navigate } from "svelte-routing";

	import { onMount } from 'svelte';
	import moment from 'moment';

	import Modal from './Modal.svelte';
	import C_Img from './lib/Img.svelte';
	import C_Music from './lib/Music.svelte';

	import { Post } from './lib/net.js';
	import { Host, Path_Index, Path_Info } from './lib/const.js';

	let _root = "";
	let _total = 0;
	let _size = "0 MB";
	let _data = [];
	let _locate = "";
	let _localCount = 0;

	let C_Default = C_Music; // 写一个 default 的组件

	let History = [];

	let Select = {
		FileName: "",
		Type: "",
		Component: C_Default,
		FilePath: "",
	};
	
	onMount(async function(){
		moment.locale("cn");
		await GetIndex();
	});

	function getQueryString(name){

		let q = location.search;

		if (q.indexOf("?") === -1) return "";
		let strs = q.substr(1).split("&");
		for(let item of strs) {
			let d = item.split("=");
			if(d[0] === name) return decodeURI(d[1]);
		}
		return "";
	}

	async function GetIndex(){

		let subPath = getQueryString("location") || "";
		if(subPath == "/") subPath = "";

		let res = await Post(Host + Path_Info);
		_root = res.Data.Root;
		_total = res.Data.Total;
		_size = (res.Data.Size / 8 / 1024 / 1024).toFixed(2) + " MB" || "0 MB";

		res = await Post(Host + Path_Index,{
			Path: _root + subPath,
		});

		_localCount = 0;
		for(let item of res.Data) {
			_localCount ++;
			item.LastModify = moment(item.LastModify).format("YYYY-MM-DD hh:mm:ss");
			item.Size = (item.Size / 8 / 1024 / 1024).toFixed(2) + " MB";

			if(!item.IsDir) {
				item.Type = item.FileName.substr(item.FileName.lastIndexOf(".") + 1);
			}
		}
		if(!!subPath) {
			let qs = subPath.split("/");
			let q = qs.splice(0,qs.length - 1).join("/");
			res.Data.unshift({
				FileName: "../",
				IsDir: true,
				LastModify: "",
				Path: _root + q,
				Size: "",
				Type: ""
			})
		}
		_data = res.Data;
	}

	function Jump(){
		const $this = this;
		let isDir = $this.getAttribute("data-isDir");
		let fileName = $this.getAttribute("data-fileName");
		Select = JSON.parse($this.getAttribute("data"));

		if(isDir && isDir !== "false") {
			let _path = Select.Path.split("/");

			if(fileName !== "../") _path.push(fileName);

			_locate  = _path.splice(3,_path.length).join("/");

			history.pushState({},"网盘 " + fileName,"?location=/" + _locate);
			GetIndex();
		} else {
			Select.Type = (fileName.split(".").reverse())[0];
			Select.FilePath = Select.Path + "/" + fileName ;

			if(["jpg","png","jpge"].indexOf(Select.Type)) {
				Select.Component = C_Img;
			}
			if(Select.Type == "mp3") Select.Component = C_Music;
			console.log(Select.Component);

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
					<span>
						根目录: {_root}
					</span>
				</p>
				<p>
					<span>
						共 {_total} 个文件 {_size}
					</span>
				</p>
				<!--
				<p>
					<button class="button is-success" on:click={SelectAll}>全选/反选</button>
				</p>
				-->
				<p>
					当前页文件数量: {_localCount}
				</p>
			</div>
			<div class="field">
				<table class="table is-fullwidth">
					<thead>
						<th></th>
						<th>格式</th>
						<th>文件名</th>
						<th>大小</th>
						<th>操作</th>
						<th>修改日期</th>
					</thead>
					<tbody>
						{#each _data as item}
							<tr>
								<td></td>
								<td> 
									<span class="{!item.IsDir? 'button is-info is-small':''}" >
										{item.Type}
									</span>
								</td>
							    <td>
									<a href="javascript:void(0)" on:click={Jump} data-fileName={item.FileName} data-isDir={item.IsDir} data={JSON.stringify(item)}> {item.FileName} </a>
								</td>
								<td>
									{item.Size}
								</td>
								<td>
									<div class="control">
										<button class="button is-default is-small">重命名</button>
										<button class="button is-default is-small">删除</button>
										<button class="button is-default is-small">移动到</button>
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
