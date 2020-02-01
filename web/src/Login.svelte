<script>
	
	import md5 from 'md5';
	import { Host,Path_Login, _ } from './lib/const.js';
	import { Post } from './lib/net.js';
	import { navigate } from "svelte-routing";
	
	let pwd = "";
	let crypted = "";

	async function Login(){
		let res = await Post(Host + Path_Login,{
			'pwd': crypted
		});
		
		if(res.Msg === "success") {
			navigate("/",{replace: true});
		}
	}
	
	function Encode(){
		crypted = md5(pwd);
	}

</script>

<main>
	<div id="contain">
		<div class="box">
			<div class="field">
				<label class="label" for="">
					密钥
				</label>
				<div class="control">
					<input class="input" type="password" bind:value={pwd} on:keyup={Encode}/>
				</div>
			</div>
			<div class="field">
				<div class="control">
					<button class="button is-success" on:click={Login}>
						登陆
					</button>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	#contain {
		width: 500px;
		margin: 0 auto;
		margin-top: 10%;
	}
</style>
